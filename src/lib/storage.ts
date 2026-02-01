import { supabase } from './supabase'

const BUCKET_NAME = 'notes-files'

/**
 * Upload a file to Supabase Storage
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  slug: string,
  date: string,
  file: File
): Promise<{ url: string; path: string }> {
  // Create a unique path: slug/date/timestamp-filename
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const path = `${slug}/${date}/${timestamp}-${safeName}`

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)

  return {
    url: urlData.publicUrl,
    path,
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Check if file is an image
 */
export function isImageFile(type: string): boolean {
  return type.startsWith('image/')
}

/**
 * Check if file is a PDF
 */
export function isPdfFile(type: string): boolean {
  return type === 'application/pdf'
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
