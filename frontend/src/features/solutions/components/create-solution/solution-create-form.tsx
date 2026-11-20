import React, { useState, useMemo, type ChangeEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Controller, useFieldArray } from "react-hook-form";
import { useSolutionForm } from "@/features/solutions/hooks/use-solution-form";
import type { UseSolutionFormReturn } from "@/features/solutions/hooks/use-solution-form";
import type { SolutionCreateFormValues } from "@/schemas/solution.schema";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FORM_STEPS } from "@/features/solutions/constants/form-steps";
import { SUGGESTED_TECH } from "@/features/solutions/constants/suggested-tech";
import { formatFileSize } from "@/utils/formatters";
import { SolutionFormHeader } from "./solution-form-header";

const ASSET_TYPES = [
  "Architecture Diagram",
  "Database Diagram",
  "Workflow Diagram",
  "Technical Document",
  "Image / Screenshot",
  "Video URL",
  "Other",
] as const;

type AssetType = (typeof ASSET_TYPES)[number];

const DEFAULT_SERVICE_TYPES = [
  "REST API",
  "GraphQL",
  "WebSocket",
  "gRPC",
  "Webhook",
  "Microservice",
];

const STEP_VALIDATION_FIELDS: Record<
  number,
  (keyof SolutionCreateFormValues)[]
> = {
  0: ["title", "description", "category_ids"],
  1: ["tech_stack", "key_capabilities"],
  2: ["service_urls", "repository_url", "preview_url", "thumbnail_url"],
  3: ["documents", "videos"],
};

/**
 * Deeply extracts and deduplicates error messages from react-hook-form errors,
 * including root messages, nested object messages, and array item messages.
 * Only extracts human-readable messages from `.message`, ignoring internal
 * validation codes (such as `type: "too_small"`).
 */
function extractErrorMessages(error: unknown): string[] {
  if (!error) return [];
  const messages: string[] = [];

  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;

    const obj = node as Record<string, any>;

    // In React Hook Form / Zod, user-facing error messages are stored in `.message`
    if (typeof obj.message === "string" && obj.message.trim()) {
      const msg = obj.message.trim();
      if (!messages.includes(msg)) {
        messages.push(msg);
      }
    }

    // Root errors on array fields (e.g. errors.key_capabilities.root)
    if (obj.root && typeof obj.root === "object") {
      walk(obj.root);
    }

    // If it's an array of errors (e.g. errors.key_capabilities items), walk each item
    if (Array.isArray(obj)) {
      for (const item of obj) {
        walk(item);
      }
      return;
    }

    // Walk child field error objects, excluding internal RHF metadata (type, types, ref, root)
    for (const [key, val] of Object.entries(obj)) {
      if (
        key !== "ref" &&
        key !== "type" &&
        key !== "types" &&
        key !== "root" &&
        val &&
        typeof val === "object"
      ) {
        walk(val);
      }
    }
  };

  walk(error);
  return messages;
}

export type SolutionCreateFormViewProps = UseSolutionFormReturn & {
  initialStep?: number;
};

/**
 * Multi-step presentation view for the Solution creation form.
 * Uses a single unified Card per step following raw shadcn conventions.
 */
