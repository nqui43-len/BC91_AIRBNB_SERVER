// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu gieo mầm dữ liệu mới...");
  
  // 1. Dọn dẹp dữ liệu cũ (Xóa từ bảng con đến bảng cha)
  await prisma.booking.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.room.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
  console.log("🧹 Đã dọn dẹp sạch sẽ Database!");

  // 2. Tạo 1 Người dùng mẫu
  const user1 = await prisma.user.create({
    data: {
      email: "khachhang_vip@gmail.com",
      password: "123",
      name: "Trần Văn Khách",
      role: "USER",
    },
  });
  console.log("✅ Đã tạo User:", user1.name);

  // 3. Tạo các Vị trí (Location) mẫu trước
  console.log("Đang tạo các địa điểm du lịch...");
  const locSapa = await prisma.location.create({ data: { tenViTri: "Bản Tả Van", tinhThanh: "Sapa", quocGia: "Việt Nam" } });
  const locDaLat = await prisma.location.create({ data: { tenViTri: "Trung tâm", tinhThanh: "Đà Lạt", quocGia: "Việt Nam" } });
  const locNhaTrang = await prisma.location.create({ data: { tenViTri: "Biển Trần Phú", tinhThanh: "Nha Trang", quocGia: "Việt Nam" } });
  const locHCM = await prisma.location.create({ data: { tenViTri: "Quận 1", tinhThanh: "Hồ Chí Minh", quocGia: "Việt Nam" } });
  const locPhuQuoc = await prisma.location.create({ data: { tenViTri: "Bãi Dài", tinhThanh: "Phú Quốc", quocGia: "Việt Nam" } });

  // 4. Tạo Căn phòng mẫu (Gắn mã vị trí vào từng phòng)
  console.log("Đang xây dựng danh sách phòng...");
  const mockRooms = [
    {
      tenPhong: "Bungalow Săn Mây Tả Van",
      khach: 2, phongNgu: 1, giuong: 1, phongTam: 1,
      giaTien: 1200000,
      wifi: true, bep: false, hoBoi: false,
      maViTri: locSapa.id,
      hinhAnh: JSON.stringify([
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000",
      ]),
      moTa: "Bungalow gỗ mộc mạc với view nhìn thẳng ra thung lũng lúa chín.",
    },
    {
      tenPhong: "Villa Đồi Thông Mộng Mơ",
      khach: 8, phongNgu: 4, giuong: 4, phongTam: 3,
      giaTien: 4500000,
      wifi: true, bep: true, hoBoi: false, banLa: true,
      maViTri: locDaLat.id,
      hinhAnh: JSON.stringify([
        "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1000",
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=1000",
      ]),
      moTa: "Biệt thự nguyên căn ẩn mình giữa đồi thông Đà Lạt.",
    },
    {
      tenPhong: "Penthouse Cửa Sổ Đại Dương",
      khach: 6, phongNgu: 3, giuong: 3, phongTam: 2,
      giaTien: 5500000,
      wifi: true, bep: true, hoBoi: true, tivi: true,
      maViTri: locNhaTrang.id,
      hinhAnh: JSON.stringify([
        "https://images.unsplash.com/photo-1499955085172-a104c9463ece?q=80&w=1000",
      ]),
      moTa: "Căn hộ Penthouse mặt tiền đường Trần Phú, Nha Trang.",
    },
    {
      tenPhong: "Căn hộ Dịch vụ Landmark 81",
      khach: 4, phongNgu: 2, giuong: 2, phongTam: 1,
      giaTien: 2800000,
      wifi: true, bep: true, hoBoi: true, mayGiat: true,
      maViTri: locHCM.id,
      hinhAnh: JSON.stringify([
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000",
      ]),
      moTa: "Trải nghiệm sống đỉnh cao tại tòa tháp cao nhất Việt Nam (TP.HCM).",
    },
    {
      tenPhong: "Resort Bãi Dài Kèm Hồ Bơi",
      khach: 2, phongNgu: 1, giuong: 1, phongTam: 1,
      giaTien: 3200000,
      wifi: true, bep: false, hoBoi: true, dieuHoa: true,
      maViTri: locPhuQuoc.id,
      hinhAnh: JSON.stringify([
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000",
      ]),
      moTa: "Nằm sát bờ biển Bãi Dài, Phú Quốc.",
    },
  ];

  for (const roomData of mockRooms) {
    await prisma.room.create({ data: roomData });
  }
  console.log(`✅ Đã tạo thành công ${mockRooms.length} căn phòng!`);

  const phongDauTien = await prisma.room.findFirst();

  // 5. Tạo Booking mẫu (Đã đổi tên biến theo chuẩn Swagger)
  const booking1 = await prisma.booking.create({
    data: {
      ngayDen: new Date("2026-05-01"),
      ngayDi: new Date("2026-05-05"),
      soLuongKhach: 2,
      maNguoiDung: user1.id,
      maPhong: phongDauTien.id
    }
  });
  console.log("✅ Đã tạo Booking thành công cho phòng:", phongDauTien.tenPhong);
  console.log("🎉 Hoàn tất gieo mầm!");
}

main()
  .catch((e) => { console.error("❌ Lỗi rồi:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });