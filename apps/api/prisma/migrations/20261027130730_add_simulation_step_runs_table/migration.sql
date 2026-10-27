-- AlterTable
ALTER TABLE `simulation_runs` MODIFY `finished_at` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `simulation_step_runs` (
    `id` VARCHAR(191) NOT NULL,
    `run_id` VARCHAR(191) NOT NULL,
    `step_index` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
    `input` JSON NULL,
    `output` JSON NULL,
    `error` JSON NULL,
    `started_at` DATETIME(3) NULL,
    `finished_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `simulation_step_runs_run_id_status_idx`(`run_id`, `status`),
    UNIQUE INDEX `simulation_step_runs_run_id_step_index_key`(`run_id`, `step_index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `simulation_step_runs` ADD CONSTRAINT `simulation_step_runs_run_id_fkey` FOREIGN KEY (`run_id`) REFERENCES `simulation_runs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
