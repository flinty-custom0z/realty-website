-- Performance indexes for better query performance
-- This migration adds indexes for frequently queried fields

-- Index for filtering by deal type (most common filter)
CREATE INDEX "idx_listing_dealType" ON "Listing"("dealType");

-- Index for filtering by status
CREATE INDEX "idx_listing_status" ON "Listing"("status");

-- Composite index for category + deal type + status (common combination)
CREATE INDEX "idx_listing_category_deal_status" ON "Listing"("categoryId", "dealType", "status");

-- Index for price range queries
CREATE INDEX "idx_listing_price" ON "Listing"("price");

-- Index for date sorting
CREATE INDEX "idx_listing_dateAdded" ON "Listing"("dateAdded" DESC);

-- Index for district filtering
CREATE INDEX "idx_listing_district" ON "Listing"("districtId") WHERE "districtId" IS NOT NULL;

-- Index for city filtering
CREATE INDEX "idx_listing_city" ON "Listing"("cityId") WHERE "cityId" IS NOT NULL;

-- Index for property type filtering
CREATE INDEX "idx_listing_type" ON "Listing"("typeId") WHERE "typeId" IS NOT NULL;

-- Index for condition filtering
CREATE INDEX "idx_listing_condition" ON "Listing"("condition") WHERE "condition" IS NOT NULL;

-- Composite index for common filter combinations
CREATE INDEX "idx_listing_filters" ON "Listing"("dealType", "status", "categoryId", "price", "dateAdded" DESC);

-- Index for slug lookups
CREATE INDEX "idx_category_slug" ON "Category"("slug");
CREATE INDEX "idx_propertytype_slug" ON "PropertyType"("slug");
CREATE INDEX "idx_district_slug" ON "District"("slug");
CREATE INDEX "idx_city_slug" ON "City"("slug");

-- Index for featured images query
CREATE INDEX "idx_image_featured" ON "Image"("listingId", "isFeatured") WHERE "isFeatured" = true; 