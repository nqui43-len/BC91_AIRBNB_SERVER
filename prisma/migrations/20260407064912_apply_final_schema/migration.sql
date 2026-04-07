/*
  Warnings:

  - You are about to drop the column `roomId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `bookingId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `sao` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `viTri` on the `Room` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropIndex
DROP INDEX "Comment_bookingId_key";

-- DropIndex
DROP INDEX "Room_tenPhong_idx";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "roomId",
DROP COLUMN "userId",
ADD COLUMN     "maNguoiDung" INTEGER,
ADD COLUMN     "maPhong" INTEGER,
ALTER COLUMN "ngayDen" DROP NOT NULL,
ALTER COLUMN "ngayDi" DROP NOT NULL,
ALTER COLUMN "soLuongKhach" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "bookingId",
DROP COLUMN "roomId",
DROP COLUMN "sao",
DROP COLUMN "userId",
ADD COLUMN     "maNguoiBinhLuan" INTEGER,
ADD COLUMN     "maPhong" INTEGER,
ADD COLUMN     "saoBinhLuan" INTEGER,
ALTER COLUMN "noiDung" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "viTri",
ADD COLUMN     "banLa" BOOLEAN,
ADD COLUMN     "banUi" BOOLEAN,
ADD COLUMN     "bep" BOOLEAN,
ADD COLUMN     "dieuHoa" BOOLEAN,
ADD COLUMN     "doXe" BOOLEAN,
ADD COLUMN     "giuong" INTEGER,
ADD COLUMN     "hoBoi" BOOLEAN,
ADD COLUMN     "maViTri" INTEGER,
ADD COLUMN     "mayGiat" BOOLEAN,
ADD COLUMN     "phongNgu" INTEGER,
ADD COLUMN     "phongTam" INTEGER,
ADD COLUMN     "tivi" BOOLEAN,
ADD COLUMN     "wifi" BOOLEAN,
ALTER COLUMN "tenPhong" DROP NOT NULL,
ALTER COLUMN "khach" DROP NOT NULL,
ALTER COLUMN "giaTien" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthday" TEXT,
ADD COLUMN     "gender" BOOLEAN,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "role" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "tenViTri" TEXT,
    "tinhThanh" TEXT,
    "quocGia" TEXT,
    "hinhAnh" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_maViTri_fkey" FOREIGN KEY ("maViTri") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_maPhong_fkey" FOREIGN KEY ("maPhong") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_maNguoiDung_fkey" FOREIGN KEY ("maNguoiDung") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_maPhong_fkey" FOREIGN KEY ("maPhong") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_maNguoiBinhLuan_fkey" FOREIGN KEY ("maNguoiBinhLuan") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
