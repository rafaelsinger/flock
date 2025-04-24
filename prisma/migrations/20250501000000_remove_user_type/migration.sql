-- Check and drop column if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'user_type'
    ) THEN
        ALTER TABLE "users" DROP COLUMN "user_type";
    END IF;
END $$;

-- Check and drop enum type if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'UserType'
    ) THEN
        DROP TYPE "UserType";
    END IF;
END $$; 