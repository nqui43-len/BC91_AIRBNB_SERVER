// src/index.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json()); // Để Server đọc được dữ liệu JSON từ Frontend gửi lên

// API Đăng ký người dùng mới
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 1. Kiểm tra xem email đã tồn tại chưa
    const userExists = await prisma.user.findUnique({
      where: { email: email },
    });

    if (userExists) {
      return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }

    // BƯỚC MỚI: mã hóa mật khẩu trước khi lưu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Lưu người dùng mới vào Database với mật khẩu mã hóa
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res.status(201).json({
      message: "Đăng ký thành công!",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// API Đăng nhập & Cấp thẻ JWT
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({ message: "Email này chưa được đăng ký!" });
    }

    // 2. So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Email hoặc mật khẩu nhập không đúng! Vui lòng thử lại.",
      });
    }

    // 3. Mật khẩu ĐÚNG -> Tiến hành in thẻ (Tạo JWT)
    // Payload: Chứa thông tin không nhạy cảm (ID và Quyền)
    const payload = {
      userId: user.id,
      role: user.role,
    };

    // Tạo chữ ký (Signature) bằng SECRET_KEY và quy định thẻ này có hạn 1 ngày
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 4. Trả thẻ cho khách hàng
    res.status(200).json({
      message: "Đăng nhập thành công!",
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

const PORT = 3000;
// Kiểm tra thẻ JWT ở những API cần bảo vệ
const kiemTraTheTu = (req, res, next) => {
  // 1. người dùng đưa JWT lên Header Authorization theo định dạng: "Bearer <token>"
  const tokenTuKhach = req.headers.authorization;

  // trường hợp không có JWT
  if (!tokenTuKhach) {
    return res
      .status(401)
      .json({ message: "Vui lòng xuất trình thẻ (Token)!" });
  }

  try {
    // 2. Kiểm tra xem JWT có đúng định dạng "Bearer <token>" không
    const maThe = tokenTuKhach.split(" ")[1];

    // 3. Dùng SECRET_KEY soi xem thẻ là thật hay giả, có hết hạn chưa
    const thongTinTrongThe = jwt.verify(maThe, process.env.JWT_SECRET);

    // 4. Thẻ thật! Gắn thông tin người dùng vào Request để lát nữa API bên trong dùng
    req.user = thongTinTrongThe;

    // 5. Mở cửa cho khách đi tiếp vào trong API (Cực kỳ quan trọng)
    next();
  } catch (error) {
    return res.status(403).json({ message: "Thẻ giả hoặc đã hết hạn!" });
  }
};

// API Lấy thông tin cá nhân (Protected API, chỉ người có thẻ mới vào được)
app.get("/auth/profile", kiemTraTheTu, async (req, res) => {
  try {
    // Đã biết người dùng nào đang vào API này thông qua req.user (do middleware gắn vào)
    const userId = req.user.userId;

    // Vào Database lấy thông tin người dùng (trừ password)
    const thongTinKhach = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true }, // Không lấy password
    });

    res.status(200).json(thongTinKhach);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" });
  }
});

// ==========================================
// QUẢN LÝ ĐẶT PHÒNG (BOOKING CRUD)
// ==========================================

// 1. Lấy danh sách tất cả lịch đặt phòng (GET)
app.get('/api/dat-phong', async (req, res) => {
  try {
    const datPhongList = await prisma.booking.findMany();
    res.status(200).json({ statusCode: 200, content: datPhongList });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// 2. Đặt phòng mới (POST)
app.post('/api/dat-phong', kiemTraTheTu, async (req, res) => {
  try {
    // Swagger gửi lên những trường này
    const { maPhong, ngayDen, ngayDi, soLuongKhach, maNguoiDung } = req.body;
    
    // Bảo mật: Ưu tiên lấy ID từ thẻ Token (req.user.userId), 
    // nếu không có thẻ (admin) thì mới lấy từ body (maNguoiDung)
    const userId = req.user?.userId || maNguoiDung; 

    const newBooking = await prisma.booking.create({
      data: {
        maPhong: Number(maPhong),
        maNguoiDung: Number(userId),
        ngayDen: new Date(ngayDen),
        ngayDi: new Date(ngayDi),
        soLuongKhach: Number(soLuongKhach)
      }
    });

    res.status(201).json({ statusCode: 201, content: newBooking, message: "Đặt phòng thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Đặt phòng", error: error.message });
  }
});

// 3. Lấy lịch đặt phòng theo ID (GET)
app.get('/api/dat-phong/:id', async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    
    if (!booking) return res.status(404).json({ message: "Không tìm thấy lịch đặt phòng này!" });
    res.status(200).json({ statusCode: 200, content: booking });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// 4. Cập nhật lịch đặt phòng (PUT) - Yêu cầu có thẻ
app.put('/api/dat-phong/:id', kiemTraTheTu, async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const { maPhong, ngayDen, ngayDi, soLuongKhach, maNguoiDung } = req.body;

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        maPhong: Number(maPhong),
        maNguoiDung: Number(maNguoiDung),
        ngayDen: new Date(ngayDen),
        ngayDi: new Date(ngayDi),
        soLuongKhach: Number(soLuongKhach)
      }
    });

    res.status(200).json({ statusCode: 200, content: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: "Cập nhật thất bại", error: error.message });
  }
});

