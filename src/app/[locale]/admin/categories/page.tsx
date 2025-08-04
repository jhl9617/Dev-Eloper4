'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, tagSchema, type CategoryFormData, type TagFormData } from '@/lib/validations/post';
import { generateSlug } from '@/lib/utils/slug';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Tag, Folder, Loader2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  _count?: {
    posts: number;
  };
}

interface TagData {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  _count?: {
    posts: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTag, setEditingTag] = useState<TagData | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const tagForm = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const categoryName = categoryForm.watch('name');
  const tagName = tagForm.watch('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (categoryName && !categoryForm.formState.dirtyFields.slug) {
      const slug = generateSlug(categoryName);
      categoryForm.setValue('slug', slug);
    }
  }, [categoryName, categoryForm]);

  useEffect(() => {
    if (tagName && !tagForm.formState.dirtyFields.slug) {
      const slug = generateSlug(tagName);
      tagForm.setValue('slug', slug);
    }
  }, [tagName, tagForm]);

  const loadData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Load categories via API
      const categoriesResponse = await fetch('/api/admin/categories');
      const categoriesData = await categoriesResponse.json();

      if (!categoriesResponse.ok) {
        throw new Error(categoriesData.error || 'Failed to load categories');
      }

      // Load tags via API
      const tagsResponse = await fetch('/api/admin/tags');
      const tagsData = await tagsResponse.json();

      if (!tagsResponse.ok) {
        throw new Error(tagsData.error || 'Failed to load tags');
      }

      setCategories(categoriesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to load categories and tags.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load data
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCategorySubmit = async (data: CategoryFormData) => {
    setSubmitting(true);

    try {
      let response;
      
      if (editingCategory) {
        // Update existing category
        response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } else {
        // Create new category
        response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'Slug already exists') {
          categoryForm.setError('slug', { message: 'This slug already exists' });
          return;
        }
        throw new Error(result.error || 'Failed to save category');
      }

      toast({
        description: editingCategory ? 'Category updated successfully!' : 'Category created successfully!',
      });

      setShowCategoryDialog(false);
      setEditingCategory(null);
      categoryForm.reset();
      loadData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to save category. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTagSubmit = async (data: TagFormData) => {
    setSubmitting(true);

    try {
      let response;
      
      if (editingTag) {
        // Update existing tag
        response = await fetch(`/api/admin/tags/${editingTag.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } else {
        // Create new tag
        response = await fetch('/api/admin/tags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'Slug already exists') {
          tagForm.setError('slug', { message: 'This slug already exists' });
          return;
        }
        throw new Error(result.error || 'Failed to save tag');
      }

      toast({
        description: editingTag ? 'Tag updated successfully!' : 'Tag created successfully!',
      });

      setShowTagDialog(false);
      setEditingTag(null);
      tagForm.reset();
      loadData();
    } catch (error) {
      console.error('Error saving tag:', error);
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to save tag. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (category._count?.posts && category._count.posts > 0) {
      toast({
        variant: 'destructive',
        description: `Cannot delete category "${category.name}" because it has ${category._count.posts} posts.`,
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete category');
      }

      toast({
        description: 'Category deleted successfully!',
      });

      loadData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to delete category. Please try again.',
      });
    }
  };

  const handleDeleteTag = async (tag: TagData) => {
    if (tag._count?.posts && tag._count.posts > 0) {
      toast({
        variant: 'destructive',
        description: `Cannot delete tag "${tag.name}" because it has ${tag._count.posts} posts.`,
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tags/${tag.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete tag');
      }

      toast({
        description: 'Tag deleted successfully!',
      });

      loadData();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to delete tag. Please try again.',
      });
    }
  };

  const openCategoryDialog = (category?: Category) => {
    setEditingCategory(category || null);
    if (category) {
      categoryForm.reset({
        name: category.name,
        slug: category.slug,
      });
    } else {
      categoryForm.reset();
    }
    setShowCategoryDialog(true);
  };

  const openTagDialog = (tag?: TagData) => {
    setEditingTag(tag || null);
    if (tag) {
      tagForm.reset({
        name: tag.name,
        slug: tag.slug,
      });
    } else {
      tagForm.reset();
    }
    setShowTagDialog(true);
  };

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        </div>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm">디버그 정보:</p>
          <p className="text-sm">사용자: {user?.email || 'Not logged in'}</p>
          <p className="text-sm">관리자 여부: {isAdmin ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading categories and tags...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Categories & Tags</h1>
        <p className="text-muted-foreground">
          Organize your content with categories and tags
        </p>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Categories</h2>
            <Button onClick={() => openCategoryDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Folder className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <Badge variant="secondary">
                      {category._count?.posts || 0} posts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Slug: {category.slug}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(category.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCategoryDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={category._count?.posts && category._count.posts > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {categories.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Folder className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">No categories yet</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Create your first category to organize your posts.
                  </p>
                  <Button onClick={() => openCategoryDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Tags</h2>
            <Button onClick={() => openTagDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tag
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <Card key={tag.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-green-500" />
                      <CardTitle className="text-lg">{tag.name}</CardTitle>
                    </div>
                    <Badge variant="secondary">
                      {tag._count?.posts || 0} posts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Slug: {tag.slug}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(tag.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTagDialog(tag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTag(tag)}
                        disabled={tag._count?.posts && tag._count.posts > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {tags.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Tag className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">No tags yet</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Create your first tag to label your posts.
                  </p>
                  <Button onClick={() => openTagDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tag
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Update the category information.' 
                : 'Create a new category to organize your posts.'
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={categoryForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="category-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCategoryDialog(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingCategory ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingCategory ? 'Update' : 'Create'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTag ? 'Edit Tag' : 'Add Tag'}
            </DialogTitle>
            <DialogDescription>
              {editingTag 
                ? 'Update the tag information.' 
                : 'Create a new tag to label your posts.'
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...tagForm}>
            <form onSubmit={tagForm.handleSubmit(handleTagSubmit)} className="space-y-4">
              <FormField
                control={tagForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter tag name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={tagForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="tag-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTagDialog(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingTag ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingTag ? 'Update' : 'Create'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}