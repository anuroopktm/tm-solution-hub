import type { SolutionAsset } from "@/types/solution-asset.types";

export type PreviewType =
  "image" | "pdf" | "video" | "spreadsheet" | "document" | "unsupported";

export interface ViewerZoomControls {
  scale: number;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  fit?: () => void;
}

export interface ViewerRotationControls {
  angle: number;
  rotate: () => void;
}

export interface ViewerPaginationControls {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage?: () => void;
  prevPage?: () => void;
}

export interface ViewerPlaybackControls {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  togglePlay: () => void;
  seek: (time: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  speed: number;
  setSpeed: (speed: number) => void;
}

export interface ViewerSpreadsheetControls {
  sheets: string[];
  activeSheet: string;
  onSelectSheet: (sheet: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  rowCount?: number;
}

export interface ViewerDocumentControls {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export interface ViewerControls {
  zoom?: ViewerZoomControls;
  rotation?: ViewerRotationControls;
  pagination?: ViewerPaginationControls;
  playback?: ViewerPlaybackControls;
  spreadsheet?: ViewerSpreadsheetControls;
  document?: ViewerDocumentControls;
}

export interface BaseViewerRendererProps {
  asset: SolutionAsset;
  setControls: (controls: ViewerControls | null) => void;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (error: Error | string | null) => void;
}

export interface SolutionFullscreenViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assets: SolutionAsset[];
  initialIndex?: number;
}
