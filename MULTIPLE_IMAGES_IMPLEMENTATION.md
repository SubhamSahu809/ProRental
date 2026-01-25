# Multiple Images Upload Implementation (1-8 Images)

## Overview
This document explains how the multiple image upload feature (1-8 images) was implemented in the proRental application.

## Architecture Flow

```
Frontend (React) → Backend Route → Multer Middleware → Cloudinary → Database (MongoDB)
```

## Implementation Details

### 1. Database Model (`Backend/models/listing.js`)

**Changes Made:**
- Added `images` array field to store all property images (1-8 images)
- Kept `image` field for backward compatibility (stores the first/main image)

```javascript
image: {
    filename: String,
    url: String,
}, // Main/primary image (first image) - kept for backward compatibility
images: [{
    filename: String,
    url: String,
}], // Array of all property images (1-8 images)
```

**Why:**
- `image` field ensures existing code that references the main image still works
- `images` array stores all uploaded images for gallery display

---

### 2. Cloudinary Configuration (`Backend/cloudConfig.js`)

**Changes Made:**
- Added `files: 8` limit to multer configuration (maximum 8 files)
- Created `uploadArray()` wrapper function for handling multiple file uploads
- Added validation: minimum 1 image, maximum 8 images

**Key Functions:**

#### `uploadArray(fieldName, maxCount)`
- Wraps `multer.array()` to handle multiple file uploads
- Validates that 1-8 images are uploaded
- Provides detailed error handling for:
  - File size limits (5MB per file)
  - File count limits (max 8)
  - Invalid file types
  - Cloudinary upload failures

**Error Handling:**
```javascript
// Validates file count
if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'At least one image is required...' });
}
if (req.files.length > 8) {
    return res.status(400).json({ error: 'Too many images. Maximum 8 images allowed.' });
}
```

---

### 3. Routes (`Backend/routes/listing.js`)

**Changes Made:**
- Changed from `uploadSingle("listing[image]")` to `uploadArray("listing[images]", 8)`
- Field name changed from `listing[image]` (singular) to `listing[images]` (plural)

**Before:**
```javascript
uploadSingle("listing[image]")  // Single file
```

**After:**
```javascript
uploadArray("listing[images]", 8)  // Multiple files (1-8)
```

**Why:**
- Multer uses the field name to identify which files to process
- The array syntax `listing[images]` tells multer to expect multiple files

---

### 4. Controller (`Backend/controllers/listings.js`)

**Changes Made:**
- Changed from `req.file` (single) to `req.files` (array)
- Added loop to process all uploaded images
- Stores first image in `image` field, all images in `images` array

**Processing Logic:**

```javascript
// 1. Validate files exist
if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "At least one property image is required" });
}

// 2. Validate count (1-8)
if (req.files.length < 1 || req.files.length > 8) {
    return res.status(400).json({ error: "Please upload between 1 and 8 images" });
}

// 3. Process each file
const images = [];
for (const file of req.files) {
    const imageData = {
        url: file.path,        // Cloudinary URL
        filename: file.filename // Cloudinary public_id
    };
    images.push(imageData);
}

// 4. Store in database
newListing.image = images[0];  // Main image (backward compatibility)
newListing.images = images;    // All images array
```

**Why This Approach:**
- Processes all files in a loop to extract Cloudinary URLs and filenames
- Creates an array of image objects for database storage
- First image is stored in both `image` and `images[0]` for compatibility

---

### 5. Frontend (`Frontend/src/components/AddProperty.jsx`)

**Changes Made:**
- Changed from sending only first photo to sending all photos
- Field name changed from `listing[image]` to `listing[images]`
- Added console logging for debugging

**Before:**
```javascript
// Only sent first photo
formDataToSend.append('listing[image]', formData.photos[0]);
```

**After:**
```javascript
// Send all photos (1-8)
formData.photos.forEach((photo, index) => {
    formDataToSend.append('listing[images]', photo);
});
```

**Why:**
- `FormData.append()` with the same field name creates an array
- Multer's `upload.array()` expects multiple files with the same field name
- Each call to `append('listing[images]', photo)` adds another file to the array

---

## Data Flow Example

### User Uploads 3 Images:

1. **Frontend:**
   ```javascript
   formData.photos = [file1, file2, file3]
   formDataToSend.append('listing[images]', file1)
   formDataToSend.append('listing[images]', file2)
   formDataToSend.append('listing[images]', file3)
   ```

2. **Backend Route:**
   ```javascript
   uploadArray("listing[images]", 8) // Receives 3 files
   ```

3. **Multer Middleware:**
   ```javascript
   req.files = [
       { path: 'https://cloudinary.com/img1.jpg', filename: 'abc123' },
       { path: 'https://cloudinary.com/img2.jpg', filename: 'def456' },
       { path: 'https://cloudinary.com/img3.jpg', filename: 'ghi789' }
   ]
   ```

4. **Controller:**
   ```javascript
   images = [
       { url: 'https://cloudinary.com/img1.jpg', filename: 'abc123' },
       { url: 'https://cloudinary.com/img2.jpg', filename: 'def456' },
       { url: 'https://cloudinary.com/img3.jpg', filename: 'ghi789' }
   ]
   ```

5. **Database:**
   ```javascript
   {
       image: { url: 'https://cloudinary.com/img1.jpg', filename: 'abc123' },
       images: [
           { url: 'https://cloudinary.com/img1.jpg', filename: 'abc123' },
           { url: 'https://cloudinary.com/img2.jpg', filename: 'def456' },
           { url: 'https://cloudinary.com/img3.jpg', filename: 'ghi789' }
       ]
   }
   ```

---

## Validation Rules

1. **Minimum:** 1 image required
2. **Maximum:** 8 images allowed
3. **File Size:** 5MB per file
4. **File Types:** jpeg, jpg, png, gif, webp

---

## Error Messages

- **No images:** "At least one property image is required"
- **Too many images:** "Too many images. Maximum 8 images allowed."
- **File too large:** "File size too large. Maximum size is 5MB per file."
- **Invalid file type:** "Only image files (jpeg, jpg, png, gif, webp) are allowed!"
- **Cloudinary error:** "Failed to upload image to cloud storage. Please check your Cloudinary configuration and try again."

---

## Backward Compatibility

- The `image` field is still populated with the first image
- Existing code that references `listing.image` will continue to work
- New code should use `listing.images` array for gallery functionality

---

## Testing Checklist

- [ ] Upload 1 image (minimum)
- [ ] Upload 8 images (maximum)
- [ ] Try uploading 9 images (should fail)
- [ ] Try uploading 0 images (should fail)
- [ ] Upload different file types (jpeg, png, etc.)
- [ ] Upload file larger than 5MB (should fail)
- [ ] Verify all images are stored in database
- [ ] Verify first image is in both `image` and `images[0]`

---

## Key Takeaways

1. **Multer Array:** Use `upload.array()` for multiple files with the same field name
2. **FormData:** Use `append()` multiple times with the same field name to create an array
3. **Validation:** Always validate file count (1-8) before processing
4. **Error Handling:** Comprehensive error handling prevents crashes
5. **Backward Compatibility:** Keep `image` field for existing code compatibility
