'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/lib/supabase/client';
import { postSchema, type PostFormData } from '@/lib/validations/post';
import { generateSlug } from '@/lib/utils/slug';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MarkdownEditor } from '@/components/admin/markdown-editor';
import { ImageUpload } from '@/components/admin/image-upload';
import { Save, Send, Clock, Archive, ArrowLeft, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface PostData {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  published_at: string | null;
  cover_image_path: string | null;
  category_id: number | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  post_tags?: Array<{
    tag: Tag;
  }>;
}

export default function EditPostPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [post, setPost] = useState<PostData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const supabase = createClient();
  
  const postId = params.id as string;

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      slug: '',
      status: 'draft',
      published_at: null,
      cover_image_path: null,
      category_id: null,
      tag_ids: [],
    },
  });

  const title = form.watch('title');

  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      if (!postId) return;
      
      setPageLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            category:categories(*),
            post_tags(tag:tags(*))
          `)
          .eq('id', postId)
          .is('deleted_at', null)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error('Post not found');
        }

        setPost(data);
        
        // Populate form
        form.reset({
          title: data.title,
          content: data.content,
          slug: data.slug,
          status: data.status,
          published_at: data.published_at,
          cover_image_path: data.cover_image_path,
          category_id: data.category_id,
          tag_ids: data.post_tags?.map(pt => pt.tag.id) || [],
        });

        // Set selected tags
        setSelectedTags(data.post_tags?.map(pt => pt.tag.id) || []);
        
      } catch (error) {
        console.error('Error loading post:', error);
        toast({
          variant: 'destructive',
          description: 'Failed to load post. Please try again.',
        });
        router.push('/admin/posts');
      } finally {
        setPageLoading(false);
      }
    };

    loadPost();
  }, [postId, supabase, form, router, toast]);

  // Auto-generate slug from title (only if slug field is empty)
  useEffect(() => {
    if (title && !form.getValues('slug')) {
      const slug = generateSlug(title);
      form.setValue('slug', slug);
    }
  }, [title, form]);

  // Load categories and tags
  useEffect(() => {
    const loadData = async () => {
      const [categoriesRes, tagsRes] = await Promise.all([
        supabase.from('categories').select('*').is('deleted_at', null).order('name'),
        supabase.from('tags').select('*').is('deleted_at', null).order('name'),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (tagsRes.data) setTags(tagsRes.data);
    };

    loadData();
  }, [supabase]);

  const onSubmit = async (data: PostFormData, status: PostFormData['status']) => {
    if (!post) return;
    
    setLoading(true);

    try {
      // Check if slug already exists (excluding current post)
      const { data: existingPost } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', data.slug)
        .neq('id', post.id)
        .is('deleted_at', null)
        .single();

      if (existingPost) {
        form.setError('slug', { message: 'This slug already exists' });
        setLoading(false);
        return;
      }

      // Prepare post data
      const postData = {
        ...data,
        status,
        published_at: status === 'published' && !data.published_at 
          ? new Date().toISOString() 
          : data.published_at,
        updated_at: new Date().toISOString(),
        tag_ids: undefined, // Remove from main update
      };

      // Update post
      const { error: postError } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', post.id);

      if (postError) throw postError;

      // Update tags - delete existing and insert new ones
      const { error: deleteTagError } = await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', post.id);

      if (deleteTagError) throw deleteTagError;

      // Insert new tags if any selected
      if (selectedTags.length > 0) {
        const tagRelations = selectedTags.map(tagId => ({
          post_id: post.id,
          tag_id: tagId,
        }));

        const { error: tagError } = await supabase
          .from('post_tags')
          .insert(tagRelations);

        if (tagError) throw tagError;
      }

      toast({
        description: `Post ${status === 'published' ? 'published' : 'updated'} successfully!`,
      });

      router.push('/admin/posts');
      router.refresh();
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to update post. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleDelete = async () => {
    if (!post) return;
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('posts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', post.id);

      if (error) throw error;

      toast({
        description: 'Post deleted successfully!',
      });

      router.push('/admin/posts');
      router.refresh();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to delete post. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/admin/posts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/admin/posts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Posts
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Post</h1>
              <p className="text-muted-foreground">
                Update your blog post
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </Badge>
            {post.status === 'published' && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/posts/${post.slug}`} target="_blank">
                  <Eye className="h-4 w-4 mr-2" />
                  View Live
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <Form {...form}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter post title..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="post-url-slug" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <MarkdownEditor
                          value={field.value}
                          onChange={field.onChange}
                          height="h-96"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    onClick={() => onSubmit(form.getValues(), 'draft')}
                    disabled={loading}
                    variant="outline"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onSubmit(form.getValues(), 'published')}
                    disabled={loading}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {post.status === 'published' ? 'Update' : 'Publish'}
                  </Button>
                  {post.status === 'published' && (
                    <Button
                      type="button"
                      onClick={() => onSubmit(form.getValues(), 'draft')}
                      disabled={loading}
                      variant="outline"
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Unpublish
                    </Button>
                  )}
                </div>
                
                <Separator />
                
                <Button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Post
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                        value={field.value?.toString() || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No category</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cover_image_path"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          label="Cover Image"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={selectedTags.includes(tag.id)}
                          onCheckedChange={() => handleTagToggle(tag.id)}
                        />
                        <Label htmlFor={`tag-${tag.id}`} className="text-sm">
                          {tag.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Post Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated:</span>
                  <span>{new Date(post.updated_at).toLocaleDateString()}</span>
                </div>
                {post.published_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published:</span>
                    <span>{new Date(post.published_at).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Form>
    </div>
  );
}