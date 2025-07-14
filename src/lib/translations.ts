import type { CategoryWithStats, TagWithStats } from '@/lib/blog';

/**
 * Get translated category name using the slug as a key
 * @param categorySlug - The category slug to translate
 * @param t - The translation function from useTranslations('categories')
 * @param fallbackName - Optional fallback name if translation key not found
 * @returns Translated category name or fallback
 */
export function getTranslatedCategoryName(
  categorySlug: string,
  t: (key: string) => string,
  fallbackName?: string
): string {
  try {
    // Try to get translation using slug as key
    const translatedName = t(categorySlug);
    
    // If translation key is not found, next-intl returns the key itself
    // Check if we got a translation or just the key back
    if (translatedName === categorySlug && fallbackName) {
      return fallbackName;
    }
    
    return translatedName;
  } catch (error: any) {
    // If translation fails (MISSING_MESSAGE error), return fallback or original name
    if (error?.code === 'MISSING_MESSAGE') {
      return fallbackName || categorySlug;
    }
    // For other errors, still return fallback
    return fallbackName || categorySlug;
  }
}

/**
 * Get translated category description using the slug as a key
 * @param categorySlug - The category slug to translate
 * @param t - The translation function from useTranslations('categoryDescriptions')
 * @param fallbackDescription - Optional fallback description if translation key not found
 * @returns Translated category description or fallback
 */
export function getTranslatedCategoryDescription(
  categorySlug: string,
  t: (key: string) => string,
  fallbackDescription?: string
): string {
  try {
    const translatedDescription = t(categorySlug);
    
    if (translatedDescription === categorySlug && fallbackDescription) {
      return fallbackDescription;
    }
    
    return translatedDescription;
  } catch (error: any) {
    // If translation fails (MISSING_MESSAGE error), return fallback
    if (error?.code === 'MISSING_MESSAGE') {
      return fallbackDescription || `Explore articles about ${categorySlug}`;
    }
    // For other errors, still return fallback
    return fallbackDescription || `Explore articles about ${categorySlug}`;
  }
}

/**
 * Get translated tag name using the slug as a key
 * @param tagSlug - The tag slug to translate
 * @param t - The translation function from useTranslations('tags')
 * @param fallbackName - Optional fallback name if translation key not found
 * @returns Translated tag name or fallback
 */
export function getTranslatedTagName(
  tagSlug: string,
  t: (key: string) => string,
  fallbackName?: string
): string {
  try {
    const translatedName = t(tagSlug);
    
    if (translatedName === tagSlug && fallbackName) {
      return fallbackName;
    }
    
    return translatedName;
  } catch (error: any) {
    // If translation fails (MISSING_MESSAGE error), return fallback or original name
    if (error?.code === 'MISSING_MESSAGE') {
      return fallbackName || tagSlug;
    }
    // For other errors, still return fallback
    return fallbackName || tagSlug;
  }
}

/**
 * Transform a category object to include translated name and description
 * @param category - The category object with stats
 * @param tCategory - Translation function for category names
 * @param tDescription - Translation function for category descriptions
 * @returns Category object with translated properties
 */
export function getTranslatedCategory(
  category: CategoryWithStats,
  tCategory: (key: string) => string,
  tDescription: (key: string) => string
) {
  return {
    ...category,
    translatedName: getTranslatedCategoryName(category.slug, tCategory, category.name),
    translatedDescription: getTranslatedCategoryDescription(category.slug, tDescription)
  };
}

/**
 * Transform a tag object to include translated name
 * @param tag - The tag object with stats
 * @param tTag - Translation function for tag names
 * @returns Tag object with translated properties
 */
export function getTranslatedTag(
  tag: TagWithStats,
  tTag: (key: string) => string
) {
  return {
    ...tag,
    translatedName: getTranslatedTagName(tag.slug, tTag, tag.name)
  };
}

/**
 * Transform an array of categories to include translated names and descriptions
 * @param categories - Array of category objects with stats
 * @param tCategory - Translation function for category names
 * @param tDescription - Translation function for category descriptions
 * @returns Array of category objects with translated properties
 */
export function getTranslatedCategories(
  categories: CategoryWithStats[],
  tCategory: (key: string) => string,
  tDescription: (key: string) => string
) {
  return categories.map(category => getTranslatedCategory(category, tCategory, tDescription));
}

/**
 * Transform an array of tags to include translated names
 * @param tags - Array of tag objects with stats
 * @param tTag - Translation function for tag names
 * @returns Array of tag objects with translated properties
 */
export function getTranslatedTags(
  tags: TagWithStats[],
  tTag: (key: string) => string
) {
  return tags.map(tag => getTranslatedTag(tag, tTag));
}