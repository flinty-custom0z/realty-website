/*
  Warnings:

  - You are about to drop the column `district` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "district",
ADD COLUMN     "districtId" TEXT;

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "District_slug_key" ON "District"("slug");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate district data
DO $$
DECLARE
    district_name TEXT;
    slug TEXT;
    district_id TEXT;
    listing_id TEXT;
BEGIN
    -- Get unique districts from listings
    FOR district_name IN 
        SELECT DISTINCT district FROM "Listing" 
        WHERE district IS NOT NULL AND district != ''
    LOOP
        -- Generate slug from district name
        slug := LOWER(REGEXP_REPLACE(district_name, '[^a-zA-Z0-9]+', '-', 'g'));
        
        -- Trim leading and trailing hyphens
        slug := TRIM(BOTH '-' FROM slug);
        
        -- Check if district already exists
        SELECT id INTO district_id FROM "District" WHERE name = district_name OR slug = slug;
        
        -- Create district if it doesn't exist
        IF district_id IS NULL THEN
            district_id := gen_random_uuid();
            INSERT INTO "District" (id, name, slug) VALUES (district_id, district_name, slug);
        END IF;
        
        -- Update listings with district reference
        UPDATE "Listing" SET "districtId" = district_id WHERE district = district_name;
    END LOOP;
END $$;

-- Keep district column for now to ensure data is properly migrated
