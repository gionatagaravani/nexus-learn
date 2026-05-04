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
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          user_id: string | null
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          created_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          subject_id: string | null
          user_id: string | null
          file_name: string | null
          file_url: string | null
          extracted_text: string | null
          created_at: string
          storage_path: string | null
          filename: string | null
          file_type: string | null
          file_size: number | null
        }
        Insert: {
          id?: string
          subject_id?: string | null
          user_id?: string | null
          file_name?: string | null
          file_url?: string | null
          extracted_text?: string | null
          created_at?: string
          storage_path?: string | null
          filename?: string | null
          file_type?: string | null
          file_size?: number | null
        }
        Update: {
          id?: string
          subject_id?: string | null
          user_id?: string | null
          file_name?: string | null
          file_url?: string | null
          extracted_text?: string | null
          created_at?: string
          storage_path?: string | null
          filename?: string | null
          file_type?: string | null
          file_size?: number | null
        }
      }
      chunks: {
        Row: {
          id: string
          material_id: string | null
          content: string | null
          embedding: number[] | null
          user_id: string | null
        }
        Insert: {
          id?: string
          material_id?: string | null
          content?: string | null
          embedding?: number[] | null
          user_id?: string | null
        }
        Update: {
          id?: string
          material_id?: string | null
          content?: string | null
          embedding?: number[] | null
          user_id?: string | null
        }
      }
      chats: {
        Row: {
          id: string
          subject_id: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          subject_id?: string | null
          user_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          subject_id?: string | null
          user_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string | null
          role: 'user' | 'assistant'
          content: string | null
          created_at: string
          user_id: string | null
          context_sources: string[] | null
        }
        Insert: {
          id?: string
          chat_id?: string | null
          role?: 'user' | 'assistant'
          content?: string | null
          created_at?: string
          user_id?: string | null
          context_sources?: string[] | null
        }
        Update: {
          id?: string
          chat_id?: string | null
          role?: 'user' | 'assistant'
          content?: string | null
          created_at?: string
          user_id?: string | null
          context_sources?: string[] | null
        }
      }
      quizzes: {
        Row: {
          id: string
          subject_id: string | null
          user_id: string | null
          title: string | null
          description: string | null
          difficulty: string | null
          questions: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          subject_id?: string | null
          user_id?: string | null
          title?: string | null
          description?: string | null
          difficulty?: string | null
          questions?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          subject_id?: string | null
          user_id?: string | null
          title?: string | null
          description?: string | null
          difficulty?: string | null
          questions?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
