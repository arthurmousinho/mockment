/*
  Warnings:

  - Added the required column `customer_id` to the `checkouts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `checkouts` ADD COLUMN `customer_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `checkouts` ADD CONSTRAINT `checkouts_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
