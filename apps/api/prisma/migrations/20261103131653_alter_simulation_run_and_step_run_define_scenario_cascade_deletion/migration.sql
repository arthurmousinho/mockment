-- DropForeignKey
ALTER TABLE `simulation_runs` DROP FOREIGN KEY `simulation_runs_scenario_id_fkey`;

-- DropForeignKey
ALTER TABLE `simulation_step_runs` DROP FOREIGN KEY `simulation_step_runs_run_id_fkey`;

-- AddForeignKey
ALTER TABLE `simulation_runs` ADD CONSTRAINT `simulation_runs_scenario_id_fkey` FOREIGN KEY (`scenario_id`) REFERENCES `simulation_scenarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `simulation_step_runs` ADD CONSTRAINT `simulation_step_runs_run_id_fkey` FOREIGN KEY (`run_id`) REFERENCES `simulation_runs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
