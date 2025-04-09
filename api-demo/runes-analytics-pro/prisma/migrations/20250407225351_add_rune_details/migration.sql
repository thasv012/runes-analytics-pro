-- AlterTable
ALTER TABLE "RuneToken" ADD COLUMN     "block" INTEGER,
ADD COLUMN     "etchTxId" TEXT,
ADD COLUMN     "holders" INTEGER,
ADD COLUMN     "limitPerMint" TEXT,
ADD COLUMN     "remaining" TEXT,
ADD COLUMN     "supply" TEXT,
ADD COLUMN     "txCount" INTEGER;
