-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('grad', 'intern');

-- AlterEnum
ALTER TYPE "PostGradType" ADD VALUE 'internship';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "internship_season" TEXT,
ADD COLUMN     "internship_year" INTEGER,
ADD COLUMN     "user_type" "UserType" NOT NULL DEFAULT 'grad',
ALTER COLUMN "class_year" SET DEFAULT 2025;
