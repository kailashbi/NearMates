/**
 * Image processing utilities for NearMates client
 * Resizes and compresses image files client-side into lightweight data URLs
 */

export function processImageFile(file, maxWidth = 400, maxHeight = 400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (JPEG, PNG, WebP).'));
    }

    // Limit original file size to 15MB to prevent memory exhaustion
    if (file.size > 15 * 1024 * 1024) {
      return reject(new Error('File is too large. Please select an image under 15MB.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file content.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding within maxWidth and maxHeight
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas context could not be created.'));
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG for optimal compression ratio while preserving clarity
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}

