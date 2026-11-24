import type { SolutionAsset } from "@/types/solution-asset.types";
import type { PreviewType, ViewerControls } from "./types/viewer.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDuration } from "@/utils/asset-utils";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize,
  Table as TableIcon,
} from "lucide-react";

export interface ViewerBottomToolbarProps {
  asset: SolutionAsset | null;
  previewType: PreviewType;
  controls: ViewerControls | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function ViewerBottomToolbar({
  asset,
  previewType,
  controls,
  isFullscreen,
  onToggleFullscreen,
}: ViewerBottomToolbarProps) {
  if (!asset) return null;

  const hasControls = Boolean(
    controls?.zoom ||
    controls?.rotation ||
    controls?.pagination ||
    controls?.playback ||
    controls?.spreadsheet,
  );

  return (
    <nav
      aria-label="Media Preview Controls"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 bg-background/80 text-foreground backdrop-blur-md shadow-sm transition-opacity duration-200"
    >
      {/* 1. IMAGE CONTROLS */}
      {previewType === "image" && controls?.zoom && (
        <>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={controls.zoom.zoomOut}
                  aria-label="Zoom out"
                >
                  <ZoomOut />
                </Button>
              }
            />
            <TooltipContent side="top">Zoom out (-)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={controls.zoom.reset}
                  className="w-12 px-0 text-xs font-mono tabular-nums text-foreground"
                  aria-label="Reset zoom"
                >
                  {Math.round(controls.zoom.scale * 100)}%
                </Button>
              }
            />
            <TooltipContent side="top">Reset zoom (0)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={controls.zoom.zoomIn}
                  aria-label="Zoom in"
                >
                  <ZoomIn />
                </Button>
              }
            />
            <TooltipContent side="top">Zoom in (+)</TooltipContent>
          </Tooltip>

          {controls.zoom.fit && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={controls.zoom.fit}
                    aria-label="Fit to screen"
                  >
                    <Maximize2 />
                  </Button>
                }
              />
              <TooltipContent side="top">Fit to screen</TooltipContent>
            </Tooltip>
          )}

          {controls.rotation && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={controls.rotation.rotate}
                    aria-label="Rotate 90 degrees"
                  >
                    <RotateCw />
                  </Button>
                }
              />
              <TooltipContent side="top">Rotate 90°</TooltipContent>
            </Tooltip>
          )}
        </>
      )}

      {/* 2. PDF CONTROLS */}
      {previewType === "pdf" && controls?.pagination && (
        <>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={controls.pagination.currentPage <= 1}
                  onClick={controls.pagination.prevPage}
                  aria-label="Previous page"
                >
                  <ChevronLeft />
                </Button>
              }
            />
            <TooltipContent side="top">Previous page</TooltipContent>
          </Tooltip>

          <div className="w-16 flex items-center justify-center text-xs font-mono tabular-nums font-medium text-muted-foreground whitespace-nowrap shrink-0">
            <span className="text-foreground">
              {controls.pagination.currentPage}
            </span>
            <span className="mx-1">/</span>
            <span>{controls.pagination.totalPages || 1}</span>
          </div>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={
                    controls.pagination.currentPage >=
                    controls.pagination.totalPages
                  }
                  onClick={controls.pagination.nextPage}
                  aria-label="Next page"
                >
                  <ChevronRight />
                </Button>
              }
            />
            <TooltipContent side="top">Next page</TooltipContent>
          </Tooltip>

          {controls.zoom && (
            <>
              <Separator
                orientation="vertical"
                className="data-vertical:h-4 data-vertical:self-auto"
              />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={controls.zoom.zoomOut}
                      aria-label="Zoom out"
                    >
                      <ZoomOut />
                    </Button>
                  }
                />
                <TooltipContent side="top">Zoom out (-)</TooltipContent>
              </Tooltip>
              <span className="w-12 text-center text-xs font-mono tabular-nums text-muted-foreground shrink-0">
                {Math.round(controls.zoom.scale * 100)}%
              </span>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={controls.zoom.zoomIn}
                      aria-label="Zoom in"
                    >
                      <ZoomIn />
                    </Button>
                  }
                />
                <TooltipContent side="top">Zoom in (+)</TooltipContent>
              </Tooltip>
            </>
          )}
        </>
      )}

      {/* 3. VIDEO CONTROLS */}
      {previewType === "video" && controls?.playback && (
        <>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={controls.playback.togglePlay}
                  aria-label={controls.playback.isPlaying ? "Pause" : "Play"}
                >
                  {controls.playback.isPlaying ? <Pause /> : <Play />}
                </Button>
              }
            />
            <TooltipContent side="top">
              {controls.playback.isPlaying ? "Pause (Space)" : "Play (Space)"}
            </TooltipContent>
          </Tooltip>

          {/* Time scrubber and display with fixed widths and tabular-nums */}
          <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-foreground px-1 shrink-0">
            <span className="w-12 text-right shrink-0">
              {formatDuration(controls.playback.currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={controls.playback.duration || 100}
              step={0.1}
              value={controls.playback.currentTime}
              onChange={(e) =>
                controls.playback!.seek(parseFloat(e.target.value))
              }
              className="w-24 sm:w-36 h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary focus:outline-none shrink-0"
              title="Seek video position"
              aria-label="Seek video position"
            />
            <span className="w-12 text-left text-muted-foreground shrink-0">
              {formatDuration(controls.playback.duration)}
            </span>
          </div>

          {/* Mute toggle */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={controls.playback.toggleMute}
                  aria-label={controls.playback.isMuted ? "Unmute" : "Mute"}
                >
                  {controls.playback.isMuted ? <VolumeX /> : <Volume2 />}
                </Button>
              }
            />
            <TooltipContent side="top">
              {controls.playback.isMuted ? "Unmute" : "Mute"}
            </TooltipContent>
          </Tooltip>

          {/* Speed cycle button with fixed width */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const speeds = [1, 1.25, 1.5, 2, 0.75];
                    const nextIdx =
                      (speeds.indexOf(controls.playback!.speed) + 1) %
                      speeds.length;
                    controls.playback!.setSpeed(speeds[nextIdx]);
                  }}
                  className="w-11 px-0 text-xs font-mono tabular-nums text-foreground"
                  aria-label="Playback speed"
                >
                  {controls.playback.speed}x
                </Button>
              }
            />
            <TooltipContent side="top">Playback speed</TooltipContent>
          </Tooltip>
        </>
      )}

      {/* 4. SPREADSHEET CONTROLS */}
      {previewType === "spreadsheet" && controls?.spreadsheet && (
        <div className="flex items-center gap-2 px-1">
          <TableIcon className="size-4 text-muted-foreground" />
          {controls.spreadsheet.sheets.length > 1 && (
            <select
              value={controls.spreadsheet.activeSheet}
              onChange={(e) =>
                controls.spreadsheet!.onSelectSheet(e.target.value)
              }
              className="h-7 bg-muted text-foreground border border-border rounded-md px-2 text-xs outline-none cursor-pointer"
            >
              {controls.spreadsheet.sheets.map((sheet) => (
                <option
                  key={sheet}
                  value={sheet}
                  className="text-foreground bg-popover"
                >
                  {sheet}
                </option>
              ))}
            </select>
          )}
          {controls.spreadsheet.rowCount !== undefined && (
            <Badge variant="secondary">
              {controls.spreadsheet.rowCount} rows
            </Badge>
          )}
        </div>
      )}

      {/* Global Divider if controls exist */}
      {hasControls && (
        <Separator
          orientation="vertical"
          className="data-vertical:h-4 data-vertical:self-auto"
        />
      )}

      {/* Download file button */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              nativeButton={false}
              render={
                <a
                  href={asset.file_url}
                  download={asset.name}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Download asset"
                />
              }
            >
              <Download />
            </Button>
          }
        />
        <TooltipContent side="top">Download asset</TooltipContent>
      </Tooltip>

      {/* Browser Fullscreen Toggle */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 /> : <Maximize />}
            </Button>
          }
        />
        <TooltipContent side="top">
          {isFullscreen ? "Exit fullscreen (F)" : "Enter fullscreen (F)"}
        </TooltipContent>
      </Tooltip>
    </nav>
  );
}
