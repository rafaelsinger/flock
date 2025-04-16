/*
  Warnings:

  - You are about to drop the column `internship_season` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `internship_year` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "internship_season",
DROP COLUMN "internship_year";
