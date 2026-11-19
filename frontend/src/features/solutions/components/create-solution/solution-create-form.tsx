import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Field, FieldError } from "@/components/ui/field";
import { useSolutionForm } from "@/features/solutions/hooks/use-solution-form";
import {
  Loader2,
  Plus,
  X,
  ArrowLeft,
  Link2,
  Code2,
  CheckCircle2,
  FileText,
  Video,
  Globe,
} from "lucide-react";

const SUGGESTED_TECH = [
  "React",
  "TypeScript",
  "Python",
  "FastAPI",
  "Docker",
  "PostgreSQL",
  "Redis",
  "Kubernetes",
  "AWS",
  "TailwindCSS",
  "LangChain",
  "PyTorch",
];

export function SolutionCreateForm() {
  const {
    register,
    handleSubmit,
    errors,
    isPending,
    categories = [],
    categoriesLoading,
    users = [],
    usersLoading,
    techStack,
    currentTech,
    setCurrentTech,
    handleAddTech,
    handleRemoveTech,
    handleKeyDownTech,
    selectedCategoryIds,
    toggleCategory,
    capabilities,
    handleAddCapability,
    handleRemoveCapability,
    serviceUrls,
    handleAddService,
    handleRemoveService,
    documents,
    handleAddDocument,
    handleRemoveDocument,
    videos,
    handleAddVideo,
    handleRemoveVideo,
  } = useSolutionForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            render={<Link to="/dashboard" />}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back</span>
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Create Solution
            </h1>
            <p className="text-sm text-muted-foreground">
              Publish a technical solution, architecture blueprint, or reusable
              codebase.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            render={<Link to="/dashboard" />}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Publish Solution
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section 1: Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Core metadata identifying this technical solution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field className="space-y-1.5">
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
                {errors.title && (
                  <FieldError>{errors.title.message}</FieldError>
                )}
              </Field>

              <Field className="space-y-1.5">
                <Label htmlFor="solution-description">
                  Description & Scope
                </Label>
                <Textarea
                  id="solution-description"
                  placeholder="Summarize the business problem, solution architecture, and implementation details..."
                  rows={4}
                  disabled={isPending}
                  aria-invalid={Boolean(errors.description)}
                  {...register("description")}
                />
                {errors.description && (
                  <FieldError>{errors.description.message}</FieldError>
                )}
              </Field>
            </CardContent>
          </Card>

          {/* Section 2: Tech Stack & Key Capabilities */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code2 className="size-4 text-primary" />
                <CardTitle>Technology Stack & Capabilities</CardTitle>
              </div>
              <CardDescription>
                Specify the technologies used and highlight key operational
                features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tech Stack Input */}
              <Field className="space-y-2">
                <Label>Technologies & Frameworks</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentTech}
                    onChange={(e) => setCurrentTech(e.target.value)}
                    onKeyDown={handleKeyDownTech}
                    placeholder="Type framework (e.g. Docker) and press Enter"
                    disabled={isPending}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddTech(currentTech)}
                    disabled={!currentTech.trim() || isPending}
                  >
                    Add
                  </Button>
                </div>

                {/* Selected Tags */}
                {techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="gap-1">
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          disabled={isPending}
                          className="hover:text-destructive focus:outline-none"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Quick Suggestions */}
                <div className="pt-1">
                  <span className="text-sm text-muted-foreground mr-2">
                    Quick suggestions:
                  </span>
                  <div className="inline-flex flex-wrap gap-1 mt-1">
                    {SUGGESTED_TECH.filter((t) => !techStack.includes(t))
                      .slice(0, 8)
                      .map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleAddTech(t)}
                          disabled={isPending}
                          className="rounded-md border bg-muted/20 px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          + {t}
                        </button>
                      ))}
                  </div>
                </div>
              </Field>

              {/* Dynamic Key Capabilities */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">
                      Key Capabilities
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Feature highlights, benchmarks, or core functionalities.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCapability}
                    disabled={isPending}
                    className="gap-1"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Feature</span>
                  </Button>
                </div>

                {capabilities.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No capabilities added yet. Click "+ Add Feature" to
                    highlight key strengths.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {capabilities.map((cap, idx) => (
                      <div
                        key={cap.id}
                        className="flex items-start gap-2 rounded-lg border p-3 bg-muted/10"
                      >
                        <div className="grid flex-1 gap-2 sm:grid-cols-3">
                          <Input
                            placeholder="Capability title (e.g. Realtime Ingestion)"
                            disabled={isPending}
                            {...register(
                              `key_capabilities.${idx}.name` as const,
                            )}
                          />
                          <Input
                            placeholder="Description or metrics..."
                            className="sm:col-span-2"
                            disabled={isPending}
                            {...register(
                              `key_capabilities.${idx}.description` as const,
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveCapability(idx)}
                          disabled={isPending}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Services & Deployments */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                <CardTitle>Deployment & Service Endpoints</CardTitle>
              </div>
              <CardDescription>
                API endpoints, environments, and target URLs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Connect running microservices or deployed instances.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddService}
                  disabled={isPending}
                  className="gap-1"
                >
                  <Plus className="size-3.5" />
                  <span>Add Service</span>
                </Button>
              </div>

              {serviceUrls.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  Optional: No services registered yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {serviceUrls.map((svc, idx) => (
                    <div
                      key={svc.id}
                      className="flex items-center gap-2 rounded-lg border p-2.5 bg-muted/10"
                    >
                      <div className="grid flex-1 gap-2 sm:grid-cols-4">
                        <Input
                          placeholder="Service Name"
                          disabled={isPending}
                          {...register(
                            `service_urls.${idx}.service_name` as const,
                          )}
                        />
                        <Input
                          placeholder="Environment (e.g. Prod)"
                          disabled={isPending}
                          {...register(
                            `service_urls.${idx}.environment` as const,
                          )}
                        />
                        <Input
                          placeholder="Type (e.g. REST API)"
                          disabled={isPending}
                          {...register(
                            `service_urls.${idx}.service_type` as const,
                          )}
                        />
                        <Input
                          placeholder="https://api.example.com"
                          disabled={isPending}
                          {...register(
                            `service_urls.${idx}.target_url` as const,
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveService(idx)}
                        disabled={isPending}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1 col) */}
        <div className="space-y-6">
          {/* Categories Pill Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Domain Categories</CardTitle>
              <CardDescription>
                Select one or more categories for this solution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-7 w-20 rounded-md bg-muted/60 animate-pulse"
                    />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No categories found. Create a category first.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium border transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground shadow-xs"
                            : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="size-3" />}
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Lead Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Technical Lead</CardTitle>
              <CardDescription>
                Assign a developer or architect as the solution
                point-of-contact.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
              ) : (
                <select
                  disabled={isPending}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  {...register("lead_id")}
                >
                  <option value="" className="bg-background text-foreground">
                    -- Select Lead (Optional) --
                  </option>
                  {users
                    .filter((u) => !u.is_deleted)
                    .map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                        className="bg-background text-foreground"
                      >
                        {user.username} ({user.email})
                      </option>
                    ))}
                </select>
              )}
            </CardContent>
          </Card>

          {/* Repository & Demo Links */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Link2 className="size-4 text-primary" />
                <CardTitle>Repository & Demos</CardTitle>
              </div>
              <CardDescription>
                Links to source control, live instances, and banners.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <Field className="space-y-1">
                <Label htmlFor="repo-url">Repository URL</Label>
                <Input
                  id="repo-url"
                  placeholder="https://github.com/thoughtminds/..."
                  disabled={isPending}
                  aria-invalid={Boolean(errors.repository_url)}
                  {...register("repository_url")}
                />
                {errors.repository_url && (
                  <FieldError>{errors.repository_url.message}</FieldError>
                )}
              </Field>

              <Field className="space-y-1">
                <Label htmlFor="preview-url">
                  Live Preview / Documentation
                </Label>
                <Input
                  id="preview-url"
                  placeholder="https://demo.thoughtminds.ai"
                  disabled={isPending}
                  aria-invalid={Boolean(errors.preview_url)}
                  {...register("preview_url")}
                />
                {errors.preview_url && (
                  <FieldError>{errors.preview_url.message}</FieldError>
                )}
              </Field>

              <Field className="space-y-1">
                <Label htmlFor="thumbnail-url">
                  Thumbnail / Banner Image URL
                </Label>
                <Input
                  id="thumbnail-url"
                  placeholder="https://images.unsplash.com/..."
                  disabled={isPending}
                  aria-invalid={Boolean(errors.thumbnail_url)}
                  {...register("thumbnail_url")}
                />
                {errors.thumbnail_url && (
                  <FieldError>{errors.thumbnail_url.message}</FieldError>
                )}
              </Field>
            </CardContent>
          </Card>

          {/* Documentation & Video Resources */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Supplementary Assets</CardTitle>
              <CardDescription>
                Attach architecture docs or video walkthroughs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Documents */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <FileText className="size-3.5 text-muted-foreground" />
                    <span>Documents ({documents.length})</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddDocument}
                    disabled={isPending}
                  >
                    + Add
                  </Button>
                </div>

                {documents.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="space-y-1.5 rounded-md border p-2 bg-muted/10 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <Input
                        placeholder="Document Name"
                        disabled={isPending}
                        {...register(`documents.${idx}.name` as const)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveDocument(idx)}
                        disabled={isPending}
                        className="ml-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                    <Input
                      placeholder="File URL (e.g. S3, Drive)"
                      disabled={isPending}
                      {...register(`documents.${idx}.file_url` as const)}
                    />
                  </div>
                ))}
              </div>

              {/* Videos */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Video className="size-3.5 text-muted-foreground" />
                    <span>Videos ({videos.length})</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddVideo}
                    disabled={isPending}
                  >
                    + Add
                  </Button>
                </div>

                {videos.map((vid, idx) => (
                  <div
                    key={vid.id}
                    className="space-y-1.5 rounded-md border p-2 bg-muted/10 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <Input
                        placeholder="Video Title"
                        disabled={isPending}
                        {...register(`videos.${idx}.title` as const)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveVideo(idx)}
                        disabled={isPending}
                        className="ml-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Video URL (YouTube/Vimeo)"
                      disabled={isPending}
                      {...register(`videos.${idx}.video_url` as const)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
