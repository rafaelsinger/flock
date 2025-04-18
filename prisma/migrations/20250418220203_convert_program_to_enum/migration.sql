/*
  Warnings:

  - The `program` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('Bachelors', 'Masters', 'PhD', 'JD', 'MD', 'MBA', 'EdD', 'MPH', 'ProfessionalCertificate', 'PostdoctoralFellowship', 'ResidencyProgram', 'AssociatesDegree', 'TradeSchoolVocational', 'GapYear', 'Undecided', 'Other');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "program",
ADD COLUMN     "program" "ProgramType";
