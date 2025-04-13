-- CreateEnum
CREATE TYPE "PostGradType" AS ENUM ('work', 'school');

-- CreateTable
CREATE TABLE "industries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "bc_email" TEXT NOT NULL,
    "personal_email" TEXT NOT NULL,
    "postgrad_type" "PostGradType" NOT NULL,
    "company" TEXT,
    "title" TEXT,
    "school" TEXT,
    "program" TEXT,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "borough_district" TEXT,
    "industry_id" UUID,
    "visibility_options" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "industries_name_key" ON "industries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_bc_email_key" ON "users"("bc_email");

-- CreateIndex
CREATE UNIQUE INDEX "users_personal_email_key" ON "users"("personal_email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
