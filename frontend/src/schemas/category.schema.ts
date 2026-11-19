import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name must be at most 100 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(500, "Description must be at most 500 characters"),
  icon: z.string().trim().min(1, "Icon is required"),
  thumbnail_url: z
    .string()
    .trim()
    .min(1, "Thumbnail URL is required")
    .refine(
      (val) => /^https?:\/\/.+/.test(val),
      "Please enter a valid URL (starting with http:// or https://)",
    ),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
