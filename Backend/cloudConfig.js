const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const isProd = process.env.NODE_ENV === "production";

// Validate Cloudinary configuration (fail fast in production)
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
    const msg = "Missing Cloudinary env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET";
    if (isProd) {
        throw new Error(msg);
    } else {
        console.warn(`WARNING: ${msg}`);
    }
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

// Test Cloudinary connection (only in non-production)
if (!isProd && cloudName && apiKey && apiSecret) {
    cloudinary.api.ping()
        .then(result => {
            console.log('Cloudinary connection test: SUCCESS');
        })
        .catch(error => {
            console.error('Cloudinary connection test: FAILED', error.message);
            console.error('Please verify your Cloudinary credentials are correct');
        });
}

// Configure multer to use Cloudinary storage
let storage;
try {
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'proRental/properties', // Optional: organize images in a folder
            allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }], // Optional: resize images
        }
    });
    console.log('CloudinaryStorage initialized successfully');
} catch (error) {
    console.error('Error initializing CloudinaryStorage:', error);
    throw error;
}

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 8 // Maximum 8 files allowed
    },
    fileFilter: fileFilter
});

// Helper function to handle upload errors
const handleUploadError = (err, res) => {
    console.error('Upload middleware error:', {
        name: err.name,
        message: err.message,
        code: err.code,
        stack: err.stack
    });
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Maximum size is 5MB per file.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files uploaded. Maximum 8 images allowed.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: 'Unexpected file field.' });
        }
        return res.status(400).json({ error: 'File upload error: ' + err.message });
    }
    
    // Handle file filter errors
    if (err.message && err.message.includes('Only image files')) {
        return res.status(400).json({ error: err.message });
    }
    
    // Handle Cloudinary errors
    if (err.message && (err.message.includes('Cloudinary') || err.message.includes('cloud'))) {
        console.error('Cloudinary upload error:', err);
        return res.status(500).json({ 
            error: 'Failed to upload image to cloud storage. Please check your Cloudinary configuration and try again.' 
        });
    }
    
    // Generic upload error
    console.error('Unknown upload error:', err);
    return res.status(500).json({ error: 'Image upload failed: ' + (err.message || 'Unknown error') });
};

// Wrapper function to handle single file upload with error handling
const uploadSingle = (fieldName) => {
    const uploadMiddleware = upload.single(fieldName);
    
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            if (err) {
                return handleUploadError(err, res);
            }
            next();
        });
    };
};

// Wrapper function to handle multiple file uploads (array) with error handling
// Supports 1-8 images
const uploadArray = (fieldName, maxCount = 8) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            if (err) {
                return handleUploadError(err, res);
            }
            
            // Validate that at least 1 image was uploaded
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'At least one image is required. Please upload at least 1 image.' });
            }
            
            // Validate that maximum 8 images were uploaded
            if (req.files.length > 8) {
                return res.status(400).json({ error: 'Too many images. Maximum 8 images allowed.' });
            }
            
            console.log(`Successfully received ${req.files.length} image(s) for upload`);
            next();
        });
    };
};

// Error handler middleware for multer errors (for use in error handling chain)
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files uploaded.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: 'Unexpected file field.' });
        }
        console.error('Multer error:', err);
        return res.status(400).json({ error: 'File upload error: ' + err.message });
    }
    
    if (err && err.message) {
        // Handle file filter errors
        if (err.message.includes('Only image files')) {
            return res.status(400).json({ error: err.message });
        }
        // Handle Cloudinary errors
        if (err.message.includes('Cloudinary') || err.message.includes('cloud')) {
            console.error('Cloudinary error:', err);
            return res.status(500).json({ error: 'Failed to upload image to cloud storage. Please check your Cloudinary configuration.' });
        }
    }
    
    next(err);
};

module.exports = {
    storage,
    upload,
    cloudinary,
    uploadSingle, // Use this for single file uploads
    uploadArray,  // Use this for multiple file uploads (1-8 images)
    handleMulterError
}