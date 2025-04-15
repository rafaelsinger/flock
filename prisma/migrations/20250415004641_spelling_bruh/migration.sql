/*
  Warnings:

  - You are about to drop the column `discpline` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "discpline",
ADD COLUMN     "discipline" TEXT;
