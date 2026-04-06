// src/index.js
const express = require("express");
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

    // 2. Lưu người dùng mới vào Database
    const newUser = await prisma.user.create({
      data: {
        email,
        password,
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});

// Thêm đoạn này vào src/index.js
app.get('/rooms', async (req, res) => {
  try {
    const maxPrice = Number(req.query.maxPrice);
    const rooms = await prisma.room.findMany(
      maxPrice ? { where: { giaTien: { lte: maxPrice } } } : {}
    );
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách phòng" });
  }
});