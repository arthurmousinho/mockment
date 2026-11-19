-- DropForeignKey
ALTER TABLE `checkouts` DROP FOREIGN KEY `checkouts_customer_id_fkey`;

-- DropIndex
DROP INDEX `checkouts_customer_id_fkey` ON `checkouts`;

-- AlterTable
ALTER TABLE `checkouts` MODIFY `customer_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `checkouts` ADD CONSTRAINT `checkouts_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
