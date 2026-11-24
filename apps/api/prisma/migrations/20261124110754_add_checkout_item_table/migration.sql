-- CreateTable
CREATE TABLE `checkout_items` (
    `id` VARCHAR(191) NOT NULL,
    `checkout_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit_amount_in_cents` INTEGER NOT NULL,

    INDEX `checkout_items_checkout_id_idx`(`checkout_id`),
    INDEX `checkout_items_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `checkout_items` ADD CONSTRAINT `checkout_items_checkout_id_fkey` FOREIGN KEY (`checkout_id`) REFERENCES `checkouts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkout_items` ADD CONSTRAINT `checkout_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
