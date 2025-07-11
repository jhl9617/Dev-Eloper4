import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived'

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          user_id: string
          added_at: string
        }
        Insert: {
          user_id: string
          added_at?: string
        }
        Update: {
          user_id?: string
          added_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          status: PostStatus
          published_at: string | null
          title: string
          content: string
          slug: string
          cover_image_path: string | null
          category_id: number | null
          search_vector: unknown
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          status?: PostStatus
          published_at?: string | null
          title: string
          content: string
          slug: string
          cover_image_path?: string | null
          category_id?: number | null
          search_vector?: unknown
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          status?: PostStatus
          published_at?: string | null
          title?: string
          content?: string
          slug?: string
          cover_image_path?: string | null
          category_id?: number | null
          search_vector?: unknown
        }
      }
      categories: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          deleted_at: string | null
          name: string
          slug: string
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          name: string
          slug: string
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          name?: string
          slug?: string
        }
      }
      tags: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          deleted_at: string | null
          name: string
          slug: string
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          name: string
          slug: string
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          name?: string
          slug?: string
        }
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: number
          created_at: string
        }
        Insert: {
          post_id: string
          tag_id: number
          created_at?: string
        }
        Update: {
          post_id?: string
          tag_id?: number
          created_at?: string
        }
      }
      post_revisions: {
        Row: {
          id: number
          post_id: string
          title: string | null
          content: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: number
          post_id: string
          title?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: number
          post_id?: string
          title?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
    }
  }
}