-- AlterTable
ALTER TABLE `checkouts` ADD COLUMN `completed_at` DATETIME(3) NULL,
    ADD COLUMN `expires_at` DATETIME(3) NULL;
