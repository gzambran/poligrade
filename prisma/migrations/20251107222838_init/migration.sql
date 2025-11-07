-- CreateEnum
CREATE TYPE "Office" AS ENUM ('GOVERNOR', 'SENATOR', 'HOUSE_REPRESENTATIVE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('INCUMBENT', 'CANDIDATE', 'NONE');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('PROGRESSIVE', 'LIBERAL', 'CENTRIST', 'MODERATE', 'CONSERVATIVE', 'NATIONALIST');

-- CreateTable
CREATE TABLE "Politician" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT,
    "office" "Office" NOT NULL,
    "status" "Status" NOT NULL,
    "grade" "Grade" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Politician_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Politician_state_idx" ON "Politician"("state");

-- CreateIndex
CREATE INDEX "Politician_office_idx" ON "Politician"("office");

-- CreateIndex
CREATE INDEX "Politician_grade_idx" ON "Politician"("grade");
