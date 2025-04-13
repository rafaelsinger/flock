/*
  Warnings:

  - You are about to drop the column `personal_email` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_personal_email_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "personal_email";
