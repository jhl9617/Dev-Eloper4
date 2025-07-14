import { createPublicClient } from './supabase/server';
import type { Database } from '@/types/database';

type Post = Database['public']['Tables']['posts']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];

export interface PostWithRelations extends Post {
  category?: Category | null;
  tags?: Tag[];
}

export interface CategoryWithStats extends Category {
  post_count: number;
  trending?: boolean;
}

export interface TagWithStats extends Tag {
  post_count: number;
  trending?: boolean;
}

// Get published posts for public display
export async function getPublishedPosts(limit = 10, offset = 0) {
  const supabase = await createPublicClient();
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
  const supabase = await createPublicClient();
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
  const supabase = await createPublicClient();
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
  const supabase = await createPublicClient();
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
  const supabase = await createPublicClient();
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
  const supabase = await createPublicClient();
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

// Get categories with post counts
export async function getCategoriesWithStats(): Promise<CategoryWithStats[]> {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from('categories')
    .select(`
      *,
      posts!inner(id)
    `)
    .is('deleted_at', null)
    .eq('posts.status', 'published')
    .is('posts.deleted_at', null);

  if (error) {
    console.error('Error fetching categories with stats:', error);
    return [];
  }

  // Count posts for each category
  const categoryStats = new Map<string, number>();
  data?.forEach(item => {
    const count = categoryStats.get(item.id.toString()) || 0;
    categoryStats.set(item.id.toString(), count + 1);
  });

  // Get unique categories and add post counts
  const uniqueCategories = new Map();
  data?.forEach(item => {
    if (!uniqueCategories.has(item.id)) {
      uniqueCategories.set(item.id, {
        ...item,
        post_count: categoryStats.get(item.id.toString()) || 0
      });
    }
  });

  return Array.from(uniqueCategories.values()).sort((a, b) => b.post_count - a.post_count);
}

// Get popular categories (top categories by post count)
export async function getPopularCategories(limit = 6): Promise<CategoryWithStats[]> {
  const categoriesWithStats = await getCategoriesWithStats();
  return categoriesWithStats.slice(0, limit);
}

// Get tags with post counts
export async function getTagsWithStats(): Promise<TagWithStats[]> {
  const supabase = await createPublicClient();
  const { data, error } = await supabase
    .from('tags')
    .select(`
      *,
      post_tags!inner(
        posts!inner(id)
      )
    `)
    .is('deleted_at', null)
    .eq('post_tags.posts.status', 'published')
    .is('post_tags.posts.deleted_at', null);

  if (error) {
    console.error('Error fetching tags with stats:', error);
    return [];
  }

  // Count posts for each tag
  const tagStats = new Map<string, number>();
  data?.forEach(item => {
    const count = tagStats.get(item.id.toString()) || 0;
    tagStats.set(item.id.toString(), count + 1);
  });

  // Get unique tags and add post counts
  const uniqueTags = new Map();
  data?.forEach(item => {
    if (!uniqueTags.has(item.id)) {
      uniqueTags.set(item.id, {
        ...item,
        post_count: tagStats.get(item.id.toString()) || 0
      });
    }
  });

  return Array.from(uniqueTags.values()).sort((a, b) => b.post_count - a.post_count);
}

// Get trending tags (top tags by post count)
export async function getTrendingTags(limit = 10): Promise<TagWithStats[]> {
  const tagsWithStats = await getTagsWithStats();
  return tagsWithStats.slice(0, limit);
}