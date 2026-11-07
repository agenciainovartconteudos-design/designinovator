export type AppRole = "admin" | "editor" | "member";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string;
          email: string | null;
          avatar_url: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nome?: string;
          email?: string | null;
          avatar_url?: string | null;
          status?: string;
        };
        Update: {
          nome?: string;
          email?: string | null;
          avatar_url?: string | null;
          status?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: AppRole;
        };
        Update: {
          role?: AppRole;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          client_name: string;
          description: string | null;
          image_url: string | null;
          status: string;
          approval_token: string;
          created_by: string | null;
          canvas_data: Json | null;
          caption: string | null;
          scheduled_at: string | null;
          script_id: string | null;
          media_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          client_name?: string;
          description?: string | null;
          image_url?: string | null;
          status?: string;
          approval_token?: string;
          created_by?: string | null;
          canvas_data?: Json | null;
          caption?: string | null;
          scheduled_at?: string | null;
          script_id?: string | null;
          media_id?: string | null;
        };
        Update: {
          title?: string;
          client_name?: string;
          description?: string | null;
          image_url?: string | null;
          status?: string;
          canvas_data?: Json | null;
          caption?: string | null;
          scheduled_at?: string | null;
          script_id?: string | null;
          media_id?: string | null;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          message: string;
          author: string;
          x: number | null;
          y: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          message: string;
          author?: string;
          x?: number | null;
          y?: number | null;
        };
        Update: {
          message?: string;
        };
      };
      scripts: {
        Row: {
          id: string;
          name: string;
          content: string;
          status: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          content: string;
          status?: string;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          content?: string;
          status?: string;
        };
      };
      media_library: {
        Row: {
          id: string;
          name: string;
          url: string;
          type: string;
          tags: string[] | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          url: string;
          type?: string;
          tags?: string[] | null;
          created_by?: string | null;
        };
        Update: {
          name?: string;
          url?: string;
          type?: string;
          tags?: string[] | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          type: string;
          title: string;
          message: string | null;
          post_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type?: string;
          title: string;
          message?: string | null;
          post_id?: string | null;
          read?: boolean;
        };
        Update: {
          read?: boolean;
        };
      };
      approval_history: {
        Row: {
          id: string;
          post_id: string;
          action: string;
          actor: string;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          action: string;
          actor?: string;
          message?: string | null;
        };
        Update: Record<string, never>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: AppRole };
        Returns: boolean;
      };
      get_posts_by_token: {
        Args: { p_token: string };
        Returns: Database["public"]["Tables"]["posts"]["Row"][];
      };
      set_post_status_by_token: {
        Args: { p_token: string; p_status: string };
        Returns: void;
      };
      add_comment_by_token: {
        Args: { p_token: string; p_message: string; p_author?: string; p_x?: number; p_y?: number };
        Returns: void;
      };
    };
    Enums: {
      app_role: AppRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
