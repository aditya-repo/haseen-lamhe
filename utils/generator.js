
// Generate a random OTP
const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 6-digit OTP
};