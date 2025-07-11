export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          title: string;
          content: string;
          excerpt: string | null;
          slug: string;
          status: 'draft' | 'published' | 'archived';
          published_at: string | null;
          cover_image_url: string | null;
          cover_image_path: string | null;
          category_id: string | null;
          deleted_at: string | null;
          search_vector: unknown | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          title: string;
          content: string;
          excerpt?: string | null;
          slug: string;
          status?: 'draft' | 'published' | 'archived';
          published_at?: string | null;
          cover_image_url?: string | null;
          cover_image_path?: string | null;
          category_id?: string | null;
          deleted_at?: string | null;
          search_vector?: unknown | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          title?: string;
          content?: string;
          excerpt?: string | null;
          slug?: string;
          status?: 'draft' | 'published' | 'archived';
          published_at?: string | null;
          cover_image_url?: string | null;
          cover_image_path?: string | null;
          category_id?: string | null;
          deleted_at?: string | null;
          search_vector?: unknown | null;
        };
      };
      categories: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          name: string;
          slug: string;
          description: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          deleted_at?: string | null;
        };
      };
      tags: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          name: string;
          slug: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          name: string;
          slug: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          name?: string;
          slug?: string;
          deleted_at?: string | null;
        };
      };
      post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          email: string;
          role: 'admin' | 'user';
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          email: string;
          role?: 'admin' | 'user';
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          email?: string;
          role?: 'admin' | 'user';
          deleted_at?: string | null;
        };
      };
    };
  };
}

export type PostWithRelations = Database['public']['Tables']['posts']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'] | null;
  tags?: Database['public']['Tables']['tags']['Row'][];
};