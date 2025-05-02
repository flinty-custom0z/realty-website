/*
  Warnings:

  - You are about to drop the column `noKids` on the `Listing` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BuildingType" AS ENUM ('BRICK', 'PANEL', 'MONOLITH', 'OTHER');

-- CreateEnum
CREATE TYPE "BalconyType" AS ENUM ('BALCONY', 'LOGGIA', 'BOTH', 'NONE');

-- CreateEnum
CREATE TYPE "BathroomType" AS ENUM ('COMBINED', 'SEPARATE', 'MULTIPLE');

-- CreateEnum
CREATE TYPE "WindowsView" AS ENUM ('COURTYARD', 'STREET', 'BOTH');

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "noKids",
ADD COLUMN     "balconyType" "BalconyType",
ADD COLUMN     "bathroomType" "BathroomType",
ADD COLUMN     "buildingType" "BuildingType",
ADD COLUMN     "kitchenArea" DOUBLE PRECISION,
ADD COLUMN     "noShares" BOOLEAN DEFAULT false,
ADD COLUMN     "windowsView" "WindowsView";
