import { z } from 'zod';
import type { PostStatus } from '@/types/database';

export const postSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  content: z
    .string()
    .min(1, 'Content is required'),
  
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  
  status: z.enum(['draft', 'scheduled', 'published', 'archived'] as const),
  
  published_at: z
    .string()
    .datetime()
    .optional()
    .nullable(),
  
  cover_image_path: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .nullable(),
  
  category_id: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  
  tag_ids: z
    .array(z.number().int().positive())
    .default([]),
});

export type PostFormData = z.infer<typeof postSchema>;

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters'),
  
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const tagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name must be less than 50 characters'),
  
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

export type TagFormData = z.infer<typeof tagSchema>;