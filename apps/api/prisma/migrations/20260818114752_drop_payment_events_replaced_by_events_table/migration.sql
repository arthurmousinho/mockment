/*
  Warnings:

  - You are about to drop the column `eventId` on the `webhook_deliveries` table. All the data in the column will be lost.
  - You are about to drop the column `payment_event_id` on the `webhook_deliveries` table. All the data in the column will be lost.
  - You are about to drop the `payment_events` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `event_id` to the `webhook_deliveries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `payment_events` DROP FOREIGN KEY `payment_events_payment_id_fkey`;

-- DropForeignKey
ALTER TABLE `webhook_deliveries` DROP FOREIGN KEY `webhook_deliveries_eventId_fkey`;

-- DropForeignKey
ALTER TABLE `webhook_deliveries` DROP FOREIGN KEY `webhook_deliveries_payment_event_id_fkey`;

-- DropIndex
DROP INDEX `webhook_deliveries_eventId_fkey` ON `webhook_deliveries`;

-- DropIndex
DROP INDEX `webhook_deliveries_payment_event_id_idx` ON `webhook_deliveries`;

-- AlterTable
ALTER TABLE `webhook_deliveries` DROP COLUMN `eventId`,
    DROP COLUMN `payment_event_id`,
    ADD COLUMN `event_id` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `payment_events`;

-- CreateIndex
CREATE INDEX `webhook_deliveries_event_id_idx` ON `webhook_deliveries`(`event_id`);

-- AddForeignKey
ALTER TABLE `webhook_deliveries` ADD CONSTRAINT `webhook_deliveries_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
