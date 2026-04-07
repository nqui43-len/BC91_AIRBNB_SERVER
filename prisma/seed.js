// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu gieo mầm dữ liệu ...");

  // 1. DỌN DẸP SẠCH SẼ (Tránh lỗi trùng lặp)
  await prisma.booking.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.room.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
  console.log("🧹 Đã dọn dẹp sạch sẽ Database!");

  // 2. TẠO NGƯỜI DÙNG MẪU
  const user1 = await prisma.user.create({
    data: {
      email: "khachhang_vip@gmail.com",
      password: "123",
      name: "Trần Văn Khách",
      role: "USER",
    },
  });
  console.log("✅ Đã tạo User mẫu!");

  // 3. TẠO 8 VỊ TRÍ (LOCATION) ĐỂ KHỚP VỚI CỘT maViTri CỦA CÁC PHÒNG BÊN DƯỚI
  console.log("Đang tạo 8 địa điểm du lịch...");
  // Lưu ý: ID của Location tự tăng bắt đầu từ 1. Ta gom vào mảng để tạo nhanh.
  const viTriList = [
    { tenViTri: "Quận 1", tinhThanh: "Hồ Chí Minh", quocGia: "Việt Nam", hinhAnh: "https://vnpay.vn/s1/statics.vnpay.vn/2023/8/01txd7391851/dinh-doc-lap-1.jpg" },
    { tenViTri: "Ninh Kiều", tinhThanh: "Cần Thơ", quocGia: "Việt Nam", hinhAnh: "https://vnpay.vn/s1/statics.vnpay.vn/2023/12/0vmdc44nmmrn/ben-ninh-kieu-can-tho.jpg" },
    { tenViTri: "Biển Trần Phú", tinhThanh: "Nha Trang", quocGia: "Việt Nam", hinhAnh: "https://media.vneconomy.vn/w800/images/upload/2023/04/24/nha-trang.jpg" },
    { tenViTri: "Hoàn Kiếm", tinhThanh: "Hà Nội", quocGia: "Việt Nam", hinhAnh: "https://file.hanoi.gov.vn/File/H%E1%BB%93%20HK%201_638062955517178044.jpg" },
    { tenViTri: "Dương Đông", tinhThanh: "Phú Quốc", quocGia: "Việt Nam", hinhAnh: "https://nucuoimekong.com/wp-content/uploads/phu-quoc.jpg" },
    { tenViTri: "Biển Mỹ Khê", tinhThanh: "Đà Nẵng", quocGia: "Việt Nam", hinhAnh: "https://danangfantasticity.com/wp-content/uploads/2015/12/bi%E1%BB%83n-m%E1%BB%B9-kh%C3%AA-3.jpg" },
    { tenViTri: "Bản Cát Cát", tinhThanh: "Sapa", quocGia: "Việt Nam", hinhAnh: "https://statics.vinpearl.com/sapa-vietnam-4_1688790076.jpg" },
    { tenViTri: "Trung tâm", tinhThanh: "Đà Lạt", quocGia: "Việt Nam", hinhAnh: "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2023/10/anh-da-lat-dep-41.jpg" },
  ];

  await prisma.location.createMany({
    data: viTriList
  });

  const locationsDb = await prisma.location.findMany({ orderBy: { id: 'asc' } });
  
  // Hàm trợ giúp nhỏ: Ánh xạ maViTri cũ (1->8) sang ID thật của Location vừa tạo
  const getRealLocationId = (maViTriCu) => {
    return locationsDb[maViTriCu - 1]?.id || locationsDb[0].id; 
  };


  // 4. TẠO 25 CĂN PHÒNG (Dữ liệu từ Cybersoft)
  console.log("Đang xây dựng 25 căn phòng...");
  const mockRooms = [
    {
      "tenPhong": "NewApt D1 - Cozy studio - NU apt - 500m Bui Vien!",
      "khach": 3, "phongNgu": 1, "giuong": 1, "phongTam": 1,
      "moTa": "Tự nhận phòng\r\nTự nhận phòng bằng khóa thông minh...",
      "giaTien": 28, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": false, "wifi": true, "bep": false, "doXe": true, "hoBoi": true, "banUi": true,
      "maViTri": getRealLocationId(1),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong1.jpg"
    },
    {
      "tenPhong": "STUDIO MỚI NETFLIX MIỄN PHÍ/ĐỖ XE MIỄN PHÍ",
      "khach": 2, "phongNgu": 1, "giuong": 1, "phongTam": 1,
      "moTa": "Không gian riêng để làm việc...",
      "giaTien": 21, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": true, "wifi": true, "bep": true, "doXe": false, "hoBoi": false, "banUi": false,
      "maViTri": getRealLocationId(1),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong2.png"
    },
    {
      "tenPhong": "Phòng sang trọng với ban công tại D.1 - 200m đến Bitexco",
      "khach": 2, "phongNgu": 1, "giuong": 1, "phongTam": 1,
      "moTa": "Emmy là Chủ nhà siêu cấp...",
      "giaTien": 17, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": false, "wifi": false, "bep": false, "doXe": true, "hoBoi": true, "banUi": true,
      "maViTri": getRealLocationId(1),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong3.png"
    },
    {
      "tenPhong": "Closer home!!!!",
      "khach": 4, "phongNgu": 2, "giuong": 2, "phongTam": 2,
      "moTa": "Hieu là Chủ nhà siêu cấp...",
      "giaTien": 28, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": true, "wifi": true, "bep": false, "doXe": false, "hoBoi": false, "banUi": false,
      "maViTri": getRealLocationId(2),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong4.png"
    },
    {
      "tenPhong": "Toàn bộ quê hương phải của Gi ngay trung tâm Cần Thơ",
      "khach": 4, "phongNgu": 2, "giuong": 2, "phongTam": 2,
      "moTa": "Giang là Chủ nhà siêu cấp...",
      "giaTien": 25, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": true, "wifi": false, "bep": false, "doXe": true, "hoBoi": false, "banUi": true,
      "maViTri": getRealLocationId(2),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong5.png"
    },
    {
      "tenPhong": "Ngôi nhà có hoa, nắng đẹp, trung tâm Cần Thơ",
      "khach": 4, "phongNgu": 1, "giuong": 2, "phongTam": 2,
      "moTa": "Tự nhận phòng...",
      "giaTien": 21, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": true, "wifi": true, "bep": true, "doXe": false, "hoBoi": false, "banUi": false,
      "maViTri": getRealLocationId(2),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong6.png"
    },
    {
      "tenPhong": "Near Hon Chong-Quiet Seaview Studio to beach",
      "khach": 2, "phongNgu": 1, "giuong": 1, "phongTam": 1,
      "moTa": "Chỉ 2 phút đi bộ ra bãi biển!",
      "giaTien": 10, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": false, "wifi": false, "bep": false, "doXe": true, "hoBoi": true, "banUi": true,
      "maViTri": getRealLocationId(3),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong7.png"
    },
    {
      "tenPhong": "Tầng 25 Căn hộ 1 phòng ngủ ấm cúng và hiện đại",
      "khach": 4, "phongNgu": 1, "giuong": 2, "phongTam": 1,
      "moTa": "Phòng ngủ ấm cúng và Morden 1 ở tầng 25.",
      "giaTien": 15, "mayGiat": false, "banLa": false, "tivi": true, "dieuHoa": true, "wifi": true, "bep": true, "doXe": true, "hoBoi": true, "banUi": true,
      "maViTri": getRealLocationId(3),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong8.png"
    },
    {
      "tenPhong": "Căn hộ mặt tiền Economy Beach với chế độ ngắm bình minh",
      "khach": 4, "phongNgu": 1, "giuong": 2, "phongTam": 1,
      "moTa": "Căn hộ của tôi là căn hộ mặt tiền bãi biển.",
      "giaTien": 18, "mayGiat": true, "banLa": false, "tivi": true, "dieuHoa": false, "wifi": true, "bep": true, "doXe": false, "hoBoi": false, "banUi": true,
      "maViTri": getRealLocationId(3),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong9.png"
    },
    {
      "tenPhong": "Hanoi Old Quarter Homestay - Unique Railway View",
      "khach": 2, "phongNgu": 1, "giuong": 1, "phongTam": 1,
      "moTa": "Welcome to our house - a newly renovated apartment...",
      "giaTien": 23, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": true, "wifi": true, "bep": true, "doXe": true, "hoBoi": false, "banUi": true,
      "maViTri": getRealLocationId(4),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong10.png"
    },
    {
      "tenPhong": "Studio mới, thang máy, Hoàn Kiếm, gần khu phố cổ",
      "khach": 2, "phongNgu": 1, "giuong": 1, "phongTam": 1,
      "moTa": "Chào mừng bạn đến với Botanicahome!",
      "giaTien": 15, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": true, "wifi": true, "bep": true, "doXe": false, "hoBoi": false, "banUi": false,
      "maViTri": getRealLocationId(4),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong11.png"
    },
    {
      "tenPhong": "Studio mới, thang máy, Hoàn Kiếm (Phòng VIP)",
      "khach": 2, "phongNgu": 1, "giuong": 1, "phongTam": 1,
      "moTa": "Chào mừng bạn đến với Botanicahome! (Phiên bản cao cấp)",
      "giaTien": 18, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": true, "wifi": true, "bep": true, "doXe": true, "hoBoi": true, "banUi": true,
      "maViTri": getRealLocationId(4),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong12.png"
    },
    {
      "tenPhong": "Fisherman homestay (phòng 2 người - B)",
      "khach": 2, "phongNgu": 1, "giuong": 1, "phongTam": 1,
      "moTa": "Feel free and make yourself at home",
      "giaTien": 15, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": true, "wifi": true, "bep": true, "doXe": true, "hoBoi": true, "banUi": true,
      "maViTri": getRealLocationId(5),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong13.png"
    },
    {
      "tenPhong": "Nhà 2 phòng ngủ tại thị trấn Dương Đông",
      "khach": 8, "phongNgu": 2, "giuong": 3, "phongTam": 3,
      "moTa": "Chào mừng bạn đến với The Yard - nơi cách trung tâm...",
      "giaTien": 43, "mayGiat": true, "banLa": false, "tivi": false, "dieuHoa": false, "wifi": true, "bep": true, "doXe": true, "hoBoi": true, "banUi": true,
      "maViTri": getRealLocationId(5),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong14.png"
    },
    {
      "tenPhong": "Fisherman homestay Family",
      "khach": 4, "phongNgu": 1, "giuong": 2, "phongTam": 2,
      "moTa": "Feel free and make yourself at home.",
      "giaTien": 33, "mayGiat": true, "banLa": true, "tivi": false, "dieuHoa": false, "wifi": false, "bep": true, "doXe": true, "hoBoi": true, "banUi": true,
      "maViTri": getRealLocationId(5),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong15.png"
    },
    {
      "tenPhong": "Studio mới & ấm cúng | Riverside | Bên cạnh Cầu Hàn",
      "khach": 2, "phongNgu": 1, "giuong": 1, "phongTam": 1,
      "moTa": "Chào mừng bạn đến với Ngôi nhà Đậu thứ ba của tôi...",
      "giaTien": 13, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": false, "wifi": false, "bep": false, "doXe": false, "hoBoi": false, "banUi": true,
      "maViTri": getRealLocationId(6),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong16.png"
    },
    {
      "tenPhong": "ModernLuxury Studio cách bãi biển 1 phút",
      "khach": 2, "phongNgu": 1, "giuong": 1, "phongTam": 1,
      "moTa": "Đắm chìm trong vẻ đẹp hiện đại...",
      "giaTien": 19, "mayGiat": true, "banLa": false, "tivi": false, "dieuHoa": false, "wifi": true, "bep": true, "doXe": true, "hoBoi": true, "banUi": true,
      "maViTri": getRealLocationId(6),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong17.png"
    },
    {
      "tenPhong": "Phòng mùa hè",
      "khach": 2, "phongNgu": 1, "giuong": 1, "phongTam": 1,
      "moTa": "Mọi thứ đều trở nên đơn giản...",
      "giaTien": 9, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": false, "wifi": false, "bep": false, "doXe": false, "hoBoi": false, "banUi": false,
      "maViTri": getRealLocationId(7),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong18.png"
    },
    {
      "tenPhong": "Căn hộ hiện đại độc đáo của Scandinavia",
      "khach": 2, "phongNgu": 1, "giuong": 1, "phongTam": 1,
      "moTa": "Nơi ở độc đáo này mang một phong cách rất riêng.",
      "giaTien": 17, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": false, "wifi": false, "bep": false, "doXe": false, "hoBoi": false, "banUi": false,
      "maViTri": getRealLocationId(7),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong19.png"
    },
    {
      "tenPhong": "Hill Lodge Mũi Né - Ngôi nhà nhỏ gần bãi biển",
      "khach": 4, "phongNgu": 1, "giuong": 1, "phongTam": 1,
      "moTa": "Hill Lodge được thiết kế theo phong cách tối giản.",
      "giaTien": 27, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": true, "wifi": true, "bep": true, "doXe": true, "hoBoi": true, "banUi": true,
      "maViTri": getRealLocationId(8),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong20.png"
    },
    {
      "tenPhong": "Sky Guest House",
      "khach": 2, "phongNgu": 1, "giuong": 1, "phongTam": 1,
      "moTa": "Nơi nghỉ dưỡng tuyệt vời cho cặp đôi.",
      "giaTien": 19, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": true, "wifi": true, "bep": true, "doXe": true, "hoBoi": true, "banUi": true,
      "maViTri": getRealLocationId(8),
      "hinhAnh": "https://airbnbnew.cybersoft.edu.vn/images/phong21.png"
    },
    {
      "tenPhong": "Phòng siêu đẹp",
      "khach": 2, "phongNgu": 2, "giuong": 2, "phongTam": 2,
      "moTa": "phòng siêu đẹp",
      "giaTien": 36, "mayGiat": true, "banLa": true, "tivi": false, "dieuHoa": true, "wifi": true, "bep": false, "doXe": true, "hoBoi": true, "banUi": false,
      "maViTri": getRealLocationId(1),
      "hinhAnh": "https://dogolegia.vn/wp-content/uploads/2025/09/thiet-ke-noi-that-phong-ngu-tre-em-dep-hien-dai-LG-PTE270-1-900x675.jpg"
    },
    {
      "tenPhong": "Phòng siêu đẹp cho mọi người",
      "khach": 4, "phongNgu": 2, "giuong": 2, "phongTam": 2,
      "moTa": "Phòng này quá trời là đẹp",
      "giaTien": 35, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": true, "wifi": true, "bep": true, "doXe": true, "hoBoi": true, "banUi": true,
      "maViTri": getRealLocationId(6),
      "hinhAnh": "https://images.unsplash.com/photo-1554995207-c18c203602cb?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cm9vbXN8ZW58MHx8MHx8fDA%3D"
    },
    {
      "tenPhong": "Aci Home",
      "khach": 2, "phongNgu": 2, "giuong": 2, "phongTam": 1,
      "moTa": "Giá rẻ phòng đẹp",
      "giaTien": 29, "mayGiat": false, "banLa": true, "tivi": false, "dieuHoa": false, "wifi": true, "bep": false, "doXe": false, "hoBoi": true, "banUi": false,
      "maViTri": getRealLocationId(3),
      "hinhAnh": "https://acihome.vn/uploads/15/mau-thiet-ke-noi-that-phong-2-giuong-don-ben-trong-khach-san-3-4-5-sao-1.JPG"
    },
    {
      "tenPhong": "Phòng siêu mới và đẹp",
      "khach": 5, "phongNgu": 5, "giuong": 5, "phongTam": 3,
      "moTa": "Phòng này siêu mới và đẹp",
      "giaTien": 100, "mayGiat": true, "banLa": true, "tivi": true, "dieuHoa": true, "wifi": true, "bep": true, "doXe": true, "hoBoi": false, "banUi": true,
      "maViTri": getRealLocationId(3),
      "hinhAnh": "https://media.sbshouse.vn/wp-content/uploads/2024/08/vinh-villa-rd-t4-26.webp"
    }
  ];

  await prisma.room.createMany({
    data: mockRooms
  });
  console.log(`✅ Đã tạo thành công ${mockRooms.length} căn phòng siêu xịn!`);

  const phongDauTien = await prisma.room.findFirst();

  // 5. TẠO LỊCH ĐẶT PHÒNG MẪU
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
  console.log("🎉 Hoàn tất gieo mầm dữ liệu Đồ Án!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi rồi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });