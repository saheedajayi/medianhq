-- AlterTable
ALTER TABLE "Message" ADD COLUMN "deliveredAt" TIMESTAMP(3);

-- Messages already read were necessarily delivered
UPDATE "Message" SET "deliveredAt" = "createdAt" WHERE "isRead" = true;
