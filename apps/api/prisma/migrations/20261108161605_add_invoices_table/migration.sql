-- CreateTable
CREATE TABLE `invoices` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('CREATED', 'PROCESSING', 'ISSUED', 'REJECTED', 'CANCELED') NOT NULL DEFAULT 'CREATED',
    `customer_name` VARCHAR(191) NOT NULL,
    `customer_tax_id` VARCHAR(191) NULL,
    `amount_in_cents` INTEGER NOT NULL,
    `currency` ENUM('BRL', 'USD', 'EUR') NOT NULL,
    `payment_id` VARCHAR(191) NOT NULL,
    `issued_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `invoices_payment_id_customer_tax_id_idx`(`payment_id`, `customer_tax_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
