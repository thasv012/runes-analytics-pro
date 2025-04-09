-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuneToken" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "totalSupply" BIGINT,
    "holdersCount" INTEGER,
    "marketCapSats" BIGINT,
    "volume24hSats" BIGINT,
    "etchTxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuneToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFavorite" (
    "userId" TEXT NOT NULL,
    "runeTokenId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("userId","runeTokenId")
);

-- CreateTable
CREATE TABLE "WhaleTransaction" (
    "id" TEXT NOT NULL,
    "txId" TEXT NOT NULL,
    "runeTokenId" TEXT NOT NULL,
    "fromAddress" TEXT,
    "toAddress" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "valueSats" BIGINT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "isWhaleBuy" BOOLEAN,
    "isWhaleSell" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhaleTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RuneToken_name_key" ON "RuneToken"("name");

-- CreateIndex
CREATE INDEX "RuneToken_name_idx" ON "RuneToken"("name");

-- CreateIndex
CREATE INDEX "RuneToken_blockNumber_idx" ON "RuneToken"("blockNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WhaleTransaction_txId_key" ON "WhaleTransaction"("txId");

-- CreateIndex
CREATE INDEX "WhaleTransaction_runeTokenId_idx" ON "WhaleTransaction"("runeTokenId");

-- CreateIndex
CREATE INDEX "WhaleTransaction_timestamp_idx" ON "WhaleTransaction"("timestamp");

-- CreateIndex
CREATE INDEX "WhaleTransaction_toAddress_idx" ON "WhaleTransaction"("toAddress");

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_runeTokenId_fkey" FOREIGN KEY ("runeTokenId") REFERENCES "RuneToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhaleTransaction" ADD CONSTRAINT "WhaleTransaction_runeTokenId_fkey" FOREIGN KEY ("runeTokenId") REFERENCES "RuneToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;
