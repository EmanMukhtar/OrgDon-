import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { Upload, X } from "lucide-react";

export interface VideoUploadAreaRef {
  getVideoElement: () => HTMLVideoElement | null;
  getVideoUrl: () => string | null;
  hasVideo: () => boolean;
}

const VideoUploadArea = forwardRef<VideoUploadAreaRef>((_, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => ({
    getVideoElement: () => videoRef.current,
    getVideoUrl: () => videoUrl,
    hasVideo: () => !!videoUrl,
  }));

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith("video/")) {
      setFileName(file.name);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const removeVideo = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setFileName(null);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative transition-all cursor-pointer ${
        isDragging ? "scale-[1.01]" : ""
      }`}
      onClick={() => !videoUrl && document.getElementById("video-upload")?.click()}
    >
      <input
        id="video-upload"
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {videoUrl ? (
        <div className="relative aspect-video bg-foreground rounded-sm overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            controls
            crossOrigin="anonymous"
          />
          <button
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-background/90 hover:bg-background transition-colors text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              removeVideo();
            }}
            aria-label="Remove video"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <div
          className={`aspect-video flex flex-col items-center justify-center gap-2 border border-dashed rounded-sm transition-all ${
            isDragging
              ? "border-foreground bg-accent/80"
              : "border-muted-foreground/25 bg-muted/50"
          }`}
        >
          <span className="text-sm text-foreground">Drop video here or click</span>
          <span className="text-xs text-muted-foreground/60">MP4, MOV, WebM · Max 5 min</span>
        </div>
      )}
    </div>
  );
});

VideoUploadArea.displayName = "VideoUploadArea";

export default VideoUploadArea;
