/**
 * Extract the first image URL from HTML content
 * @param htmlContent - The HTML content to parse
 * @returns The first image URL found, or null if no image exists
 */
export function extractFirstImageFromHtml(htmlContent: string): string | null {
  if (!htmlContent) return null;

  // Create a temporary DOM element to parse HTML
  if (typeof window === 'undefined') {
    // Server-side: Use regex to extract first image
    const imgRegex = /<img[^>]+src="([^"]*)"[^>]*>/i;
    const match = htmlContent.match(imgRegex);
    return match ? match[1] : null;
  }

  // Client-side: Use DOM parsing
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const firstImg = doc.querySelector('img');
    return firstImg ? firstImg.src : null;
  } catch (error) {
    console.error('Error parsing HTML for image extraction:', error);
    return null;
  }
}

/**
 * Extract all image URLs from HTML content
 * @param htmlContent - The HTML content to parse
 * @returns Array of image URLs found
 */
export function extractAllImagesFromHtml(htmlContent: string): string[] {
  if (!htmlContent) return [];

  if (typeof window === 'undefined') {
    // Server-side: Use regex to extract all images
    const imgRegex = /<img[^>]+src="([^"]*)"[^>]*>/gi;
    const matches = htmlContent.matchAll(imgRegex);
    return Array.from(matches).map(match => match[1]);
  }

  // Client-side: Use DOM parsing
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const images = doc.querySelectorAll('img');
    return Array.from(images).map(img => img.src);
  } catch (error) {
    console.error('Error parsing HTML for image extraction:', error);
    return [];
  }
}

/**
 * Get the best thumbnail for a post
 * Priority: cover_image_path > first image in content > null
 * @param coverImagePath - The post's cover image path
 * @param htmlContent - The post's HTML content
 * @returns The best thumbnail URL or null
 */
export function getPostThumbnail(coverImagePath: string | null, htmlContent: string): string | null {
  // Priority 1: Use cover image if available
  if (coverImagePath) {
    return coverImagePath;
  }

  // Priority 2: Use first image from content
  return extractFirstImageFromHtml(htmlContent);
}

/**
 * Check if content has any images
 * @param htmlContent - The HTML content to check
 * @returns true if content contains at least one image
 */
export function hasImages(htmlContent: string): boolean {
  if (!htmlContent) return false;

  const imgRegex = /<img[^>]+src="[^"]*"[^>]*>/i;
  return imgRegex.test(htmlContent);
}

/**
 * Extract text content from HTML (strip all HTML tags)
 * @param htmlContent - The HTML content to parse
 * @returns Plain text content
 */
export function extractTextFromHtml(htmlContent: string): string {
  if (!htmlContent) return '';

  if (typeof window === 'undefined') {
    // Server-side: Use regex to remove HTML tags
    return htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Client-side: Use DOM parsing
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    return doc.body.textContent || doc.body.innerText || '';
  } catch (error) {
    console.error('Error parsing HTML for text extraction:', error);
    return htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}