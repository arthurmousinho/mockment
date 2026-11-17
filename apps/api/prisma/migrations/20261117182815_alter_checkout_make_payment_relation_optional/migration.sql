-- DropForeignKey
ALTER TABLE `checkouts` DROP FOREIGN KEY `checkouts_payment_id_fkey`;

-- AlterTable
ALTER TABLE `checkouts` MODIFY `payment_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `checkouts` ADD CONSTRAINT `checkouts_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
