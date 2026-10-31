-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "exchangeRate" DOUBLE PRECISION,
ADD COLUMN     "listedAmount" INTEGER,
ADD COLUMN     "listedCurrency" TEXT;
