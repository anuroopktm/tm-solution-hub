import { useState } from "react";
import {
  useForm,
  useFieldArray,
  type UseFormRegister,
  type FieldErrors,
  type Control,
  type UseFormWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateSolution } from "@/hooks/use-solutions";
import { useCategories } from "@/hooks/use-categories";
import { useUsers } from "@/hooks/use-users";
import {
  solutionCreateSchema,
  type SolutionCreateFormValues,
} from "@/schemas/solution.schema";
import type { SolutionCreatePayload } from "@/types/solution.types";

export interface UseSolutionFormReturn {
  register: UseFormRegister<SolutionCreateFormValues>;
  control: Control<SolutionCreateFormValues>;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  errors: FieldErrors<SolutionCreateFormValues>;
  watch: UseFormWatch<SolutionCreateFormValues>;
  isPending: boolean;
  categories: ReturnType<typeof useCategories>["data"];
  categoriesLoading: boolean;
  users: ReturnType<typeof useUsers>["data"];
  usersLoading: boolean;
  // Tech stack state & helpers
  techStack: string[];
  currentTech: string;
  setCurrentTech: (val: string) => void;
  handleAddTech: (tech: string) => void;
  handleRemoveTech: (tech: string) => void;
  handleKeyDownTech: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  // Category selection helper
  selectedCategoryIds: string[];
  toggleCategory: (categoryId: string) => void;
  // Dynamic field arrays
  capabilities: { id: string }[];
  handleAddCapability: () => void;
  handleRemoveCapability: (index: number) => void;
  serviceUrls: { id: string }[];
  handleAddService: () => void;
  handleRemoveService: (index: number) => void;
  documents: { id: string }[];
  handleAddDocument: () => void;
  handleRemoveDocument: (index: number) => void;
  videos: { id: string }[];
  handleAddVideo: () => void;
  handleRemoveVideo: (index: number) => void;
}

export function useSolutionForm(): UseSolutionFormReturn {
  const navigate = useNavigate();
  const createSolutionMutation = useCreateSolution();

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: users = [], isLoading: usersLoading } = useUsers();

  const [currentTech, setCurrentTech] = useState("");

  const form = useForm<SolutionCreateFormValues>({
    resolver: zodResolver(solutionCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      category_ids: [],
      lead_id: "",
      repository_url: "",
      preview_url: "",
      thumbnail_url: "",
      tech_stack: [],
      key_capabilities: [],
      service_urls: [],
      documents: [],
      videos: [],
    },
  });

  const { control, register, handleSubmit, formState, watch, setValue } = form;

  const techStack = watch("tech_stack") || [];
  const selectedCategoryIds = watch("category_ids") || [];

  // Tech stack helpers
  const handleAddTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setValue("tech_stack", [...techStack, trimmed], { shouldValidate: true });
      setCurrentTech("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setValue(
      "tech_stack",
      techStack.filter((t) => t !== tech),
      { shouldValidate: true },
    );
  };

  const handleKeyDownTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTech(currentTech);
    }
  };

  // Category toggle helper
  const toggleCategory = (categoryId: string) => {
    const updated = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter((id) => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    setValue("category_ids", updated, { shouldValidate: true });
  };

  // Dynamic field arrays
  const capabilitiesFieldArray = useFieldArray({
    control,
    name: "key_capabilities",
  });

  const serviceUrlsFieldArray = useFieldArray({
    control,
    name: "service_urls",
  });

  const documentsFieldArray = useFieldArray({
    control,
    name: "documents",
  });

  const videosFieldArray = useFieldArray({
    control,
    name: "videos",
  });

  const onSubmit = async (values: SolutionCreateFormValues) => {
    const payload: SolutionCreatePayload = {
      title: values.title.trim(),
      description: values.description?.trim() || null,
      category_ids: values.category_ids || [],
      lead_id: values.lead_id ? values.lead_id : null,
      tech_stack: values.tech_stack || [],
      repository_url: values.repository_url?.trim() || null,
      preview_url: values.preview_url?.trim() || null,
      thumbnail_url: values.thumbnail_url?.trim() || null,
      key_capabilities: (values.key_capabilities || [])
        .filter((c) => c.name.trim())
        .map((c) => ({
          name: c.name.trim(),
          description: c.description?.trim() || undefined,
        })),
      service_urls: (values.service_urls || [])
        .filter((s) => s.service_name.trim() && s.target_url.trim())
        .map((s) => ({
          service_name: s.service_name.trim(),
          service_type: s.service_type || "REST API",
          environment: s.environment || "Production",
          target_url: s.target_url.trim(),
        })),
      documents: (values.documents || [])
        .filter((d) => d.name.trim() && d.file_url.trim())
        .map((d) => ({
          name: d.name.trim(),
          format: d.format || "PDF",
          file_url: d.file_url.trim(),
          description: d.description || undefined,
        })),
      videos: (values.videos || []).filter(
        (v) => v.title.trim() && v.video_url.trim(),
      ),
    };

    try {
      const created = await createSolutionMutation.mutateAsync(payload);
      toast.success("Solution created successfully");
      navigate(`/solutions/${created.id}`);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to create solution";
      toast.error(errorMsg);
    }
  };

  return {
    register,
    control,
    handleSubmit: handleSubmit(onSubmit),
    errors: formState.errors,
    watch,
    isPending: createSolutionMutation.isPending,
    categories,
    categoriesLoading,
    users,
    usersLoading,
    techStack,
    currentTech,
    setCurrentTech,
    handleAddTech,
    handleRemoveTech,
    handleKeyDownTech,
    selectedCategoryIds,
    toggleCategory,
    capabilities: capabilitiesFieldArray.fields,
    handleAddCapability: () =>
      capabilitiesFieldArray.append({ name: "", description: "" }),
    handleRemoveCapability: capabilitiesFieldArray.remove,
    serviceUrls: serviceUrlsFieldArray.fields,
    handleAddService: () =>
      serviceUrlsFieldArray.append({
        service_name: "",
        service_type: "REST API",
        environment: "Production",
        target_url: "",
      }),
    handleRemoveService: serviceUrlsFieldArray.remove,
    documents: documentsFieldArray.fields,
    handleAddDocument: () =>
      documentsFieldArray.append({
        name: "",
        format: "PDF",
        file_url: "",
        description: "",
      }),
    handleRemoveDocument: documentsFieldArray.remove,
    videos: videosFieldArray.fields,
    handleAddVideo: () =>
      videosFieldArray.append({
        title: "",
        video_url: "",
        description: "",
      }),
    handleRemoveVideo: videosFieldArray.remove,
  };
}
