/*
  Warnings:

  - A unique constraint covering the columns `[payment_id]` on the table `checkouts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `checkouts_payment_id_key` ON `checkouts`(`payment_id`);
