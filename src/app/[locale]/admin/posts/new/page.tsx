'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { RichTextEditorEnhanced } from '@/components/admin/rich-text-editor-enhanced';
import { ImageUpload } from '@/components/admin/image-upload';
import { Save, Send, Clock, Archive, Loader2 } from 'lucide-react';

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

export default function NewPostPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

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

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !form.formState.dirtyFields.slug) {
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
    setLoading(true);

    try {
      // Check if slug already exists
      const { data: existingPost } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', data.slug)
        .is('deleted_at', null)
        .maybeSingle();

      if (existingPost) {
        form.setError('slug', { message: 'This slug already exists' });
        setLoading(false);
        return;
      }

      // Prepare post data
      const { tag_ids, ...postDataWithoutTags } = data;
      const postData = {
        ...postDataWithoutTags,
        status,
        published_at: status === 'published' ? new Date().toISOString() : data.published_at,
      };

      // Insert post
      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();

      if (postError) throw postError;

      // Insert tags if any selected
      if (selectedTags.length > 0) {
        const tagRelations = selectedTags.map(tagId => ({
          post_id: newPost.id,
          tag_id: tagId,
        }));

        const { error: tagError } = await supabase
          .from('post_tags')
          .insert(tagRelations);

        if (tagError) throw tagError;
      }

      toast({
        description: `Post ${status === 'published' ? 'published' : 'saved'} successfully!`,
      });

      router.push('/admin/posts');
      router.refresh();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to save post. Please try again.',
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

  if (authLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don&apos;t have permission to access this page.</p>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">Debug Info:</p>
            <p className="text-sm">User: {user?.email || 'Not logged in'}</p>
            <p className="text-sm">Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-muted-foreground">
          Write and publish your blog post
        </p>
      </div>

      <Form {...form}>
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
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
                        <RichTextEditorEnhanced
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Start writing your post content..."
                          showWordCount={true}
                          maxLength={50000}
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
                <CardTitle>Publish</CardTitle>
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
                    Publish Now
                  </Button>
                </div>
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
                        onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                        value={field.value?.toString()}
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
          </div>
        </div>
      </Form>
    </div>
  );
}