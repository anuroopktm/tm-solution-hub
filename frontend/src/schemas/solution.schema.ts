import { z } from "zod";

const createRequiredUrl = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine(
      (val) => /^https?:\/\/.+/.test(val),
      `Please enter a valid ${label} (starting with http:// or https://)`,
    );

export const keyCapabilitySchema = z.object({
  name: z.string().trim().min(1, "Capability title is required"),
  description: z.string().trim().min(1, "Capability description is required"),
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
  file_size_bytes: z.number().optional(),
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
    .min(1, "Title is missing (minimum 2 words required)")
    .refine(
      (val) => val.trim().split(/\s+/).filter(Boolean).length >= 2,
      "Title is too short (minimum 2 words required, e.g. 'Enterprise Search')",
    )
    .max(150, "Title must be at most 150 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is missing (minimum 10 characters required)")
    .min(10, "Description is too short (minimum 10 characters required)"),
  category_ids: z
    .array(z.string())
    .min(1, "Please select at least 1 domain category"),
  lead_id: z.string().optional(),
  tech_stack: z
    .array(z.string())
    .min(1, "Please select or add at least 1 technology or framework"),
  key_capabilities: z
    .array(keyCapabilitySchema)
    .min(1, "Please add at least 1 key capability"),
  repository_url: createRequiredUrl("Repository URL"),
  preview_url: createRequiredUrl("Live Preview URL"),
  thumbnail_url: createRequiredUrl("Thumbnail URL"),
  service_urls: z.array(serviceUrlSchema).optional(),
  documents: z.array(solutionDocumentSchema).optional(),
  videos: z.array(solutionVideoSchema).optional(),
});

export type SolutionCreateFormValues = z.infer<typeof solutionCreateSchema>;
export type KeyCapabilityFormValues = z.infer<typeof keyCapabilitySchema>;
export type ServiceUrlFormValues = z.infer<typeof serviceUrlSchema>;
export type SolutionDocumentFormValues = z.infer<typeof solutionDocumentSchema>;
export type SolutionVideoFormValues = z.infer<typeof solutionVideoSchema>;
