export type TaskStatus = 'todo' | 'later' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          icon?: string | null;
          created_at?: string;
        };
        Update: Partial<Category>;
        Relationships: [];
      };
      tags: {
        Row: Tag;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: Partial<Tag>;
        Relationships: [];
      };
      tasks: {
        Row: Task;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          url?: string | null;
          hostname?: string | null;
          favicon_url?: string | null;
          description?: string | null;
          notes?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          category_id?: string | null;
          due_date?: string | null;
          last_opened_at?: string | null;
          completed_at?: string | null;
          archived_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Task>;
        Relationships: [];
      };
      task_tags: {
        Row: TaskTag;
        Insert: {
          task_id: string;
          tag_id: string;
        };
        Update: Partial<TaskTag>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface TaskTag {
  task_id: string;
  tag_id: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  url: string | null;
  hostname: string | null;
  favicon_url: string | null;
  description: string | null;
  notes: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category_id: string | null;
  due_date: string | null;
  last_opened_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskWithDetails extends Task {
  category?: Category | null;
  tags?: Tag[];
}

export interface TaskFiltersState {
  search: string;
  status?: TaskStatus | 'all';
  categoryId?: string | 'all';
  tagId?: string | 'all';
  priority?: TaskPriority | 'all';
  isOverdue?: boolean;
  sortBy: 'created_desc' | 'created_asc' | 'updated_desc' | 'title_asc' | 'priority_desc' | 'due_date_asc';
}
