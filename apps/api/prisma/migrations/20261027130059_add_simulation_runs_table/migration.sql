-- AlterTable
ALTER TABLE `simulation_scenarios` MODIFY `description` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `simulation_runs` (
    `id` VARCHAR(191) NOT NULL,
    `scenario_id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `current_step` INTEGER NOT NULL DEFAULT 0,
    `total_steps` INTEGER NOT NULL,
    `error` JSON NULL,
    `started_at` DATETIME(3) NULL,
    `finished_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `simulation_runs_scenario_id_idx`(`scenario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `simulation_runs` ADD CONSTRAINT `simulation_runs_scenario_id_fkey` FOREIGN KEY (`scenario_id`) REFERENCES `simulation_scenarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
