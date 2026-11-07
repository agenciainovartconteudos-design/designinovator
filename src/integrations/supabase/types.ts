export type AppRole = "admin" | "editor" | "member";

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
        };
        Update: {
          title?: string;
          client_name?: string;
          description?: string | null;
          image_url?: string | null;
          status?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          message: string;
          author: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          message: string;
          author?: string;
        };
        Update: {
          message?: string;
        };
      };
    };
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
        Args: { p_token: string; p_message: string; p_author?: string };
        Returns: void;
      };
    };
  };
};
