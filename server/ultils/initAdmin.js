// scripts/initAdmin.js
const Account = require("../models/user/Account");
const User = require("../models/user/User");
const Admin = require("../models/user/Admin");
const Role = require("../models/user/Role");
const StatusUser = require("../models/user/StatusUser");

const DEFAULT_ADMIN = {
  firstName: "Admin",
  lastName: "Root",
  email: process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com",
  password: process.env.DEFAULT_ADMIN_PASSWORD || "admin123",
  mobile: "0123456789",
};

module.exports = async function initAdmin() {
  try {
    /* ===============================
     * 1. Đảm bảo role admin tồn tại
     * =============================== */
    const adminRole = await Role.findOneAndUpdate(
      { roleName: "admin" },
      { roleName: "admin" },
      { new: true, upsert: true }
    );

    /* ===============================
     * 2. Đảm bảo status active tồn tại
     * =============================== */
    const activeStatus = await StatusUser.findOneAndUpdate(
      { statusUserName: "active" },
      { statusUserName: "active" },
      { new: true, upsert: true }
    );

    /* ===============================
     * 3. Kiểm tra admin đã tồn tại chưa
     * =============================== */
    const existedAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });
    if (existedAdmin) {
      console.log("Admin đã tồn tại. Bỏ qua tạo mới.");
      return;
    }

    /* ===============================
     * 4. Tạo account đăng nhập
     * =============================== */
    const account = await Account.create({
      userName: DEFAULT_ADMIN.email,
      password: DEFAULT_ADMIN.password,
    });

    /* ===============================
     * 5. Tạo user gán role + status
     * =============================== */
    const user = await User.create({
      ...DEFAULT_ADMIN,
      userName: DEFAULT_ADMIN.email,
      roleId: adminRole._id,
      statusUserId: activeStatus._id,
    });

    /* ===============================
     * 6. Gắn admin
     * =============================== */
    await Admin.create({ _id: user._id });

    console.log(
      `Đã tạo admin mặc định:
       Email: ${DEFAULT_ADMIN.email}
       Password: ${DEFAULT_ADMIN.password}`
    );
  } catch (err) {
    await Account.deleteOne({ userName: DEFAULT_ADMIN.email });
    console.error("Lỗi khi khởi tạo admin mặc định:", err.message);
  }
};
