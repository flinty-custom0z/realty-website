-- CreateTable
CREATE TABLE "PropertyType" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "count" INTEGER,

  CONSTRAINT "PropertyType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PropertyType_slug_key" ON "PropertyType"("slug");

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "typeId" TEXT;

-- Add temporary nullable constraint first to avoid errors with existing data
ALTER TABLE "Listing" ALTER COLUMN "title" DROP NOT NULL;

-- Populate PropertyType table with initial data for each category
-- First, create apartment property types
INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'Студии',
  'studio',
  id
FROM "Category" WHERE slug = 'apartments';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  '1 комнатные',
  '1-room',
  id
FROM "Category" WHERE slug = 'apartments';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  '2 комнатные',
  '2-room',
  id
FROM "Category" WHERE slug = 'apartments';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  '3 комнатные',
  '3-room',
  id
FROM "Category" WHERE slug = 'apartments';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  '4 комнатные',
  '4-room',
  id
FROM "Category" WHERE slug = 'apartments';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  '5 комнатные',
  '5-room',
  id
FROM "Category" WHERE slug = 'apartments';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'Пентхаусы',
  'penthouse',
  id
FROM "Category" WHERE slug = 'apartments';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'В новостройке',
  'new-building',
  id
FROM "Category" WHERE slug = 'apartments';

-- Create house property types
INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'Таунхаусы',
  'townhouse',
  id
FROM "Category" WHERE slug = 'houses';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'Части домов',
  'house-part',
  id
FROM "Category" WHERE slug = 'houses';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'Дуплексы',
  'duplex',
  id
FROM "Category" WHERE slug = 'houses';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'Дачи',
  'dacha',
  id
FROM "Category" WHERE slug = 'houses';

-- Create commercial property types
INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'Торговые площади',
  'retail',
  id
FROM "Category" WHERE slug = 'commercial';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'Коммерческая земля',
  'commercial-land',
  id
FROM "Category" WHERE slug = 'commercial';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'Офисы',
  'office',
  id
FROM "Category" WHERE slug = 'commercial';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'Бизнес',
  'business',
  id
FROM "Category" WHERE slug = 'commercial';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'Склады',
  'warehouse',
  id
FROM "Category" WHERE slug = 'commercial';

-- Create land property types
INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'Участки',
  'land-plot',
  id
FROM "Category" WHERE slug = 'land';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'Под ИЖС',
  'individual-housing',
  id
FROM "Category" WHERE slug = 'land';

INSERT INTO "PropertyType" ("id", "name", "slug", "categoryId")
SELECT 
  gen_random_uuid(),
  'Садоводство',
  'gardening',
  id
FROM "Category" WHERE slug = 'land';

-- Update existing listings to have a proper typeId based on their rooms value for apartments
UPDATE "Listing"
SET "typeId" = (
  SELECT pt.id 
  FROM "PropertyType" pt
  WHERE pt.slug = 
    CASE 
      WHEN "Listing".rooms = 0 THEN 'studio'
      WHEN "Listing".rooms = 1 THEN '1-room'
      WHEN "Listing".rooms = 2 THEN '2-room'
      WHEN "Listing".rooms = 3 THEN '3-room'
      WHEN "Listing".rooms = 4 THEN '4-room'
      WHEN "Listing".rooms = 5 THEN '5-room'
      ELSE '1-room' -- Default fallback
    END
  AND pt."categoryId" IN (SELECT id FROM "Category" WHERE slug = 'apartments')
  LIMIT 1
)
WHERE "categoryId" IN (SELECT id FROM "Category" WHERE slug = 'apartments');

-- For houses, default to the first property type
UPDATE "Listing"
SET "typeId" = (
  SELECT id FROM "PropertyType" WHERE "categoryId" IN (SELECT id FROM "Category" WHERE slug = 'houses') LIMIT 1
)
WHERE "categoryId" IN (SELECT id FROM "Category" WHERE slug = 'houses');

-- For commercial properties, default to the first property type
UPDATE "Listing"
SET "typeId" = (
  SELECT id FROM "PropertyType" WHERE "categoryId" IN (SELECT id FROM "Category" WHERE slug = 'commercial') LIMIT 1
)
WHERE "categoryId" IN (SELECT id FROM "Category" WHERE slug = 'commercial');

-- For land, default to the first property type
UPDATE "Listing"
SET "typeId" = (
  SELECT id FROM "PropertyType" WHERE "categoryId" IN (SELECT id FROM "Category" WHERE slug = 'land') LIMIT 1
)
WHERE "categoryId" IN (SELECT id FROM "Category" WHERE slug = 'land');

-- Now make typeId required
ALTER TABLE "Listing" ALTER COLUMN "typeId" SET NOT NULL;

-- Remove the title column
ALTER TABLE "Listing" DROP COLUMN "title";

-- AddForeignKey
ALTER TABLE "PropertyType" ADD CONSTRAINT "PropertyType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "PropertyType"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 