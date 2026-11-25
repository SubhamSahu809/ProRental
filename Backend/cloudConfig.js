const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const isProd = process.env.NODE_ENV === "production";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
    const msg = "Missing Cloudinary env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET";
    if (isProd) throw new Error(msg);
    console.warn(`WARNING: ${msg}`);
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});

const MAX_IMAGES = 8;

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "proRental/properties",
        allowed_formats: ["jpeg", "jpg", "png", "gif", "webp"],
        transformation: [{ width: 1600, height: 1600, crop: "limit" }],
    },
});

const ALLOWED_MIMETYPES = /^image\/(jpeg|jpg|pjpeg|png|gif|webp|x-png)$/i;

// Trust the mimetype rather than the file name, which the client fully controls.
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIMETYPES.test(file.mimetype || "")) return cb(null, true);
    cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed."));
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: MAX_IMAGES },
    fileFilter,
});

// Remove files from Cloudinary (used when a request fails after upload, or a listing is deleted).
async function deleteImages(images = []) {
    await Promise.all(
        images
            .filter((img) => img && img.filename)
            .map((img) =>
                cloudinary.uploader.destroy(img.filename).catch((err) => {
                    console.error("Error deleting image from Cloudinary:", img.filename, err.message);
                })
            )
    );
}

async function deleteUploadedFiles(files) {
    if (!Array.isArray(files) || files.length === 0) return;
    await deleteImages(files.map((f) => ({ filename: f.filename })));
}

function uploadErrorMessage(err) {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                return "File size too large. Maximum size is 5MB per image.";
            case "LIMIT_FILE_COUNT":
            case "LIMIT_UNEXPECTED_FILE":
                return `Too many images. Maximum ${MAX_IMAGES} images allowed.`;
            default:
                return "File upload error: " + err.message;
        }
    }
    if (err.message && err.message.startsWith("Only image files")) return err.message;
    return null;
}

/**
 * Accept up to MAX_IMAGES files on `fieldName`.
 * @param {boolean} required - require at least one image (create) or allow zero (update)
 */
const uploadImages = (fieldName, { required }) => {
    const middleware = upload.array(fieldName, MAX_IMAGES);
    return (req, res, next) => {
        middleware(req, res, async (err) => {
            if (err) {
                await deleteUploadedFiles(req.files);
                const message = uploadErrorMessage(err);
                if (message) return res.status(400).json({ error: message });
                console.error("Image upload failed:", err);
                return res.status(502).json({ error: "Image upload failed. Please try again." });
            }
            req.files = req.files || [];
            if (required && req.files.length === 0) {
                return res.status(400).json({ error: "At least one image is required." });
            }
            next();
        });
    };
};

module.exports = {
    cloudinary,
    MAX_IMAGES,
    uploadImages,
    deleteImages,
    deleteUploadedFiles,
};
