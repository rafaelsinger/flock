/*
  Warnings:

  - You are about to drop the `participants` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sender_id,receiver_id]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiver_id` to the `conversations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `conversations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "participants" DROP CONSTRAINT "participants_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "participants" DROP CONSTRAINT "participants_user_id_fkey";

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "receiver_id" UUID NOT NULL,
ADD COLUMN     "receiver_unread_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sender_id" UUID NOT NULL,
ADD COLUMN     "sender_unread_count" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "participants";

-- CreateIndex
CREATE INDEX "conversations_sender_id_idx" ON "conversations"("sender_id");

-- CreateIndex
CREATE INDEX "conversations_receiver_id_idx" ON "conversations"("receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_sender_id_receiver_id_key" ON "conversations"("sender_id", "receiver_id");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
