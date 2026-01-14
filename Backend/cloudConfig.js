const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use Cloudinary storage for production, local storage for development
let storage;
let upload;

if (process.env.NODE_ENV === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
    // Use Cloudinary for production
    const cloudinaryStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'proRental/properties',
            allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
            transformation: [{ width: 1200, height: 800, crop: 'limit' }],
        },
    });
    
    storage = cloudinaryStorage;
    
    upload = multer({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = /jpeg|jpg|png|gif|webp/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype);
            
            if (extname && mimetype) {
                return cb(null, true);
            } else {
                cb(new Error('Only image files are allowed!'));
            }
        }
    });
    
    console.log('Using Cloudinary for file storage');
} else {
    // Fallback to local storage for development
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadsDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, 'property-' + uniqueSuffix + ext);
        }
    });
    
    upload = multer({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = /jpeg|jpg|png|gif|webp/;
            const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
            const mimetype = allowedTypes.test(file.mimetype);
            
            if (extname && mimetype) {
                return cb(null, true);
            } else {
                cb(new Error('Only image files are allowed!'));
            }
        }
    });
    
    console.log('Using local file storage (development mode)');
}

module.exports = {
    cloudinary,
    upload
}