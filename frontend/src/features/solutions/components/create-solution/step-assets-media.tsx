import { useState, type ChangeEvent } from "react";
import { Plus, Trash2, Paperclip, Upload } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatFileSize } from "@/utils/formatters";
import { cn } from "cn";

export const ASSET_TYPES = [
  "Architecture Diagram",
  "Database Diagram",
  "Workflow Diagram",
  "Technical Document",
  "Image / Screenshot",
  "Video URL",
  "Other",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

export interface StepAssetsMediaProps {
  isPending: boolean;
  documentsList: Array<{
    id: string;
    name: string;
    format?: string;
    file_url: string;
    description?: string;
    file_size_bytes?: number;
  }>;
  videosList: Array<{
    id: string;
    title: string;
    video_url: string;
    description?: string;
  }>;
  appendDocument: (doc: {
    name: string;
    format: string;
    file_url: string;
    description: string;
    file_size_bytes: number;
  }) => void;
  removeDocument: (index: number) => void;
  appendVideo: (video: {
    title: string;
    video_url: string;
    description: string;
  }) => void;
  removeVideo: (index: number) => void;
}

export function StepAssetsMedia({
  isPending,
  documentsList,
  videosList,
  appendDocument,
  removeDocument,
  appendVideo,
  removeVideo,
}: StepAssetsMediaProps) {
  // Asset inline form state
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

  return (
    <Card key="step-3">
      <CardHeader>
        <CardTitle>Assets & Media</CardTitle>
        <CardDescription>
          Supplementary media, architecture diagrams, and documents.
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
                    <p className="truncate text-sm font-medium">{doc.name}</p>
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
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
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
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {totalAssets === 0 && !isAddingAsset && (
            <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
              No assets added yet. Click &quot;+ Add Asset&quot; to attach
              supplementary media or documents.
            </div>
          )}

          {/* Add Asset Form or Button */}
          {isAddingAsset ? (
            <Card>
              <CardHeader>
                <CardTitle>Asset #{totalAssets + 1}</CardTitle>
                <CardAction>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={resetAssetForm}
                    disabled={isPending}
                    aria-label="Close form"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardAction>
              </CardHeader>

              <CardContent>
                <FieldGroup>
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
                      <div className="relative">
                        <input
                          id="asset-file-input"
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg,.webp,.pdf"
                          onChange={handleFileChange}
                          disabled={isPending}
                          className="sr-only"
                        />
                        <label
                          htmlFor="asset-file-input"
                          className={cn(
                            "flex h-8 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors hover:bg-muted/50 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
                            isPending && "pointer-events-none opacity-50",
                          )}
                        >
                          {selectedFile ? (
                            <div className="flex min-w-0 items-center gap-2">
                              <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                              <span className="truncate font-medium text-foreground">
                                {selectedFile.name}
                              </span>
                              <span className="shrink-0 text-xs text-muted-foreground">
                                · {formatFileSize(selectedFile.size)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Upload className="size-3.5 shrink-0" />
                              <span>Select file (.png, .jpg, .pdf)...</span>
                            </div>
                          )}
                          <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                            {selectedFile ? "Change" : "Browse"}
                          </span>
                        </label>
                      </div>
                    </Field>
                  )}

                  {assetError && (
                    <p className="text-sm text-destructive">{assetError}</p>
                  )}

                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleAddAsset}
                    disabled={isPending}
                  >
                    <Plus />
                    Add Asset
                  </Button>
                </FieldGroup>
              </CardContent>
            </Card>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setIsAddingAsset(true)}
              disabled={isPending}
            >
              <Plus />
              Add Asset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
