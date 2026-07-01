// ============================================================
// Yemen Educational Marketplace — Database TypeScript Types
// Auto-generated types aligned with Supabase schema
// ============================================================

export type DegreeLevel =
  | "bachelor"
  | "master"
  | "phd"
  | "diploma"
  | "certificate"
  | "course";

export type ProgramStatus = "active" | "inactive" | "draft";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type InstitutionType =
  | "university"
  | "institute"
  | "academy"
  | "college";

// ============================================================
// JSONB Metadata Type — الحقول غير المتجانسة
// ============================================================

export interface ProgramMetadata {
  // Financial
  fees_per_year?: number;
  fees_per_semester?: number;
  fees_currency?: string; // YER, USD, SAR

  // Academic
  total_credit_hours?: number;
  total_hours?: number; // generic hours
  academic_year?: string;
  language_of_instruction?: string;

  // Admission
  admission_requirements?: string[];
  min_gpa?: number;
  required_documents?: string[];
  available_seats?: number;

  // Specializations
  specializations?: string[];
  tracks?: string[];

  // Graduation
  graduation_requirements?: string;
  internship_required?: boolean;
  thesis_required?: boolean;

  // Accreditation
  accreditation?: string;
  ranking?: number;

  // Contact
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };

  // Social
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    telegram?: string;
  };

  // Raw data from Excel/Word files
  raw_excel_data?: Record<string, unknown>[];
  keywords?: string[];

  // Extra institution-specific fields
  [key: string]: unknown;
}

// ============================================================
// Supabase Database Type
// ============================================================

export type Database = {
  public: {
    Tables: {
      institutions: {
        Row: {
          id: string;
          name_ar: string;
          name_en: string | null;
          slug: string | null;
          logo_url: string | null;
          cover_url: string | null;
          city: string | null;
          type: InstitutionType;
          website: string | null;
          phone: string | null;
          email: string | null;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name_ar: string;
          name_en?: string | null;
          slug?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          city?: string | null;
          type?: InstitutionType;
          website?: string | null;
          phone?: string | null;
          email?: string | null;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["institutions"]["Insert"]>;
      };

      programs: {
        Row: {
          id: string;
          institution_id: string;
          title_ar: string;
          title_en: string | null;
          slug: string | null;
          degree_level: DegreeLevel;
          faculty_ar: string | null;
          faculty_en: string | null;
          description_ar: string | null;
          description_en: string | null;
          duration_years: number | null;
          duration_semesters: number | null;
          cover_image_url: string | null;
          study_plan_pdf_url: string | null;
          status: ProgramStatus;
          views_count: number;
          favorites_count: number;
          average_rating: number;
          ratings_count: number;
          metadata: ProgramMetadata;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          title_ar: string;
          title_en?: string | null;
          slug?: string | null;
          degree_level: DegreeLevel;
          faculty_ar?: string | null;
          faculty_en?: string | null;
          description_ar?: string | null;
          description_en?: string | null;
          duration_years?: number | null;
          duration_semesters?: number | null;
          cover_image_url?: string | null;
          study_plan_pdf_url?: string | null;
          status?: ProgramStatus;
          views_count?: number;
          favorites_count?: number;
          average_rating?: number;
          ratings_count?: number;
          metadata?: ProgramMetadata;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["programs"]["Insert"]>;
      };

      favorites: {
        Row: {
          user_id: string;
          program_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          program_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Insert"]>;
      };

      ratings: {
        Row: {
          user_id: string;
          program_id: string;
          rating: number;
          review: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          program_id: string;
          rating: number;
          review?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ratings"]["Insert"]>;
      };

      user_profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          city: string | null;
          phone: string | null;
          // v0.5.0 — Verification fields
          approval_status: ApprovalStatus;
          full_name_4_parts: string | null;
          institution_name_request: string | null;
          job_title: string | null;
          personal_contact: string | null;
          institution_contact: string | null;
          id_image_url: string | null;
          work_id_image_url: string | null;
          auth_letter_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          phone?: string | null;
          // v0.5.0 — Verification fields
          approval_status?: ApprovalStatus;
          full_name_4_parts?: string | null;
          institution_name_request?: string | null;
          job_title?: string | null;
          personal_contact?: string | null;
          institution_contact?: string | null;
          id_image_url?: string | null;
          work_id_image_url?: string | null;
          auth_letter_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Insert"]>;
      };

      conversations: {
        Row: {
          id: string;
          student_id: string;
          institution_id: string;
          program_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          institution_id: string;
          program_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
      };

      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      increment_program_views: {
        Args: { p_program_id: string };
        Returns: void;
      };
      generate_slug: {
        Args: { input_text: string };
        Returns: string;
      };
    };

    Enums: {
      degree_level_enum: DegreeLevel;
      program_status_enum: ProgramStatus;
      institution_type_enum: InstitutionType;
    };
  };
};

// ============================================================
// Convenience Row Types (for use in components)
// ============================================================

export type Institution =
  Database["public"]["Tables"]["institutions"]["Row"];
export type Program = Database["public"]["Tables"]["programs"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type Rating = Database["public"]["Tables"]["ratings"]["Row"];
export type UserProfile =
  Database["public"]["Tables"]["user_profiles"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];

// Extended types with relations
export type ProgramWithInstitution = Program & {
  institutions: Pick<Institution, "id" | "name_ar" | "name_en" | "logo_url" | "city">;
};

export type ProgramWithDetails = Program & {
  institutions: Institution;
  user_favorite?: boolean;
  user_rating?: number;
};

// ============================================================
// Supabase-compatible Tables helper (used by some components)
// Allows: Tables<'programs'>, Tables<'institutions'>, etc.
// ============================================================
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

