-- AlterTable
ALTER TABLE `payments` ADD COLUMN `customerId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
