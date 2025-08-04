import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/admin/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (adminError || !adminData) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // Use service role client to bypass RLS
    const serviceSupabase = createServiceRoleClient();

    // Check if slug already exists for different category
    const { data: existingCategory } = await serviceSupabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .neq('id', parseInt(id))
      .is('deleted_at', null)
      .single();

    if (existingCategory) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    // Update category
    const { data: category, error } = await serviceSupabase
      .from('categories')
      .update({ name, slug })
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (adminError || !adminData) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    // Use service role client to bypass RLS
    const serviceSupabase = createServiceRoleClient();

    // Check if category has posts
    const { data: posts, error: postsError } = await serviceSupabase
      .from('posts')
      .select('id')
      .eq('category_id', parseInt(id))
      .is('deleted_at', null);

    if (postsError) {
      throw postsError;
    }

    if (posts && posts.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete category because it has ${posts.length} posts` },
        { status: 409 }
      );
    }

    // Soft delete category
    const { error } = await serviceSupabase
      .from('categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', parseInt(id));

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}