-- AlterTable
ALTER TABLE "users" ADD COLUMN     "onboarding_step" INTEGER DEFAULT 0,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "visibility_options" DROP NOT NULL;
