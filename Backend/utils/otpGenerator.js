export const generateOTP = () => {
    // Generate a 6-digit OTP (you can adjust the length as needed)
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
  };