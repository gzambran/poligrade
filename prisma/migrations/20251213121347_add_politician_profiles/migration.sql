-- CreateEnum
CREATE TYPE "Party" AS ENUM ('DEMOCRAT', 'REPUBLICAN', 'INDEPENDENT');

-- AlterTable
ALTER TABLE "Politician" ADD COLUMN     "businessLabor" TEXT,
ADD COLUMN     "civilRights" TEXT,
ADD COLUMN     "currentPosition" TEXT,
ADD COLUMN     "economicPolicy" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "environment" TEXT,
ADD COLUMN     "healthCare" TEXT,
ADD COLUMN     "immigrationForeignAffairs" TEXT,
ADD COLUMN     "party" "Party",
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "publicSafety" TEXT,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "runningFor" "Office",
ADD COLUMN     "votingRights" TEXT;

-- CreateIndex
CREATE INDEX "Politician_published_idx" ON "Politician"("published");
