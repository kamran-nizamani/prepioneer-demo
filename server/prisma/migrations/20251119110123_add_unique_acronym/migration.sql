/*
  Warnings:

  - A unique constraint covering the columns `[acronym]` on the table `test_catalog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "test_catalog_acronym_key" ON "test_catalog"("acronym");
