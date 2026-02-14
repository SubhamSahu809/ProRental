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

// File filter to only allow images (lenient: accept if extension OR mimetype matches)
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|gif|webp)$/i;
const ALLOWED_MIMETYPES = /^image\/(jpeg|jpg|pjpeg|png|gif|webp|x-png)$/i;

const fileFilter = (req, file, cb) => {
    const name = (file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    const extOk = ALLOWED_EXTENSIONS.test(name);
    const mimeOk = ALLOWED_MIMETYPES.test(mime);

    if (extOk || mimeOk) {
        return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed. Please use one of these formats.'));
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 8 // Maximum 8 files allowed
    },
    fileFilter: fileFilter
});

// Helper function to handle upload errors (never throws; returns response or undefined)
const handleUploadError = (err, res) => {
    if (res.headersSent) return;
    try {
        console.error('Upload middleware error:', {
            name: err.name,
            message: err.message,
            code: err.code
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

        if (err.message && err.message.includes('Only image files')) {
            return res.status(400).json({ error: err.message });
        }

        if (err.message && (err.message.includes('Cloudinary') || err.message.includes('cloud'))) {
            console.error('Cloudinary upload error:', err);
            return res.status(500).json({
                error: 'Failed to upload image to cloud storage. Please check your Cloudinary configuration and try again.'
            });
        }

        return res.status(500).json({ error: 'Image upload failed: ' + (err.message || 'Unknown error') });
    } catch (sendErr) {
        console.error('Error sending upload error response:', sendErr);
    }
};

// Wrapper function to handle single file upload with error handling
const uploadSingle = (fieldName) => {
    const uploadMiddleware = upload.single(fieldName);
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            try {
                if (err) {
                    handleUploadError(err, res);
                    return;
                }
                next();
            } catch (e) {
                if (!res.headersSent) res.status(500).json({ error: 'Upload processing failed.' });
                console.error('Upload middleware exception:', e);
            }
        });
    };
};

// Wrapper function to handle multiple file uploads (array) with error handling
// Supports 1-8 images (requires at least 1)
const uploadArray = (fieldName, maxCount = 8) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            try {
                if (err) {
                    handleUploadError(err, res);
                    return;
                }
                if (!req.files || req.files.length === 0) {
                    if (!res.headersSent) res.status(400).json({ error: 'At least one image is required. Please upload at least 1 image.' });
                    return;
                }
                if (req.files.length > 8) {
                    if (!res.headersSent) res.status(400).json({ error: 'Too many images. Maximum 8 images allowed.' });
                    return;
                }
                console.log(`Successfully received ${req.files.length} image(s) for upload`);
                next();
            } catch (e) {
                if (!res.headersSent) res.status(500).json({ error: 'Upload processing failed.' });
                console.error('Upload middleware exception:', e);
            }
        });
    };
};

// Optional multiple file uploads (0 to maxCount) - for edit/update when keeping existing images
const uploadArrayOptional = (fieldName, maxCount = 8) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            try {
                if (err) {
                    handleUploadError(err, res);
                    return;
                }
                req.files = req.files || [];
                if (req.files.length > maxCount) {
                    if (!res.headersSent) res.status(400).json({ error: `Too many images. Maximum ${maxCount} images allowed.` });
                    return;
                }
                console.log(`Received ${req.files.length} new image(s) for update`);
                next();
            } catch (e) {
                if (!res.headersSent) res.status(500).json({ error: 'Upload processing failed.' });
                console.error('Upload middleware exception:', e);
            }
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
    uploadSingle,         // Use this for single file uploads
    uploadArray,          // Use this for multiple file uploads (1-8 images, requires at least 1)
    uploadArrayOptional,  // Use for update: 0-8 new images (can combine with kept existing)
    handleMulterError
};