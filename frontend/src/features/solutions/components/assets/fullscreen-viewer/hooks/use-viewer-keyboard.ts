import { useEffect } from "react";
import type { ViewerControls } from "../types/viewer.types";

export interface UseViewerKeyboardOptions {
  open: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  controls: ViewerControls | null;
  toggleFullscreen?: () => void;
}

export function useViewerKeyboard({
  open,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  controls,
  toggleFullscreen,
}: UseViewerKeyboardOptions) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (e.key) {
        case "Escape": {
          e.preventDefault();
          onClose();
          break;
        }
        case "ArrowLeft": {
          if (hasPrev) {
            e.preventDefault();
            onPrev();
          }
          break;
        }
        case "ArrowRight": {
          if (hasNext) {
            e.preventDefault();
            onNext();
          }
          break;
        }
        case " ": {
          // Play/pause video if available, but not if a button is focused
          if (target && target.tagName === "BUTTON") {
            return;
          }
          if (controls?.playback) {
            e.preventDefault();
            controls.playback.togglePlay();
          }
          break;
        }
        case "+":
        case "=": {
          if (controls?.zoom) {
            e.preventDefault();
            controls.zoom.zoomIn();
          }
          break;
        }
        case "-":
        case "_": {
          if (controls?.zoom) {
            e.preventDefault();
            controls.zoom.zoomOut();
          }
          break;
        }
        case "0": {
          if (controls?.zoom) {
            e.preventDefault();
            controls.zoom.reset();
          }
          break;
        }
        case "f":
        case "F": {
          if (toggleFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    open,
    onClose,
    onPrev,
    onNext,
    hasPrev,
    hasNext,
    controls,
    toggleFullscreen,
  ]);
}
