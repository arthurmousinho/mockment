ALTER TABLE `events` ADD COLUMN `invoice_id` VARCHAR(191) NULL;

UPDATE `events` AS e
INNER JOIN `invoices` AS i ON i.`id` = JSON_UNQUOTE(JSON_EXTRACT(e.`payload`, '$.id'))
SET e.`invoice_id` = i.`id`
WHERE e.`type` IN ('INVOICE_CREATED', 'INVOICE_ISSUED', 'INVOICE_REJECTED', 'INVOICE_CANCELED')
  AND e.`payment_id` = i.`payment_id`;

CREATE INDEX `events_invoice_id_idx` ON `events`(`invoice_id`);

ALTER TABLE `events` ADD CONSTRAINT `events_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
