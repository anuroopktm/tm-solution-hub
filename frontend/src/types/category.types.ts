export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon?: string | null;
  thumbnail_url?: string | null;
  solutions_count?: number;
}
