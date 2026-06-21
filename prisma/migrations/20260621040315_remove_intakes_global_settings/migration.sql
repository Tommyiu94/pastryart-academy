-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- Seed the single Settings row with the new shared student password
INSERT INTO "Settings" ("id", "passwordHash")
VALUES (1, '$2b$10$NscJpicdSV4Hgm3PmyQhwO3IMmvCmGe9AC..rQDYSi0QMzU63Ve4W');

-- DropForeignKey
ALTER TABLE "Pastry" DROP CONSTRAINT "Pastry_intakeId_fkey";

-- AlterTable
ALTER TABLE "Pastry" DROP COLUMN "intakeId";

-- DropTable
DROP TABLE "Intake";
