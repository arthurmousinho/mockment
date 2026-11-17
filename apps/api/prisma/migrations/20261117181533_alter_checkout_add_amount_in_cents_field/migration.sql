/*
  Warnings:

  - Added the required column `amount_in_cents` to the `checkouts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `checkouts` ADD COLUMN `amount_in_cents` INTEGER NOT NULL;