export function SolutionCreateFormView({
  register,
  control,
  handleSubmit,
  errors,
  watch,
  trigger,
  getValues,
  isPending,
  categories,
  categoriesLoading,
  users,
  usersLoading,
  techStack,
  handleAddTech,
  handleRemoveTech,
  selectedCategoryIds,
  toggleCategory,
  initialStep = 0,
}: SolutionCreateFormViewProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Dynamic field arrays
  const {
    fields: capabilitiesList,
    append: appendCapability,
    remove: removeCapability,
  } = useFieldArray({
    control,
    name: "key_capabilities",
  });

  const {
    fields: servicesList,
    append: appendService,
    remove: removeService,
  } = useFieldArray({
    control,
    name: "service_urls",
  });

  const {
    fields: documentsList,
    append: appendDocument,
    remove: removeDocument,
  } = useFieldArray({
    control,
    name: "documents",
  });

  const {
    fields: videosList,
    append: appendVideo,
    remove: removeVideo,
  } = useFieldArray({
    control,
    name: "videos",
  });

  // Technologies & Service types catalogs with inline create support
  const [availableTech, setAvailableTech] = useState<string[]>([
    ...SUGGESTED_TECH,
  ]);
  const [availableServiceTypes, setAvailableServiceTypes] = useState<string[]>(
    DEFAULT_SERVICE_TYPES,
  );

  // Asset inline form state (Step 3)
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("Architecture Diagram");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetVideoUrl, setAssetVideoUrl] = useState("");
  const [assetError, setAssetError] = useState("");

  const totalAssets = documentsList.length + videosList.length;

  const resetAssetForm = () => {
    setIsAddingAsset(false);
    setAssetName("");
    setAssetType("Architecture Diagram");
    setSelectedFile(null);
    setAssetVideoUrl("");
    setAssetError("");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setAssetError("File size must be less than 10 MB.");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    setAssetError("");
    setSelectedFile(file);

    if (!assetName.trim()) {
      setAssetName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleAddAsset = () => {
    if (assetType === "Video URL") {
      if (
        !assetVideoUrl.trim() ||
        !/^https?:\/\/.+/.test(assetVideoUrl.trim())
      ) {
        setAssetError("Please enter a valid URL.");
        return;
      }

      appendVideo({
        title: assetName.trim() || "Video Demonstration",
        video_url: assetVideoUrl.trim(),
        description: "Video Demonstration",
      });

      resetAssetForm();
      return;
    }

    if (!selectedFile) {
      setAssetError("Please select a file.");
      return;
    }

    const format =
      selectedFile.name.split(".").pop()?.toUpperCase() || "DOCUMENT";

    appendDocument({
      name: assetName.trim() || selectedFile.name.replace(/\.[^/.]+$/, ""),
      format,
      file_url: URL.createObjectURL(selectedFile),
      description: assetType,
      file_size_bytes: selectedFile.size,
    });

    resetAssetForm();
  };

  // Technologies & Frameworks sync with MultiSelectCombobox
  const watchedTech = useMemo(() => {
    return (watch ? watch("tech_stack") : techStack) || [];
  }, [watch, techStack]);

  const handleTechChange = (newTechList: string[]) => {
    for (const t of newTechList) {
      if (!watchedTech.includes(t)) {
        handleAddTech(t);
      }
    }
    for (const t of watchedTech) {
      if (!newTechList.includes(t)) {
        handleRemoveTech(t);
      }
    }
  };

  const handleCreateTech = (newTech: string) => {
    if (!availableTech.includes(newTech)) {
      setAvailableTech((prev) => [...prev, newTech]);
    }
  };

  // Sync service types with MultiSelectCombobox
  const watchedServices = useMemo(() => {
    return (watch ? watch("service_urls") : []) || [];
  }, [watch]);

  const selectedServiceTypes = useMemo(() => {
    return (watchedServices || [])
      .map((s) => s?.service_type || s?.service_name)
      .filter((s): s is string => Boolean(s));
  }, [watchedServices]);

  const handleServiceTypesChange = (newTypes: string[]) => {
    for (const type of newTypes) {
      if (!selectedServiceTypes.includes(type)) {
        appendService({
          service_name: type,
          service_type: type,
          environment: "Production",
          target_url: "",
        });
      }
    }
    for (let i = watchedServices.length - 1; i >= 0; i--) {
      const sType =
        watchedServices[i]?.service_type || watchedServices[i]?.service_name;
      if (sType && !newTypes.includes(sType)) {
        removeService(i);
      }
    }
  };

  const handleCreateServiceType = (newType: string) => {
    if (!availableServiceTypes.includes(newType)) {
      setAvailableServiceTypes((prev) => [...prev, newType]);
    }
  };

  const leadAnchor = useComboboxAnchor();

  const categoryNames = useMemo(
    () => (categories || []).map((c) => c.name),
    [categories],
  );

  const selectedCategoryNames = useMemo(
    () =>
      (categories || [])
        .filter((c) => selectedCategoryIds.includes(c.id))
        .map((c) => c.name),
    [categories, selectedCategoryIds],
  );

  const handleCategoryValueChange = (newNames: string[]) => {
    const currentNameSet = new Set(selectedCategoryNames);
    const newNameSet = new Set(newNames);

    for (const name of newNames) {
      if (!currentNameSet.has(name)) {
        const cat = (categories || []).find((c) => c.name === name);
        if (cat) toggleCategory(cat.id);
      }
    }

    for (const name of selectedCategoryNames) {
      if (!newNameSet.has(name)) {
        const cat = (categories || []).find((c) => c.name === name);
        if (cat) toggleCategory(cat.id);
      }
    }
  };

  const activeUsers = useMemo(
    () => (users || []).filter((u) => !u.is_deleted),
    [users],
  );

  const userNames = useMemo(
    () => activeUsers.map((u) => u.username),
    [activeUsers],
  );

  const totalSteps = FORM_STEPS.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Active step fields and validation error calculation for Alert
  const currentFieldErrors = useMemo(() => {
    const fields = STEP_VALIDATION_FIELDS[currentStep] ?? [];
    const list: string[] = [];

    for (const field of fields) {
      const err = (errors as Record<string, any>)[field];
      if (err) {
        const fieldMessages = extractErrorMessages(err);
        for (const msg of fieldMessages) {
          if (!list.includes(msg)) {
            list.push(msg);
          }
        }
      }
    }

    return list;
  }, [currentStep, errors]);

  // Validate the current step fields before advancing
  const validateCurrentStep = async (): Promise<boolean> => {
    if (!trigger) return true;
    const fields = STEP_VALIDATION_FIELDS[currentStep];
    if (!fields || fields.length === 0) return true;

    return await trigger(fields);
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      if (
        typeof window !== "undefined" &&
        typeof window.scrollTo === "function"
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      if (
        typeof window !== "undefined" &&
        typeof window.scrollTo === "function"
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleStepClick = async (targetStepIndex: number) => {
    if (targetStepIndex < currentStep) {
      setCurrentStep(targetStepIndex);
      if (
        typeof window !== "undefined" &&
        typeof window.scrollTo === "function"
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    const isValid = await validateCurrentStep();
    if (isValid) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep(targetStepIndex);
      if (
        typeof window !== "undefined" &&
        typeof window.scrollTo === "function"
      ) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const currentValues: SolutionCreateFormValues = getValues
    ? getValues()
    : {
        title: watch ? watch("title") : "",
        description: watch ? watch("description") : "",
        category_ids: selectedCategoryIds,
        lead_id: watch ? watch("lead_id") : "",
        tech_stack: techStack,
        repository_url: watch ? watch("repository_url") : "",
        preview_url: watch ? watch("preview_url") : "",
        thumbnail_url: watch ? watch("thumbnail_url") : "",
        key_capabilities: watch ? watch("key_capabilities") : [],
        service_urls: watch ? watch("service_urls") : [],
        documents: watch ? watch("documents") : [],
        videos: watch ? watch("videos") : [],
      };

  const selectedCategories = useMemo(
    () =>
      (categories || []).filter((c) =>
        (currentValues.category_ids || []).includes(c.id),
      ),
    [categories, currentValues.category_ids],
  );

  const selectedLead = useMemo(
    () => (users || []).find((u) => u.id === currentValues.lead_id),
    [users, currentValues.lead_id],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header */}
      <SolutionFormHeader isPending={isPending} />

      {/* Stepper Navigation */}
      <Stepper
        steps={FORM_STEPS}
        activeStep={currentStep}
        onStepClick={handleStepClick}
        isStepCompleted={(index) => completedSteps.has(index)}
      />

      {/* Field Validation Alert */}
      {currentFieldErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Please resolve the following errors</AlertTitle>
          <AlertDescription>
            {currentFieldErrors.length === 1 ? (
              <p>{currentFieldErrors[0]}</p>
            ) : (
              <ul className="list-disc list-inside space-y-1 mt-1 text-xs">
                {currentFieldErrors.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* STEP 0: General Information */}
      {currentStep === 0 && (
        <Card key="step-0">
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Basic metadata, domain categories, and technical ownership.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Field>
              <Label htmlFor="solution-title">
                Solution Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="solution-title"
                placeholder="e.g. Enterprise RAG Knowledge Search Platform"
                aria-invalid={Boolean(errors.title)}
                disabled={isPending}
                {...register("title")}
              />
            </Field>

            <Field>
              <Label htmlFor="solution-description">
                Description & Scope <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="solution-description"
                placeholder="Summarize the business problem, solution architecture, and implementation details..."
                rows={4}
                disabled={isPending}
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
            </Field>

            <FieldGroup className="grid sm:grid-cols-2">
              <Field>
                <Label>
                  Domain Categories <span className="text-destructive">*</span>
                </Label>
                {categoriesLoading ? (
                  <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
                ) : (
                  <MultiSelectCombobox
                    options={categoryNames}
                    value={selectedCategoryNames}
                    onChange={handleCategoryValueChange}
                    placeholder="Select categories..."
                    aria-label="Domain categories"
                    aria-invalid={Boolean(errors.category_ids)}
                    disabled={isPending}
                  />
                )}
              </Field>

              <Field>
                <Label>Technical Lead</Label>
                {usersLoading ? (
                  <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
                ) : (
                  <Controller
                    name="lead_id"
                    control={control}
                    render={({ field }) => {
                      const selectedUser = activeUsers.find(
                        (user) => user.id === field.value,
                      );
                      const selectedLeadNames = selectedUser
                        ? [selectedUser.username]
                        : [];

                      const handleLeadValueChange = (newNames: string[]) => {
                        if (newNames.length === 0) {
                          field.onChange("");
                        } else {
                          const latestName = newNames[newNames.length - 1];
                          const matched = activeUsers.find(
                            (u) => u.username === latestName,
                          );
                          field.onChange(matched ? matched.id : "");
                        }
                      };

                      return (
                        <Combobox
                          multiple
                          autoHighlight
                          items={userNames}
                          value={selectedLeadNames}
                          onValueChange={handleLeadValueChange}
                          disabled={isPending}
                        >
                          <ComboboxChips ref={leadAnchor} className="w-full">
                            <ComboboxValue>
                              {(values) => (
                                <React.Fragment>
                                  {values.map((value: string) => (
                                    <ComboboxChip key={value}>
                                      {value}
                                    </ComboboxChip>
                                  ))}
                                  <ComboboxChipsInput
                                    placeholder={
                                      values.length > 0
                                        ? ""
                                        : "Select technical lead..."
                                    }
                                  />
                                </React.Fragment>
                              )}
                            </ComboboxValue>
                          </ComboboxChips>
                          <ComboboxContent anchor={leadAnchor}>
                            <ComboboxEmpty>
                              No team members found.
                            </ComboboxEmpty>
                            <ComboboxList>
                              {(item) => (
                                <ComboboxItem key={item} value={item}>
                                  {item}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      );
                    }}
                  />
                )}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      )}

      {/* STEP 1: Tech & Capabilities */}
      {currentStep === 1 && (
        <Card key="step-1">
          <CardHeader>
            <CardTitle>Tech & Capabilities</CardTitle>
            <CardDescription>
              Core technologies used and key features of this solution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Technologies & Frameworks */}
            <Field>
              <Label>
                Technologies & Frameworks{" "}
                <span className="text-destructive">*</span>
              </Label>
              <MultiSelectCombobox
                options={availableTech}
                value={watchedTech}
                onChange={handleTechChange}
                onCreate={handleCreateTech}
                placeholder="Select or add technologies..."
                aria-label="Technologies and Frameworks"
                aria-invalid={Boolean(errors.tech_stack)}
                disabled={isPending}
              />
            </Field>

            {/* Key Capabilities */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>
                    Key Capabilities <span className="text-destructive">*</span>
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendCapability({ name: "", description: "" })
                  }
                  disabled={isPending}
                  className="gap-1 text-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Add Feature</span>
                </Button>
              </div>

              {capabilitiesList.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                  No capabilities added yet. Click &quot;+ Add Feature&quot; to
                  highlight key strengths.
                </div>
              ) : (
                <div className="space-y-3">
                  {capabilitiesList.map((cap, idx) => (
                    <Card key={cap.id}>
                      <CardHeader>
                        <CardTitle>Capability #{idx + 1}</CardTitle>
                        <CardAction>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeCapability(idx)}
                            disabled={isPending}
                            aria-label={`Remove Capability ${idx + 1}`}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="size-3.5" />
                          </Button>
                        </CardAction>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Field>
                          <Label htmlFor={`cap-title-${idx}`}>
                            Capability Title{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id={`cap-title-${idx}`}
                            placeholder="e.g. Real-time Ingestion & Analytics"
                            disabled={isPending}
                            aria-label={`Capability ${idx + 1} Title`}
                            aria-invalid={Boolean(
                              errors.key_capabilities?.[idx]?.name,
                            )}
                            {...register(
                              `key_capabilities.${idx}.name` as const,
                            )}
                          />
                        </Field>
                        <Field>
                          <Label htmlFor={`cap-desc-${idx}`}>
                            Capability Description{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            id={`cap-desc-${idx}`}
                            placeholder="Describe functional strengths, performance benchmarks, or technical highlights..."
                            rows={2}
                            disabled={isPending}
                            aria-label={`Capability ${idx + 1} Description`}
                            aria-invalid={Boolean(
                              errors.key_capabilities?.[idx]?.description,
                            )}
                            {...register(
                              `key_capabilities.${idx}.description` as const,
                            )}
                          />
                        </Field>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Deployments & Links */}
      {currentStep === 2 && (
        <Card key="step-2">
          <CardHeader>
            <CardTitle>Deployments & Links</CardTitle>
            <CardDescription>
              External links, live demos, and service endpoints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Links Section */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Project Links</Label>
                <p className="text-xs text-muted-foreground">
                  Source code repository, documentation, and preview banner.
                </p>
              </div>

              <FieldGroup className="grid sm:grid-cols-2">
                <Field>
                  <Label htmlFor="repo-url">Repository URL</Label>
                  <Input
                    id="repo-url"
                    type="url"
                    placeholder="https://github.com/organization/repository"
                    disabled={isPending}
                    aria-invalid={Boolean(errors.repository_url)}
                    {...register("repository_url")}
                  />
                </Field>

                <Field>
                  <Label htmlFor="preview-url">
                    Live Preview / Documentation URL
                  </Label>
                  <Input
                    id="preview-url"
                    type="url"
                    placeholder="https://demo.example.com"
                    disabled={isPending}
                    aria-invalid={Boolean(errors.preview_url)}
                    {...register("preview_url")}
                  />
                </Field>
              </FieldGroup>

              <Field>
                <Label htmlFor="thumbnail-url">
                  Thumbnail / Banner Image URL
                </Label>
                <Input
                  id="thumbnail-url"
                  type="url"
                  placeholder="https://images.example.com/banner.png"
                  disabled={isPending}
                  aria-invalid={Boolean(errors.thumbnail_url)}
                  {...register("thumbnail_url")}
                />
              </Field>
            </div>

            {/* Service Endpoints Section */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Service Endpoints</Label>
                <p className="text-xs text-muted-foreground">
                  Register the environments and URLs where your services are
                  deployed.
                </p>
              </div>

              <MultiSelectCombobox
                options={availableServiceTypes}
                value={selectedServiceTypes}
                onChange={handleServiceTypesChange}
                onCreate={handleCreateServiceType}
                placeholder="Select service types..."
                aria-label="Service types"
                disabled={isPending}
              />

              {/* Selected service configuration */}
              {servicesList.length > 0 && (
                <div className="space-y-3 pt-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Selected service configuration
                  </Label>
                  {servicesList.map((svc, idx) => {
                    const currentType =
                      watch(`service_urls.${idx}.service_type`) ||
                      watchedServices[idx]?.service_type ||
                      "Service";
                    return (
                      <div
                        key={svc.id}
                        className="rounded-lg border p-3.5 space-y-3 bg-muted/5"
                      >
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className="font-semibold text-xs"
                          >
                            {currentType}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => removeService(idx)}
                            disabled={isPending}
                            aria-label={`Remove Service ${idx + 1}`}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field>
                            <Label htmlFor={`svc-env-${idx}`}>
                              Environment
                            </Label>
                            <Input
                              id={`svc-env-${idx}`}
                              placeholder="Production"
                              disabled={isPending}
                              aria-label={`Service ${idx + 1} Environment`}
                              aria-invalid={Boolean(
                                errors.service_urls?.[idx]?.environment,
                              )}
                              {...register(
                                `service_urls.${idx}.environment` as const,
                              )}
                            />
                          </Field>

                          <Field>
                            <Label htmlFor={`svc-url-${idx}`}>Target URL</Label>
                            <Input
                              id={`svc-url-${idx}`}
                              type="url"
                              placeholder="https://api.example.com"
                              disabled={isPending}
                              aria-label={`Service ${idx + 1} Target URL`}
                              aria-invalid={Boolean(
                                errors.service_urls?.[idx]?.target_url,
                              )}
                              {...register(
                                `service_urls.${idx}.target_url` as const,
                              )}
                            />
                          </Field>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Assets & Review */}
      {currentStep === 3 && (
        <Card key="step-3">
          <CardHeader>
            <CardTitle>Assets & Review</CardTitle>
            <CardDescription>
              Supplementary media and final review before publishing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Supplementary Assets */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Supplementary Assets</Label>
                {totalAssets > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {totalAssets} asset{totalAssets !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Asset List */}
              {totalAssets > 0 && (
                <div className="divide-y">
                  {documentsList.map((doc, index) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {doc.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {doc.format}
                          {doc.file_size_bytes
                            ? ` · ${formatFileSize(doc.file_size_bytes)}`
                            : ""}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDocument(index)}
                        disabled={isPending}
                        aria-label={`Remove ${doc.name}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}

                  {videosList.map((video, index) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {video.title}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {video.video_url}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVideo(index)}
                        disabled={isPending}
                        aria-label={`Remove ${video.title}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {totalAssets === 0 && !isAddingAsset && (
                <p className="text-sm text-muted-foreground">
                  No assets added.
                </p>
              )}

              {/* Add Asset Form or Button */}
              {isAddingAsset ? (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Add New Asset</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={resetAssetForm}
                      disabled={isPending}
                      aria-label="Close form"
                    >
                      <X />
                    </Button>
                  </div>

                  <Field>
                    <Label htmlFor="asset-name">Asset Name</Label>
                    <Input
                      id="asset-name"
                      placeholder="Enter asset name"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      disabled={isPending}
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="asset-type">Type</Label>
                    <Select
                      value={assetType}
                      onValueChange={(val) => setAssetType(val as AssetType)}
                      disabled={isPending}
                    >
                      <SelectTrigger id="asset-type" className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  {assetType === "Video URL" ? (
                    <Field>
                      <Label htmlFor="asset-video-url">Video URL</Label>
                      <Input
                        id="asset-video-url"
                        type="url"
                        placeholder="https://..."
                        value={assetVideoUrl}
                        onChange={(e) => setAssetVideoUrl(e.target.value)}
                        disabled={isPending}
                      />
                    </Field>
                  ) : (
                    <Field>
                      <Label htmlFor="asset-file-input">Choose a file</Label>
                      <Input
                        id="asset-file-input"
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg,.webp,.pdf"
                        onChange={handleFileChange}
                        disabled={isPending}
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">
                          {selectedFile.name} ·{" "}
                          {formatFileSize(selectedFile.size)}
                        </p>
                      )}
                    </Field>
                  )}

                  {assetError && (
                    <p className="text-sm text-destructive">{assetError}</p>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetAssetForm}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddAsset}
                      disabled={isPending}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsAddingAsset(true)}
                  disabled={isPending}
                >
                  <Plus />
                  Add asset
                </Button>
              )}
            </div>

            {/* Review Details */}
            <div className="space-y-4 pt-2">
              <Label>Review Details</Label>

              <div className="space-y-4">
                {/* Step 0 Review: General Information */}
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      1. General Information
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => handleStepClick(0)}
                    >
                      Edit
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Title</p>
                      <p className="font-medium text-foreground">
                        {currentValues.title || (
                          <span className="text-muted-foreground italic">
                            Untitled
                          </span>
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Technical Lead
                      </p>
                      <p className="font-medium text-foreground">
                        {selectedLead ? (
                          selectedLead.username
                        ) : (
                          <span className="text-muted-foreground italic">
                            Unassigned
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">
                        Description
                      </p>
                      <p className="text-foreground whitespace-pre-wrap">
                        {currentValues.description?.trim() || (
                          <span className="text-muted-foreground italic">
                            No description
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground mb-1">
                        Categories
                      </p>
                      {selectedCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCategories.map((c) => (
                            <Badge key={c.id} variant="secondary">
                              {c.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          None selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 1 Review: Tech & Capabilities */}
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      2. Tech & Capabilities
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => handleStepClick(1)}
                    >
                      Edit
                    </Button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Tech Stack
                      </p>
                      {techStack.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {techStack.map((tech) => (
                            <Badge key={tech} variant="outline">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No technologies added
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Key Capabilities ({capabilitiesList.length})
                      </p>
                      {capabilitiesList.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-xs text-foreground">
                          {capabilitiesList.map((cap, idx) => (
                            <li key={idx}>
                              <span className="font-medium">
                                {watch(`key_capabilities.${idx}.name`) ||
                                  cap.name ||
                                  `Capability ${idx + 1}`}
                              </span>
                              {watch(`key_capabilities.${idx}.description`) &&
                                ` — ${watch(
                                  `key_capabilities.${idx}.description`,
                                )}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No capabilities added
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2 Review: Deployments & Links */}
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      3. Deployments & Links
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => handleStepClick(2)}
                    >
                      Edit
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Services ({servicesList.length})
                      </p>
                      {servicesList.length > 0 ? (
                        <div className="divide-y rounded border text-xs">
                          {servicesList.map((svc, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2"
                            >
                              <span className="font-medium">
                                {watch(`service_urls.${i}.service_name`) ||
                                  svc.service_name ||
                                  `Service ${i + 1}`}
                              </span>
                              <span className="text-muted-foreground text-[11px] font-mono truncate max-w-50">
                                {watch(`service_urls.${i}.target_url`) ||
                                  svc.target_url}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No services configured
                        </span>
                      )}
                    </div>

                    <div className="grid gap-2 pt-1 sm:grid-cols-2 text-xs">
                      {currentValues.repository_url && (
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-muted-foreground">Repo:</span>
                          <a
                            href={currentValues.repository_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 truncate"
                          >
                            {currentValues.repository_url}
                            <ExternalLink className="size-3 shrink-0" />
                          </a>
                        </div>
                      )}
                      {currentValues.preview_url && (
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-muted-foreground">Demo:</span>
                          <a
                            href={currentValues.preview_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 truncate"
                          >
                            {currentValues.preview_url}
                            <ExternalLink className="size-3 shrink-0" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 3 Review: Assets summary */}
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      4. Assets & Media
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => handleStepClick(3)}
                    >
                      Edit
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {documentsList.length} document
                    {documentsList.length !== 1 ? "s" : ""}, {videosList.length}{" "}
                    video
                    {videosList.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={isFirstStep || isPending}
        >
          <ArrowLeft className="size-4" />
          Previous
        </Button>

        {!isLastStep ? (
          <Button type="button" onClick={handleNext} disabled={isPending}>
            Continue
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Publish Solution
          </Button>
        )}
      </div>
    </form>
  );
}

/**
 * Connected Container component that binds `useSolutionForm` hook
 * to `SolutionCreateFormView`.
 */
export function SolutionCreateForm() {
  const formState = useSolutionForm();
  return <SolutionCreateFormView {...formState} />;
}
