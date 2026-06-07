-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isFaceVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isIdentityVerified" BOOLEAN NOT NULL DEFAULT false;
