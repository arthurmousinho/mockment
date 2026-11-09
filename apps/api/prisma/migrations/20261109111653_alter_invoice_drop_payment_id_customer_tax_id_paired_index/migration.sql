-- DropForeignKey
ALTER TABLE `invoices` DROP FOREIGN KEY `invoices_payment_id_fkey`;

-- DropIndex
DROP INDEX `invoices_payment_id_customer_tax_id_idx` ON `invoices`;

-- CreateIndex
CREATE INDEX `invoices_payment_id_idx` ON `invoices`(`payment_id`);

-- CreateIndex
CREATE INDEX `invoices_customer_tax_id_idx` ON `invoices`(`customer_tax_id`);

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
