/*
  Warnings:

  - A unique constraint covering the columns `[personal_email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "personal_email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_personal_email_key" ON "users"("personal_email");
