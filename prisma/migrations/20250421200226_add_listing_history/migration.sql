/*
  Warnings:

  - You are about to drop the `ListingEditHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ListingEditHistory" DROP CONSTRAINT "ListingEditHistory_editorId_fkey";

-- DropForeignKey
ALTER TABLE "ListingEditHistory" DROP CONSTRAINT "ListingEditHistory_listingId_fkey";

-- DropTable
DROP TABLE "ListingEditHistory";

-- CreateTable
CREATE TABLE "ListingHistory" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL DEFAULT 'update',

    CONSTRAINT "ListingHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ListingHistory" ADD CONSTRAINT "ListingHistory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingHistory" ADD CONSTRAINT "ListingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
