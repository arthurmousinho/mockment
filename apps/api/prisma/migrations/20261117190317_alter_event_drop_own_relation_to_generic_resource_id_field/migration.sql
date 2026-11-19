/*
  Warnings:

  - You are about to drop the column `invoice_id` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `payment_id` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_id` on the `events` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `events` DROP FOREIGN KEY `events_invoice_id_fkey`;

-- DropForeignKey
ALTER TABLE `events` DROP FOREIGN KEY `events_payment_id_fkey`;

-- DropForeignKey
ALTER TABLE `events` DROP FOREIGN KEY `events_subscription_id_fkey`;

-- DropIndex
DROP INDEX `events_invoice_id_idx` ON `events`;

-- DropIndex
DROP INDEX `events_payment_id_idx` ON `events`;

-- DropIndex
DROP INDEX `events_subscription_id_idx` ON `events`;

-- AlterTable
ALTER TABLE `events` DROP COLUMN `invoice_id`,
    DROP COLUMN `payment_id`,
    DROP COLUMN `subscription_id`,
    ADD COLUMN `resource_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `events_resource_id_idx` ON `events`(`resource_id`);
