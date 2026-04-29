/*
  Warnings:

  - You are about to drop the column `delivery_status` on the `shipments` table. All the data in the column will be lost.
  - You are about to drop the column `pickup_status` on the `shipments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_method" TEXT NOT NULL DEFAULT 'COD',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING_CONFIRMATION',
ALTER COLUMN "payment_status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "payouts" ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "payment_reference" TEXT;

-- AlterTable
ALTER TABLE "shipments" DROP COLUMN "delivery_status",
DROP COLUMN "pickup_status",
ADD COLUMN     "actual_delivery" TIMESTAMP(3),
ADD COLUMN     "estimated_delivery" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING_PICKUP';
