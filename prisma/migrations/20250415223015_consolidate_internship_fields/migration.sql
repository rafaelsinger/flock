-- First, update existing data to ensure nothing is lost
UPDATE "users"
SET 
  "company" = COALESCE("company", "internship_company"),
  "title" = COALESCE("title", "internship_title")
WHERE 
  "user_type" = 'intern' AND 
  ("internship_company" IS NOT NULL OR "internship_title" IS NOT NULL);

-- Now drop the redundant columns
ALTER TABLE "users" 
DROP COLUMN "internship_company",
DROP COLUMN "internship_title"; 