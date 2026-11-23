import type { ReactNode } from "react";
import type { SolutionAsset } from "@/types/solution-asset.types";
import {
  Attachment,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { formatFileSize } from "@/utils/formatters";
import { formatDuration } from "@/utils/asset-utils";
import { FileCode, FileText, Video, Image } from "lucide-react";

interface SolutionAssetItemProps {
  asset: SolutionAsset;
  orientation?: "horizontal" | "vertical";
  onPreview?: (asset: SolutionAsset) => void;
  renderActions?: (asset: SolutionAsset) => ReactNode;
}

export function SolutionAssetItem({
  asset,
  orientation = "horizontal",
  onPreview,
  renderActions,
}: SolutionAssetItemProps) {
  const isImage = asset.type === "image";
  const isVideo = asset.type === "video";

  const FileIcon = isVideo
    ? Video
    : isImage
      ? Image
      : asset.type === "document"
        ? FileText
        : FileCode;

  const descriptionParts: string[] = [];
  if (asset.format) descriptionParts.push(asset.format);
  if (asset.file_size_bytes) {
    descriptionParts.push(formatFileSize(asset.file_size_bytes));
  }
  if (asset.duration_seconds) {
    descriptionParts.push(formatDuration(asset.duration_seconds));
  }
  const descriptionText =
    descriptionParts.length > 0 ? descriptionParts.join(" · ") : asset.type;

  return (
    <Attachment
      orientation={orientation}
      className="min-w-0 cursor-pointer transition-colors hover:bg-muted/50"
      onClick={() => onPreview?.(asset)}
    >
      {onPreview && (
        <AttachmentTrigger
          aria-label={`Preview ${asset.name}`}
          onClick={() => onPreview(asset)}
        />
      )}

      <AttachmentMedia variant={isImage ? "image" : undefined}>
        {isImage ? (
          <img
            src={asset.file_url}
            alt={asset.name}
            className="size-full object-cover"
          />
        ) : (
          <FileIcon />
        )}
      </AttachmentMedia>

      <AttachmentContent className="min-w-0">
        <AttachmentTitle className="truncate">{asset.name}</AttachmentTitle>

        <AttachmentDescription>{descriptionText}</AttachmentDescription>
      </AttachmentContent>

      {renderActions && (
        <AttachmentActions>{renderActions(asset)}</AttachmentActions>
      )}
    </Attachment>
  );
}
