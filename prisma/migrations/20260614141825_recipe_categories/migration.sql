/*
  Warnings:

  - You are about to drop the column `category` on the `Recipe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "RecipeCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RecipeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecipeCategory_name_key" ON "RecipeCategory"("name");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RecipeCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
