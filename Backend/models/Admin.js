import db from "../databaseConnect.js";
import bcrypt from "bcryptjs";

const Admin = {
  getAdmin: async (email) => {
    const result = await db.query("select * from admin where email=?", email);
    const admin = result[0];
    if (admin.length != 0) return admin[0];
    else return null;
  },
  insert: async (data) => {
    const { email, password } = data;
    const hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO admin(email, password) VALUES (?, ?)",
      [email, hash]
    );

    return result;
  },
  storeOTP: async (email, otp) => {
    // In a real application, you'd want to store the OTP in a more secure way,
    // potentially with an expiration timestamp.  For simplicity, we'll just store
    // it in the database.  Consider using Redis or a similar caching mechanism
    // for better performance and security.
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