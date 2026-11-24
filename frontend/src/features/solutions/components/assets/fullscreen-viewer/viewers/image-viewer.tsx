import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchContentRef,
} from "react-zoom-pan-pinch";
import type { BaseViewerRendererProps } from "../types/viewer.types";
import { useCallback, useEffect, useRef, useState } from "react";

export function ImageViewer({
  asset,
  setControls,
  onError,
}: BaseViewerRendererProps) {
  const transformRef = useRef<ReactZoomPanPinchContentRef>(null);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  const isLoaded = loadedUrl === asset.file_url;

  const handleZoomIn = useCallback(() => {
    transformRef.current?.zoomIn(0.25);
  }, []);

  const handleZoomOut = useCallback(() => {
    transformRef.current?.zoomOut(0.25);
  }, []);

  const handleReset = useCallback(() => {
    transformRef.current?.resetTransform();
    setRotation(0);
    setScale(1);
  }, []);

  const handleFit = useCallback(() => {
    transformRef.current?.resetTransform();
    setScale(1);
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
  }, []);

  // Expose controls to the bottom toolbar
  useEffect(() => {
    setControls({
      zoom: {
        scale,
        zoomIn: handleZoomIn,
        zoomOut: handleZoomOut,
        reset: handleReset,
        fit: handleFit,
      },
      rotation: {
        angle: rotation,
        rotate: handleRotate,
      },
    });

    return () => setControls(null);
  }, [
    scale,
    rotation,
    setControls,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    handleFit,
    handleRotate,
  ]);

  return (
    <div className="relative size-full flex items-center justify-center overflow-hidden">
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.2}
        maxScale={8}
        centerOnInit
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
        doubleClick={{ mode: "reset" }}
        onTransform={(_, state) => {
          setScale(state.scale);
        }}
      >
        <TransformComponent
          wrapperClass="!w-full !h-full flex items-center justify-center overflow-hidden"
          contentClass="!w-full !h-full flex items-center justify-center"
        >
          <div
            className="flex items-center justify-center transition-transform duration-200 ease-out select-none cursor-grab active:cursor-grabbing"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <img
              src={asset.file_url}
              alt={asset.name}
              draggable={false}
              className={`max-h-[calc(100vh-10rem)] max-w-[calc(100vw-6rem)] object-contain rounded-md shadow-2xl transition-opacity duration-300 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setLoadedUrl(asset.file_url)}
              onError={() => {
                onError?.(
                  "Failed to load image preview. The file may be corrupt or inaccessible.",
                );
              }}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
