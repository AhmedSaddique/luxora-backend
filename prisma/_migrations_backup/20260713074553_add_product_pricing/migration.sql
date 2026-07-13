/*
  Warnings:

  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discountPrice" DECIMAL(10,2),
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;
