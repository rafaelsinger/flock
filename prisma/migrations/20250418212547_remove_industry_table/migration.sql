/*
  Warnings:

  - You are about to drop the column `industry_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `industries` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Industries" AS ENUM ('technology', 'finance', 'consulting', 'healthcare', 'education', 'retail', 'manufacturing', 'media', 'nonprofit', 'other');

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_industry_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "industry_id",
ADD COLUMN     "industry" "Industries";

-- DropTable
DROP TABLE "industries";
