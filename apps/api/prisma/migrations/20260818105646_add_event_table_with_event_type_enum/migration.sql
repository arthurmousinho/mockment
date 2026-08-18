-- AlterTable
ALTER TABLE `webhook_deliveries` ADD COLUMN `eventId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `events` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('PAYMENT_CREATED', 'PAYMENT_PROCESSING', 'PAYMENT_APPROVED', 'PAYMENT_DECLINED', 'PAYMENT_CANCELED', 'SUBSCRIPTION_CREATED', 'SUBSCRIPTION_ACTIVATED', 'SUBSCRIPTION_RENEWED', 'SUBSCRIPTION_PAUSED', 'SUBSCRIPTION_RESUMED', 'SUBSCRIPTION_CANCELED') NOT NULL,
    `payload` JSON NULL,
    `payment_id` VARCHAR(191) NULL,
    `subscription_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `events_type_idx`(`type`),
    INDEX `events_payment_id_idx`(`payment_id`),
    INDEX `events_subscription_id_idx`(`subscription_id`),
    INDEX `events_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_subscription_id_fkey` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `webhook_deliveries` ADD CONSTRAINT `webhook_deliveries_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