// 5. Xóa lịch đặt phòng (DELETE) - Yêu cầu có thẻ
app.delete('/api/dat-phong/:id', kiemTraTheTu, async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    await prisma.booking.delete({ where: { id: bookingId } });
    res.status(200).json({ statusCode: 200, message: "Đã xóa lịch đặt phòng!" });
  } catch (error) {
    res.status(500).json({ message: "Xóa thất bại", error: error.message });
  }
});

// 6. Lấy lịch đặt phòng theo MÃ NGƯỜI DÙNG (GET) - API Đặc biệt
app.get('/api/dat-phong/lay-theo-nguoi-dung/:MaNguoiDung', async (req, res) => {
  try {
    // Lấy ID người dùng từ đường dẫn
    const maNguoiDung = Number(req.params.MaNguoiDung); 

    // Tìm TẤT CẢ các đơn đặt phòng thuộc về người dùng này
    const danhSach = await prisma.booking.findMany({
      where: { maNguoiDung: maNguoiDung }
    });

    res.status(200).json({ statusCode: 200, content: danhSach });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// ==========================================
// QUẢN LÝ BÌNH LUẬN (COMMENT CRUD)
// ==========================================

// 1. Lấy danh sách tất cả bình luận (GET)
app.get('/api/binh-luan', async (req, res) => {
  try {
    const binhLuanList = await prisma.comment.findMany();
    res.status(200).json({ statusCode: 200, content: binhLuanList });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// 2. Thêm bình luận mới (POST) - Yêu cầu có thẻ
app.post('/api/binh-luan', kiemTraTheTu, async (req, res) => {
  try {
    const { maPhong, maNguoiBinhLuan, noiDung, saoBinhLuan } = req.body;
    
    // Ưu tiên lấy ID từ thẻ Token để chống gian lận
    const userId = req.user?.userId || maNguoiBinhLuan;

    const newComment = await prisma.comment.create({
      data: {
        maPhong: Number(maPhong),
        maNguoiBinhLuan: Number(userId),
        ngayBinhLuan: new Date(), // Tự động lấy ngày giờ lúc khách bấm nút Gửi
        noiDung: noiDung,
        saoBinhLuan: Number(saoBinhLuan)
      }
    });

    res.status(201).json({ statusCode: 201, content: newComment, message: "Đã gửi bình luận!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi thêm bình luận", error: error.message });
  }
});

// 3. Cập nhật bình luận (PUT) - Yêu cầu có thẻ
app.put('/api/binh-luan/:id', kiemTraTheTu, async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    const { noiDung, saoBinhLuan } = req.body;

    // Khi sửa bình luận, ta chỉ cho phép sửa nội dung và số sao
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        noiDung: noiDung,
        saoBinhLuan: Number(saoBinhLuan)
      }
    });

    res.status(200).json({ statusCode: 200, content: updatedComment });
  } catch (error) {
    res.status(500).json({ message: "Cập nhật thất bại", error: error.message });
  }
});

// 4. Xóa bình luận (DELETE) - Yêu cầu có thẻ
app.delete('/api/binh-luan/:id', kiemTraTheTu, async (req, res) => {
  try {
    const commentId = Number(req.params.id);
    await prisma.comment.delete({ where: { id: commentId } });
    res.status(200).json({ statusCode: 200, message: "Đã xóa bình luận!" });
  } catch (error) {
    res.status(500).json({ message: "Xóa thất bại", error: error.message });
  }
});

// 5. Lấy bình luận theo MÃ PHÒNG (GET) - API Đặc biệt
app.get('/api/binh-luan/lay-binh-luan-theo-phong/:MaPhong', async (req, res) => {
  try {
    const maPhong = Number(req.params.MaPhong);

    // Lấy tất cả bình luận của căn phòng đó
    const danhSach = await prisma.comment.findMany({
      where: { maPhong: maPhong }
    });

    res.status(200).json({ statusCode: 200, content: danhSach });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// ==========================================
// QUẢN LÝ VỊ TRÍ (LOCATION CRUD)
// ==========================================

// 1. Lấy danh sách toàn bộ vị trí (GET)
app.get('/api/vi-tri', async (req, res) => {
  try {
    const viTriList = await prisma.location.findMany();
    res.status(200).json({ statusCode: 200, content: viTriList });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// 2. Thêm vị trí mới (POST) - Yêu cầu có thẻ (kiemTraTheTu)
app.post('/api/vi-tri', kiemTraTheTu, async (req, res) => {
  try {
    const { tenViTri, tinhThanh, quocGia, hinhAnh } = req.body;
    
    const newLocation = await prisma.location.create({
      data: { tenViTri, tinhThanh, quocGia, hinhAnh }
    });
    
    res.status(201).json({ statusCode: 201, content: newLocation });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// 6. Phân trang và tìm kiếm Vị trí (GET)
app.get('/api/vi-tri/phan-trang-tim-kiem', async (req, res) => {
  try {
    // 1. Lấy tham số từ URL (Query params). Nếu khách không gửi thì gán giá trị mặc định.
    const pageIndex = Number(req.query.pageIndex) || 1;
    const pageSize = Number(req.query.pageSize) || 10; 
    const keyword = req.query.keyword || "";

    // 2. Tính toán số dòng cần bỏ qua (skip)
    const skip = (pageIndex - 1) * pageSize;

    // 3. Xây dựng túi điều kiện tìm kiếm (Tìm theo Tên vị trí hoặc Tỉnh thành)
    const dieuKien = keyword ? {
      OR: [
        { tenViTri: { contains: keyword, mode: 'insensitive' } },
        { tinhThanh: { contains: keyword, mode: 'insensitive' } }
      ]
    } : {};

    // 4. Lấy dữ liệu VÀ đếm tổng số lượng
    const [danhSachViTri, tongSoDong] = await Promise.all([
      prisma.location.findMany({
        where: dieuKien,
        skip: skip,
        take: pageSize,
        orderBy: { id: 'asc' }
      }),
      prisma.location.count({
        where: dieuKien
      })
    ]);

    // 5. Trả về format chuẩn mực cho Frontend làm nút bấm Phân trang
    res.status(200).json({
      statusCode: 200,
      content: {
        pageIndex: pageIndex,
        pageSize: pageSize,
        totalRow: tongSoDong,
        keywords: keyword,
        data: danhSachViTri
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// 3. Lấy thông tin 1 vị trí theo ID (GET by ID)
app.get('/api/vi-tri/:id', async (req, res) => {
  try {
    const viTriId = Number(req.params.id); 

    const viTri = await prisma.location.findUnique({
      where: { id: viTriId }
    });

    if (!viTri) {
      return res.status(404).json({ message: "Không tìm thấy vị trí này!" });
    }
    res.status(200).json({ statusCode: 200, content: viTri });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  }
});

// 4. Cập nhật thông tin vị trí (PUT) - Yêu cầu có thẻ
app.put('/api/vi-tri/:id', kiemTraTheTu, async (req, res) => {
  try {
    const viTriId = Number(req.params.id);
    const { tenViTri, tinhThanh, quocGia, hinhAnh } = req.body;

    const updatedLocation = await prisma.location.update({
      where: { id: viTriId },
      data: { tenViTri, tinhThanh, quocGia, hinhAnh }
    });

    res.status(200).json({ statusCode: 200, content: updatedLocation });
  } catch (error) {
    res.status(500).json({ message: "Cập nhật thất bại, có thể ID không tồn tại", error: error.message });
  }
});

// 5. Xóa vị trí (DELETE) - Yêu cầu có thẻ
app.delete('/api/vi-tri/:id', kiemTraTheTu, async (req, res) => {
  try {
    const viTriId = Number(req.params.id);

    await prisma.location.delete({
      where: { id: viTriId }
    });

    res.status(200).json({ statusCode: 200, message: "Đã xóa vị trí thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Xóa thất bại", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});

app.get("/rooms", async (req, res) => {
  try {
    const maxPrice = Number(req.query.maxPrice);
    const location = req.query.location;
    let dieuKienLoc = {};

    if (maxPrice) dieuKienLoc.giaTien = { lte: maxPrice };

    if (location) {
      dieuKienLoc.location = {
        tinhThanh: {
          contains: location,
          mode: "insensitive",
        },
      };
    }

    const rooms = await prisma.room.findMany({
      where: dieuKienLoc,
      include: {
        location: true,
      },
    });

    res.status(200).json(rooms);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách phòng", error: error.message });
  }
});
