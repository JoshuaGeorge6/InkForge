// Auto-generated Supabase types
// TODO: Generate these using supabase gen types typescript --project-id <your-project-id>
// For now, this is a placeholder structure

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          project_id: string
          title: string
          content: Json
          word_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          content: Json
          word_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          content?: Json
          word_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      characters: {
        Row: {
          id: string
          project_id: string
          name: string
          profile: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          profile: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          profile?: Json
          created_at?: string
          updated_at?: string
        }
      }
      evidence: {
        Row: {
          id: string
          character_id: string
          document_id: string | null
          snippet: string
          character_change: Json
          inference_reasoning: string
          created_at: string
        }
        Insert: {
          id?: string
          character_id: string
          document_id?: string | null
          snippet: string
          character_change: Json
          inference_reasoning: string
          created_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          document_id?: string | null
          snippet?: string
          character_change?: Json
          inference_reasoning?: string
          created_at?: string
        }
      }
    }
  }
}
