/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `external_id` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` ADD COLUMN `external_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `products_external_id_key` ON `products`(`external_id`);
