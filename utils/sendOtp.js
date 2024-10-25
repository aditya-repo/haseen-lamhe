// utils/sendOtp.js
const sendOtp = async (phone, otp) => {
    // Here you can integrate with an SMS service to send the OTP
    console.log(`Sending OTP ${otp} to phone number ${phone}`);
    // Simulating successful OTP sending
    return true;
};

module.exports = sendOtp;