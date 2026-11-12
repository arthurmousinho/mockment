/*
  Warnings:

  - You are about to drop the column `customer_name` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `customer_tax_id` on the `invoices` table. All the data in the column will be lost.
  - Added the required column `customer_id` to the `invoices` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `invoices_customer_tax_id_idx` ON `invoices`;

-- AlterTable
ALTER TABLE `invoices` DROP COLUMN `customer_name`,
    DROP COLUMN `customer_tax_id`,
    ADD COLUMN `customer_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
