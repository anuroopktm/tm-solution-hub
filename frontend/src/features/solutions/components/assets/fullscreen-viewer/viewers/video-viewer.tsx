import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BaseViewerRendererProps } from "../types/viewer.types";
import { Spinner } from "@/components/ui/spinner";

function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtube.com")) {
      const v = urlObj.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`;
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.includes("embed") || pathParts.includes("v")) {
        const id = pathParts[pathParts.length - 1];
        if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
    }
    if (urlObj.hostname.includes("youtu.be")) {
      const id = urlObj.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (urlObj.hostname.includes("vimeo.com")) {
      const parts = urlObj.pathname.split("/").filter(Boolean);
      const id = parts[parts.length - 1];
      if (id && /^\d+$/.test(id)) {
        return `https://player.vimeo.com/video/${id}?autoplay=1`;
      }
    }
  } catch {
    // Non-URL format or local path
  }

  return null;
}

export function VideoViewer({
  asset,
  setControls,
  onError,
}: BaseViewerRendererProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(asset.duration_seconds || 0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [speed, setSpeed] = useState<number>(1);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);

  const embedUrl = useMemo(() => getEmbedUrl(asset.file_url), [asset.file_url]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  const handleSetVolume = useCallback((vol: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  }, []);

  const handleSetSpeed = useCallback((rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setSpeed(rate);
  }, []);

  // Expose playback controls to bottom-center toolbar (only for native video)
  useEffect(() => {
    if (embedUrl) {
      setControls(null);
      return;
    }

    setControls({
      playback: {
        isPlaying,
        currentTime,
        duration,
        togglePlay,
        seek,
        isMuted,
        toggleMute,
        volume,
        setVolume: handleSetVolume,
        speed,
        setSpeed: handleSetSpeed,
      },
    });

    return () => setControls(null);
  }, [
    embedUrl,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    isMuted,
    toggleMute,
    volume,
    handleSetVolume,
    speed,
    handleSetSpeed,
    setControls,
  ]);

  if (embedUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 pb-20">
        <iframe
          src={embedUrl}
          title={asset.name}
          className="w-full max-w-5xl aspect-video max-h-full rounded-xl border border-border shadow-2xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 pb-20">
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <Spinner className="size-10 text-primary" />
        </div>
      )}

      <video
        ref={videoRef}
        src={asset.file_url}
        poster={asset.thumbnail_url || undefined}
        controls={false}
        autoPlay
        playsInline
        onClick={togglePlay}
        className="max-h-full max-w-full rounded-xl shadow-2xl object-contain bg-black border border-border/40 cursor-pointer"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(
              videoRef.current.duration || asset.duration_seconds || 0,
            );
          }
        }}
        onError={() =>
          onError?.(
            "Failed to load video. The format may not be supported by this browser.",
          )
        }
      >
        Your browser does not support HTML5 video playback.
      </video>
    </div>
  );
}
