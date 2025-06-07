-- CreateTable
CREATE TABLE "City" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,

  CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- Add cityId to Listing
ALTER TABLE "Listing" ADD COLUMN "cityId" TEXT;

-- Create default city for existing listings
DO $$
DECLARE
  default_city_id TEXT;
BEGIN
  -- Create a default city
  default_city_id := gen_random_uuid();
  INSERT INTO "City" (id, name, slug) VALUES (default_city_id, 'Краснодар', 'krasnodar');
  
  -- Update all existing listings to use the default city
  UPDATE "Listing" SET "cityId" = default_city_id WHERE "cityId" IS NULL;
END $$;

-- Make cityId required
ALTER TABLE "Listing" ALTER COLUMN "cityId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 