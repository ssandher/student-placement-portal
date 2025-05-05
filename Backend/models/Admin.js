import db from "../databaseConnect.js";
import bcrypt from "bcryptjs";

const Admin = {
  getAdmin: async (email) => {
    const result = await db.query("select * from admin where email=?", email);
    const admin = result[0];
    if (admin.length != 0) return admin[0];
    else return null;
  },
  getAdminByAdminId: async (id) => {
    const result = await db.query("select * from admin where admin_id=?", id);
    const admin = result[0];
    if (admin.length != 0) return admin[0];
    else return null;
  },
  insert: async (data) => {
    const { admin_name, email, password } = data; // Include admin_name
    const hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO admin(admin_name, email, password) VALUES (?, ?, ?)", // Include admin_name
      [admin_name, email, hash]
    );

    return result;
  },
  storeOTP: async (email, otp) => {
    await db.query("UPDATE admin SET otp = ? WHERE email = ?", [otp, email]);
  },
  getStoredOTP: async (email) => {
    const result = await db.query("SELECT otp FROM admin WHERE email = ?", [email]);
    if (result[0].length > 0) {
      return { otp: result[0][0].otp };
    }
    return null;
  },
  clearOTP: async (email) => {
    await db.query("UPDATE admin SET otp = NULL WHERE email = ?", [email]);
  },
  updatePassword: async (email, hashedPassword) => {
    await db.query("UPDATE admin SET password = ? WHERE email = ?", [hashedPassword, email]);
  }
};

export default Admin;