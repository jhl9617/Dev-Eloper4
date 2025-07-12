/**
 * Tests for HTML utility functions
 * These tests ensure the image extraction functionality works correctly
 */

import { 
  extractFirstImageFromHtml, 
  extractAllImagesFromHtml, 
  getPostThumbnail, 
  hasImages,
  extractTextFromHtml 
} from '../html-utils';

describe('HTML Utils', () => {
  describe('extractFirstImageFromHtml', () => {
    it('should extract first image URL from HTML', () => {
      const html = '<p>Some text</p><img src="https://example.com/image1.jpg" alt="Image 1"><img src="https://example.com/image2.jpg" alt="Image 2">';
      const result = extractFirstImageFromHtml(html);
      expect(result).toBe('https://example.com/image1.jpg');
    });

    it('should return null when no images exist', () => {
      const html = '<p>Just some text with no images</p>';
      const result = extractFirstImageFromHtml(html);
      expect(result).toBeNull();
    });

    it('should return null for empty content', () => {
      const result = extractFirstImageFromHtml('');
      expect(result).toBeNull();
    });

    it('should handle malformed HTML gracefully', () => {
      const html = '<img src="test.jpg"'; // missing closing >
      const result = extractFirstImageFromHtml(html);
      expect(result).toBeNull();
    });
  });

  describe('extractAllImagesFromHtml', () => {
    it('should extract all image URLs from HTML', () => {
      const html = '<img src="image1.jpg"><p>Text</p><img src="image2.jpg"><img src="image3.jpg">';
      const result = extractAllImagesFromHtml(html);
      expect(result).toEqual(['image1.jpg', 'image2.jpg', 'image3.jpg']);
    });

    it('should return empty array when no images exist', () => {
      const html = '<p>No images here</p>';
      const result = extractAllImagesFromHtml(html);
      expect(result).toEqual([]);
    });
  });

  describe('getPostThumbnail', () => {
    it('should prioritize cover image over content images', () => {
      const coverImage = 'https://example.com/cover.jpg';
      const content = '<img src="https://example.com/content.jpg">';
      const result = getPostThumbnail(coverImage, content);
      expect(result).toBe(coverImage);
    });

    it('should use first content image when no cover image', () => {
      const content = '<p>Text</p><img src="https://example.com/content.jpg"><img src="https://example.com/content2.jpg">';
      const result = getPostThumbnail(null, content);
      expect(result).toBe('https://example.com/content.jpg');
    });

    it('should return null when no images available', () => {
      const result = getPostThumbnail(null, '<p>No images</p>');
      expect(result).toBeNull();
    });
  });

  describe('hasImages', () => {
    it('should return true when content has images', () => {
      const html = '<p>Text</p><img src="test.jpg">';
      expect(hasImages(html)).toBe(true);
    });

    it('should return false when content has no images', () => {
      const html = '<p>Just text</p>';
      expect(hasImages(html)).toBe(false);
    });

    it('should return false for empty content', () => {
      expect(hasImages('')).toBe(false);
    });
  });

  describe('extractTextFromHtml', () => {
    it('should extract plain text from HTML', () => {
      const html = '<h1>Title</h1><p>Paragraph with <strong>bold</strong> text</p>';
      const result = extractTextFromHtml(html);
      expect(result).toBe('Title Paragraph with bold text');
    });

    it('should return empty string for empty content', () => {
      const result = extractTextFromHtml('');
      expect(result).toBe('');
    });

    it('should handle content with only HTML tags', () => {
      const html = '<div><span></span></div>';
      const result = extractTextFromHtml(html);
      expect(result).toBe('');
    });
  });
});