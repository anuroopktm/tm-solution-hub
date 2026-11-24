import { useCallback, useEffect, useState } from "react";

export function useViewerFullscreen(
  targetRef?: React.RefObject<HTMLElement | null>,
) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        const elem = targetRef?.current || document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Fullscreen request might fail if denied by user or permissions
    }
  }, [targetRef]);

  return { isFullscreen, toggleFullscreen };
}
