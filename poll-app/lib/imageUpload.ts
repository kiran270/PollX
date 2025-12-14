// Simple image upload utility
// For production, consider using cloud storage like Cloudinary, AWS S3, or Vercel Blob

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 5MB limit.' }
  }

  return { valid: true }
}

export function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

export function isGifUrl(url: string): boolean {
  return url.toLowerCase().endsWith('.gif') || url.includes('giphy.com') || url.includes('tenor.com')
}

// For GIF search, you can integrate with Giphy API
// Get free API key from: https://developers.giphy.com/
export async function searchGifs(query: string, apiKey?: string): Promise<any[]> {
  if (!apiKey) {
    // Return empty array if no API key
    return []
  }

  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20&rating=g`
    )
    const data = await response.json()
    return data.data || []
  } catch (error) {
    return []
  }
}
