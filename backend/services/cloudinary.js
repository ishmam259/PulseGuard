// ═══════════════════════════════════════════════════════════
// PulseGuard AI — Cloudinary Service
// Handles image uploads to Cloudinary using base64 data URIs
// ═══════════════════════════════════════════════════════════

const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload a base64 encoded image to Cloudinary.
 * @param {string} base64DataUri - The data URI (e.g. "data:image/jpeg;base64,...")
 * @param {string} folder - The Cloudinary folder to upload into (e.g. "pulseguard/profiles")
 * @param {string} [publicId] - Optional custom public ID
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
async function uploadBase64Image(base64DataUri, folder = 'pulseguard/profiles', publicId = undefined) {
  const options = {
    folder,
    resource_type: 'image',
    // Overwrite the same image if publicId is provided (e.g. user's profile pic)
    overwrite: true,
    ...(publicId ? { public_id: publicId } : {}),
  }

  const result = await cloudinary.uploader.upload(base64DataUri, options)
  return result.secure_url
}

/**
 * Delete an image from Cloudinary by its public_id.
 * @param {string} publicId
 */
async function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId)
}

module.exports = { uploadBase64Image, deleteImage }
