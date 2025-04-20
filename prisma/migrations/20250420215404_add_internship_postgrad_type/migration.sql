DO $$ 
BEGIN 
    -- Check if the enum value doesn't already exist
    IF NOT EXISTS (
        SELECT * 
        FROM pg_enum
        JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
        WHERE pg_type.typname = 'PostGradType'
        AND pg_enum.enumlabel = 'internship'
    ) THEN
        -- Only add the value if it doesn't exist
        ALTER TYPE "PostGradType" ADD VALUE 'internship';
    END IF;
END $$;
