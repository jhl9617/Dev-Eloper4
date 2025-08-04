import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/admin/tags/[id] - Update tag
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

    // Check if slug already exists for different tag
    const { data: existingTag } = await serviceSupabase
      .from('tags')
      .select('id')
      .eq('slug', slug)
      .neq('id', parseInt(id))
      .is('deleted_at', null)
      .single();

    if (existingTag) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    // Update tag
    const { data: tag, error } = await serviceSupabase
      .from('tags')
      .update({ name, slug })
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

// DELETE /api/admin/tags/[id] - Delete tag
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

    // Check if tag has posts
    const { data: postTags, error: postTagsError } = await serviceSupabase
      .from('post_tags')
      .select('post_id')
      .eq('tag_id', parseInt(id));

    if (postTagsError) {
      throw postTagsError;
    }

    if (postTags && postTags.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete tag because it has ${postTags.length} posts` },
        { status: 409 }
      );
    }

    // Soft delete tag
    const { error } = await serviceSupabase
      .from('tags')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', parseInt(id));

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}