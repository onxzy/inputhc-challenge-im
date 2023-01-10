-- CreateEnum
CREATE TYPE "MailTokenType" AS ENUM ('verification', 'passwordReset');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "User_MailTokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MailTokenType" NOT NULL,
    "expiration" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_MailTokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_MailTokens_id_key" ON "User_MailTokens"("id");

-- AddForeignKey
ALTER TABLE "User_MailTokens" ADD CONSTRAINT "User_MailTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
