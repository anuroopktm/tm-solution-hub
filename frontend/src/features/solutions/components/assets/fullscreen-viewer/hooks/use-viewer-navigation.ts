import type { SolutionAsset } from "@/types/solution-asset.types";
import { useCallback, useState } from "react";

export interface UseViewerNavigationOptions {
  assets: SolutionAsset[];
  initialIndex?: number;
  open: boolean;
  onAssetChange?: (index: number) => void;
}

export function useViewerNavigation({
  assets,
  initialIndex = 0,
  open,
  onAssetChange,
}: UseViewerNavigationOptions) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [prevSnapshot, setPrevSnapshot] = useState<{
    index: number;
    open: boolean;
  }>({ index: initialIndex, open });

  if (prevSnapshot.open !== open || prevSnapshot.index !== initialIndex) {
    setPrevSnapshot({ index: initialIndex, open });
    if (open) {
      const validIndex = Math.max(
        0,
        Math.min(initialIndex, Math.max(0, assets.length - 1)),
      );
      if (validIndex !== currentIndex) {
        setCurrentIndex(validIndex);
      }
    }
  }

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < assets.length - 1;

  const goToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < assets.length) {
        setCurrentIndex(index);
        onAssetChange?.(index);
      }
    },
    [assets.length, onAssetChange],
  );

  const prev = useCallback(() => {
    if (hasPrev) {
      goToIndex(currentIndex - 1);
    }
  }, [hasPrev, currentIndex, goToIndex]);

  const next = useCallback(() => {
    if (hasNext) {
      goToIndex(currentIndex + 1);
    }
  }, [hasNext, currentIndex, goToIndex]);

  const currentAsset = assets[currentIndex] ?? null;

  return {
    currentIndex,
    currentAsset,
    goToIndex,
    prev,
    next,
    hasPrev,
    hasNext,
    totalCount: assets.length,
  };
}
