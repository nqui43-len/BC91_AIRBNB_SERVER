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

  // 2. Tạo Căn phòng mẫu (Dữ liệu giống Airbnb em gửi)
  console.log("Đang xây dựng danh sách phòng...");
  const mockRooms = [
    {
      tenPhong: "Bungalow Săn Mây Tả Van",
      khach: 2,
      giaTien: 1200000,
      viTri: "Sapa",
      hinhAnh: JSON.stringify([
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000",
      ]),
      moTa: "Tọa lạc tại bản Tả Van, Sapa. Bungalow gỗ mộc mạc với view nhìn thẳng ra thung lũng lúa chín và biển mây buổi sáng. Thích hợp cho cặp đôi tìm kiếm sự bình yên.",
    },
    {
      tenPhong: "Villa Đồi Thông Mộng Mơ",
      khach: 8,
      giaTien: 4500000,
      viTri: "Đà Lạt",
      hinhAnh: JSON.stringify([
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1000",
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=1000",
        "https://images.unsplash.com/photo-1502672260266-1c1f0b0fd4eb?q=80&w=1000",
      ]),
      moTa: "Biệt thự nguyên căn ẩn mình giữa đồi thông Đà Lạt. Sân vườn rộng rãi có khu vực nướng BBQ ngoài trời, lò sưởi củi truyền thống và ban công ngắm hoàng hôn tuyệt đẹp.",
    },
    {
      tenPhong: "Penthouse Cửa Sổ Đại Dương",
      khach: 6,
      giaTien: 5500000,
      viTri: "Nha Trang",
      hinhAnh: JSON.stringify([
        "https://images.unsplash.com/photo-1499955085172-a104c9463ece?q=80&w=1000",
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000",
      ]),
      moTa: "Căn hộ Penthouse mặt tiền đường Trần Phú, Nha Trang. Thiết kế kính toàn cảnh 360 độ ngắm trọn vnh biển. Có hồ bơi vô cực riêng tư và dàn âm thanh hiện đại.",
    },
    {
      tenPhong: "Căn hộ Dịch vụ Landmark 81",
      khach: 4,
      giaTien: 2800000,
      viTri: "Hồ Chí Minh",
      hinhAnh: JSON.stringify([
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1000",
        "https://images.unsplash.com/photo-1600566753086-00f18efc2291?q=80&w=1000",
      ]),
      moTa: "Trải nghiệm sống đỉnh cao tại tòa tháp cao nhất Việt Nam (TP.HCM). Căn hộ thông minh, nội thất sang trọng nhập khẩu, free vé hồ bơi và phòng gym chuẩn 5 sao.",
    },
    {
      tenPhong: "Resort Bãi Dài Kèm Hồ Bơi",
      khach: 2,
      giaTien: 3200000,
      viTri: "Phú Quốc",
      hinhAnh: JSON.stringify([
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000",
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1000",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000",
      ]),
      moTa: "Nằm sát bờ biển Bãi Dài, Phú Quốc. Tận hưởng bãi cát trắng mịn, bữa sáng phục vụ tận giường (Floating Breakfast) và không gian lãng mạn cho tuần trăng mật.",
    },
  ];

  // Dùng vòng lặp for...of để thêm toàn bộ mảng mockRooms vào Database
  for (const roomData of mockRooms) {
    await prisma.room.create({
      data: roomData,
    });
  }

  console.log(`✅ Đã tạo thành công ${mockRooms.length} căn phòng siêu đẹp!`);

  // Lấy ra một căn phòng đầu tiên trong Database (Vừa được tạo từ vòng lặp ở trên)
  const phongDauTien = await prisma.room.findFirst();

  // 4. Tạo Booking mẫu
  const booking1 = await prisma.booking.create({
    data: {
      ngayDen: new Date("2026-05-01"),
      ngayDi: new Date("2026-05-05"),
      soLuongKhach: 2,
      userId: user1.id,
      roomId: phongDauTien.id
    }
  });
  
  console.log("✅ Đã tạo Booking thành công cho phòng:", phongDauTien.tenPhong);

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
