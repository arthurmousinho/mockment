/*
  Warnings:

  - Added the required column `allowed_methods` to the `checkouts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `checkouts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `checkouts` ADD COLUMN `allowed_methods` JSON NOT NULL,
    ADD COLUMN `currency` ENUM('BRL', 'USD', 'EUR') NOT NULL;
