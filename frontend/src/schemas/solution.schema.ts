import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => !val || /^https?:\/\/.+/.test(val),
    "Please enter a valid URL (starting with http:// or https://)",
  );

export const keyCapabilitySchema = z.object({
  name: z.string().trim(),
  description: z.string().trim().optional(),
});

export const serviceUrlSchema = z.object({
  service_name: z.string().trim(),
  service_type: z.string().trim().optional(),
  environment: z.string().trim().optional(),
  target_url: z.string().trim(),
});

export const solutionDocumentSchema = z.object({
  name: z.string().trim(),
  format: z.string().trim().optional(),
  file_url: z.string().trim(),
  description: z.string().trim().optional(),
});

export const solutionVideoSchema = z.object({
  title: z.string().trim(),
  video_url: z.string().trim(),
  description: z.string().trim().optional(),
});

export const solutionCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Solution title is required")
    .max(150, "Solution title must be at most 150 characters"),
  description: z.string().trim().optional(),
  category_ids: z.array(z.string()).optional(),
  lead_id: z.string().optional(),
  repository_url: optionalUrl,
  preview_url: optionalUrl,
  thumbnail_url: optionalUrl,
  tech_stack: z.array(z.string()).optional(),
  key_capabilities: z.array(keyCapabilitySchema).optional(),
  service_urls: z.array(serviceUrlSchema).optional(),
  documents: z.array(solutionDocumentSchema).optional(),
  videos: z.array(solutionVideoSchema).optional(),
});

export type SolutionCreateFormValues = z.infer<typeof solutionCreateSchema>;
export type KeyCapabilityFormValues = z.infer<typeof keyCapabilitySchema>;
export type ServiceUrlFormValues = z.infer<typeof serviceUrlSchema>;
export type SolutionDocumentFormValues = z.infer<typeof solutionDocumentSchema>;
export type SolutionVideoFormValues = z.infer<typeof solutionVideoSchema>;
