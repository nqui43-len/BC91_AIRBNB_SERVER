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

// API Đặt phòng (BẮT BUỘC CÓ THẺ)
app.post("/bookings", kiemTraTheTu, async (req, res) => {
  try {
    const { maPhong, ngayDen, ngayDi, soLuongKhach } = req.body;
    const userId = req.user.userId;

    const newBooking = await prisma.booking.create({
      data: {
        maPhong: Number(maPhong),
        maNguoiDung: userId,
        ngayDen: new Date(ngayDen),
        ngayDi: new Date(ngayDi),
        soLuongKhach: Number(soLuongKhach),
      },
    });

    res.status(201).json({
      message: "Đặt phòng thành công! Chúc quý khách kỳ nghỉ vui vẻ.",
      booking: newBooking,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi đặt phòng", error: error.message });
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
