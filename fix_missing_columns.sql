-- Check if title column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Listing' AND column_name = 'title'
    ) THEN
        ALTER TABLE "Listing" ADD COLUMN "title" TEXT NOT NULL DEFAULT '';
    END IF;
END
$$;
