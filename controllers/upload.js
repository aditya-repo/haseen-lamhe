const fs = require('fs');
const path = require('path');
const multer = require('multer');

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit each file to 5MB
  fileFilter: (req, file, cb) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF files are allowed.'));
    }
  },
}).array('images', 30); // Maximum of 30 images

const uploadMultipleImages = async (req, res) => {
  const { eventid } = req.params;
  const uploadPath = path.join(__dirname, `optimized/${eventid}/public`);

  try {
    // Check if directory exists, if not create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      // Move uploaded files to the destination
      req.files.forEach(file => {
        const tempPath = file.path; // multer saves to temp location
        const targetPath = path.join(uploadPath, file.originalname);
        fs.renameSync(tempPath, targetPath); // Move file to target path
      });

      res.status(200).json({ success: true, message: 'Images uploaded successfully', files: req.files });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading images', error });
  }
};

module.exports = { uploadMultipleImages };
