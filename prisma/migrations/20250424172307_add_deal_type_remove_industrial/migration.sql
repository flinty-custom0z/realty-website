-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('SALE', 'RENT');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "dealType" "DealType" NOT NULL DEFAULT 'SALE';
