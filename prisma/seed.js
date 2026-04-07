const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu gieo mầm dữ liệu...");
  // Dọn dẹp dữ liệu cũ (Lưu ý: Phải xóa bảng con (Booking) trước, rồi mới xóa bảng cha (User, Room))
  await prisma.booking.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.room.deleteMany();
  console.log("🧹 Đã dọn dẹp sạch sẽ Database!");

  // 1. Tạo 1 Người dùng mẫu
  const user1 = await prisma.user.create({
    data: {
      email: "khachhang_vip@gmail.com",
      password: "123",
      name: "Trần Văn Khách",
      role: "USER",
    },
  });
  console.log("✅ Đã tạo User:", user1.name);

  // 2. Tạo 2 Căn phòng mẫu (Dữ liệu giống Airbnb em gửi)
  const room1 = await prisma.room.create({
    data: {
      tenPhong: "Penthouse Landmark 81 View Sông Sài Gòn",
      khach: 4,
      giaTien: 5000000,
      moTa: "Căn hộ siêu sang trọng, đầy đủ tiện nghi, hồ bơi vô cực.",
      hinhAnh: "https://picsum.photos/800/600",
    },
  });
  console.log("✅ Đã tạo Phòng:", room1.tenPhong);

  const room2 = await prisma.room.create({
    data: {
      tenPhong: "Villa Đà Lạt Mộng Mơ",
      khach: 10,
      giaTien: 8500000,
      moTa: "Sân vườn rộng rãi, có khu vực nướng BBQ ngoài trời.",
      hinhAnh: "https://picsum.photos/800/601",
    },
  });
  console.log("✅ Đã tạo Phòng:", room2.tenPhong);

  const booking1 = await prisma.booking.create({
    data: {
      ngayDen: new Date("2026-05-01"),
      ngayDi: new Date("2026-05-05"),
      soLuongKhach: 2,
      userId: user1.id, 
      roomId: room1.id
    }
  });
  console.log("✅ Đã tạo Booking thành công!");

  console.log("🎉 Hoàn tất gieo mầm!");
}

// Chạy hàm main và tự động ngắt kết nối khi xong
main()
  .catch((e) => {
    console.error("❌ Lỗi rồi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
