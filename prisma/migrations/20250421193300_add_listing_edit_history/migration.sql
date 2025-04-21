-- CreateTable
CREATE TABLE "ListingEditHistory" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "editorId" TEXT NOT NULL,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,

    CONSTRAINT "ListingEditHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ListingEditHistory" ADD CONSTRAINT "ListingEditHistory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingEditHistory" ADD CONSTRAINT "ListingEditHistory_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
