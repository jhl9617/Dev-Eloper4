import { createClient } from './supabase/client';
import type { Database } from '@/types/database';

type Post = Database['public']['Tables']['posts']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];

export interface PostWithRelations extends Post {
  category?: Category | null;
  tags?: Tag[];
}

// Get published posts for public display
export async function getPublishedPosts(limit = 10, offset = 0) {
  const supabase = createClient();
  const { data, error, count } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(*),
      post_tags(tag:tags(*))
    `, { count: 'exact' })
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], total: 0 };
  }

  // Transform the data to include tags array
  const posts: PostWithRelations[] = data?.map(post => ({
    ...post,
    tags: post.post_tags?.map(pt => pt.tag).filter(Boolean) || []
  })) || [];

  return { posts, total: count || 0 };
}

// Get single post by slug
export async function getPostBySlug(slug: string): Promise<PostWithRelations | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(*),
      post_tags(tag:tags(*))
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  // Transform the data to include tags array
  const post: PostWithRelations = {
    ...data,
    tags: data.post_tags?.map(pt => pt.tag).filter(Boolean) || []
  };

  return post;
}

// Get posts by category
export async function getPostsByCategory(categorySlug: string, limit = 10, offset = 0) {
  const supabase = createClient();
  const { data, error, count } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories!inner(*),
      post_tags(tag:tags(*))
    `, { count: 'exact' })
    .eq('category.slug', categorySlug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching posts by category:', error);
    return { posts: [], total: 0 };
  }

  const posts: PostWithRelations[] = data?.map(post => ({
    ...post,
    tags: post.post_tags?.map(pt => pt.tag).filter(Boolean) || []
  })) || [];

  return { posts, total: count || 0 };
}

// Get posts by tag
export async function getPostsByTag(tagSlug: string, limit = 10, offset = 0) {
  const supabase = createClient();
  const { data, error, count } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(*),
      post_tags!inner(tag:tags!inner(*))
    `, { count: 'exact' })
    .eq('post_tags.tag.slug', tagSlug)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching posts by tag:', error);
    return { posts: [], total: 0 };
  }

  const posts: PostWithRelations[] = data?.map(post => ({
    ...post,
    tags: post.post_tags?.map(pt => pt.tag).filter(Boolean) || []
  })) || [];

  return { posts, total: count || 0 };
}

// Get all categories
export async function getCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('deleted_at', null)
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

// Get all tags
export async function getTags() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .is('deleted_at', null)
    .order('name');

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data || [];
}

// Search posts
export async function searchPosts(query: string, limit = 10, offset = 0) {
  const supabase = createClient();
  const { data, error, count } = await supabase
    .from('posts')
    .select(`
      *,
      category:categories(*),
      post_tags(tag:tags(*))
    `, { count: 'exact' })
    .textSearch('search_vector', query)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error searching posts:', error);
    return { posts: [], total: 0 };
  }

  const posts: PostWithRelations[] = data?.map(post => ({
    ...post,
    tags: post.post_tags?.map(pt => pt.tag).filter(Boolean) || []
  })) || [];

  return { posts, total: count || 0 };
}