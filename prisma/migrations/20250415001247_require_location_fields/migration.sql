/*
  Warnings:

  - Made the column `country` on table `locations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `locations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `locations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lat` on table `locations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lon` on table `locations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "locations" ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "lat" SET NOT NULL,
ALTER COLUMN "lon" SET NOT NULL;
