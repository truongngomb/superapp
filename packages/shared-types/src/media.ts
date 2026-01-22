/**
 * Media Types
 */

/**
 * Media Record Structure
 */
export interface Media {
  id: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
  file: string; // Filename
  alt?: string;
  caption?: string;
  url: string; // Helper for frontend
  refId?: string; // Reference ID (e.g. MarkdownPage ID)
  refType?: string; // Reference Type (e.g. 'markdown_pages')
  user?: string; // Owner ID (User who uploaded)
}

/**
 * Input for uploading media
 */
export type MediaUploadInput = FormData;

/**
 * Response when uploading media
 */
export interface MediaUploadResponse extends Media {
  url: string; // Full URL to access the file
}
