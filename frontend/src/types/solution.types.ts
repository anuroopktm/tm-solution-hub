import type { User } from "./auth.types";

export interface SolutionDocument {
  id: string;
  name: string;
  description: string | null;
  format: string;
  file_size_bytes: number | null;
  file_url: string;
  uploaded_at: string;
}

export interface SolutionVideo {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string;
  duration_seconds: number | null;
  created_at: string;
}

export interface SolutionServiceUrl {
  id: string;
  service_name: string;
  service_type: string;
  environment: string;
  target_url: string;
}

export interface KeyCapability {
  name: string;
  description?: string;
  [key: string]: unknown;
}

export interface SolutionCategory {
  id: string;
  name: string;
  description: string | null;
  solutions_count?: number;
}

export interface Solution {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url?: string | null;
  preview_url?: string | null;
  repository_url: string | null;
  tech_stack: string[];
  key_capabilities: KeyCapability[] | null;
  lead_id: string | null;
  lead: User | null;
  categories?: SolutionCategory[];
  documents?: SolutionDocument[];
  videos?: SolutionVideo[];
  service_urls?: SolutionServiceUrl[];
  created_at: string;
  updated_at: string;
}
