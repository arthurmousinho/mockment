/*
  Warnings:

  - You are about to drop the column `api_key_id` on the `checkouts` table. All the data in the column will be lost.
  - You are about to drop the column `api_key_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `api_key_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `apiKeyId` on the `webhook_endpoints` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[external_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idempotency_key]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `checkouts` DROP FOREIGN KEY `checkouts_api_key_id_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_api_key_id_fkey`;

-- DropForeignKey
ALTER TABLE `subscriptions` DROP FOREIGN KEY `subscriptions_api_key_id_fkey`;

-- DropForeignKey
ALTER TABLE `webhook_endpoints` DROP FOREIGN KEY `webhook_endpoints_apiKeyId_fkey`;

-- DropIndex
DROP INDEX `checkouts_api_key_id_idx` ON `checkouts`;

-- DropIndex
DROP INDEX `payments_api_key_id_external_id_key` ON `payments`;

-- DropIndex
DROP INDEX `payments_api_key_id_idempotency_key_key` ON `payments`;

-- DropIndex
DROP INDEX `subscriptions_api_key_id_fkey` ON `subscriptions`;

-- DropIndex
DROP INDEX `webhook_endpoints_apiKeyId_fkey` ON `webhook_endpoints`;

-- AlterTable
ALTER TABLE `checkouts` DROP COLUMN `api_key_id`;

-- AlterTable
ALTER TABLE `payments` DROP COLUMN `api_key_id`;

-- AlterTable
ALTER TABLE `subscriptions` DROP COLUMN `api_key_id`;

-- AlterTable
ALTER TABLE `webhook_endpoints` DROP COLUMN `apiKeyId`;

-- CreateIndex
CREATE UNIQUE INDEX `payments_external_id_key` ON `payments`(`external_id`);

-- CreateIndex
CREATE UNIQUE INDEX `payments_idempotency_key_key` ON `payments`(`idempotency_key`);
