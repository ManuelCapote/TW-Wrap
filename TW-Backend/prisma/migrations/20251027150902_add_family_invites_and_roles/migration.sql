/*
  Warnings:

  - Added the required column `ownerId` to the `Family` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER');

-- AlterTable: Add ownerId column first as nullable
ALTER TABLE "Family" ADD COLUMN     "ownerId" TEXT;

-- Set ownerId to the first user in each family
UPDATE "Family" f
SET "ownerId" = (
  SELECT u.id
  FROM "User" u
  WHERE u."familyId" = f.id
  ORDER BY u."createdAt" ASC
  LIMIT 1
);

-- Make ownerId required after setting values
ALTER TABLE "Family" ALTER COLUMN "ownerId" SET NOT NULL;

-- AlterTable: Add role column first with default MEMBER
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'MEMBER';

-- Set the first user in each family as ADMIN (after role column exists)
UPDATE "User" u
SET "role" = 'ADMIN'
WHERE u.id IN (
  SELECT "ownerId" FROM "Family"
);

-- CreateTable
CREATE TABLE "FamilyInvite" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 10,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FamilyInvite_code_key" ON "FamilyInvite"("code");

-- CreateIndex
CREATE INDEX "FamilyInvite_code_idx" ON "FamilyInvite"("code");

-- CreateIndex
CREATE INDEX "FamilyInvite_familyId_idx" ON "FamilyInvite"("familyId");

-- CreateIndex
CREATE INDEX "FamilyInvite_isActive_idx" ON "FamilyInvite"("isActive");

-- CreateIndex
CREATE INDEX "FamilyInvite_expiresAt_idx" ON "FamilyInvite"("expiresAt");

-- CreateIndex
CREATE INDEX "Family_ownerId_idx" ON "Family"("ownerId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "FamilyInvite" ADD CONSTRAINT "FamilyInvite_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyInvite" ADD CONSTRAINT "FamilyInvite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
