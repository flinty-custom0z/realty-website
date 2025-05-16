-- Add title column back
ALTER TABLE "Listing" ADD COLUMN "title" TEXT;

-- Populate title column from propertyType relation
UPDATE "Listing"
SET "title" = (
  SELECT name 
  FROM "PropertyType" 
  WHERE id = "Listing"."typeId"
);

-- Make title required
ALTER TABLE "Listing" ALTER COLUMN "title" SET NOT NULL;

-- Drop foreign key constraints
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_typeId_fkey";
ALTER TABLE "PropertyType" DROP CONSTRAINT "PropertyType_categoryId_fkey";

-- Drop typeId column
ALTER TABLE "Listing" DROP COLUMN "typeId";

-- Drop PropertyType table
DROP TABLE "PropertyType"; 