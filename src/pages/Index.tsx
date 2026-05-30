import { useRef, useState } from "react";
import FluentHeader from "@/components/FluentHeader";
import VideoUploadArea, { VideoUploadAreaRef } from "@/components/VideoUploadArea";
import PromptBar from "@/components/PromptBar";
import ProcessingOptions from "@/components/ProcessingOptions";
import EditPanel from "@/components/EditPanel";
import { Paintbrush } from "lucide-react";

const Index = () => {
  const videoUploadRef = useRef<VideoUploadAreaRef>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const [showEditPanel, setShowEditPanel] = useState(false);

  // Bridge: get video element ref from upload area
  const getVideoRef = () => videoElementRef;

  // Keep videoElementRef in sync
  const syncVideoRef = () => {
    const el = videoUploadRef.current?.getVideoElement();
    if (el) videoElementRef.current = el;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <FluentHeader />
      <div className="flex flex-1 relative">
        {/* Main content */}
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-2">
          <VideoUploadArea ref={videoUploadRef} />
          <PromptBar />
          <ProcessingOptions />
          <div className="pt-4 flex justify-center gap-3">
            <button className="px-12 sm:px-16 py-2.5 bg-primary text-primary-foreground text-xs tracking-[0.2em] uppercase hover:opacity-80 transition-opacity">
              Process
            </button>
            <button
              onClick={() => setShowEditPanel(!showEditPanel)}
              className="lg:hidden px-4 py-2.5 border border-border text-xs tracking-[0.15em] uppercase hover:bg-accent transition-colors flex items-center gap-2"
            >
              <Paintbrush className="w-3.5 h-3.5" strokeWidth={1.5} />
              Edit
            </button>
          </div>
        </main>

        {/* Edit Panel - desktop: always visible sidebar */}
        <aside className="w-72 xl:w-80 border-l border-border flex-shrink-0 hidden lg:flex flex-col min-h-[calc(100vh-57px)]">
          <EditPanel videoRef={getVideoRef()} />
        </aside>

        {/* Edit Panel - mobile: slide-over */}
        {showEditPanel && (
          <>
            <div
              className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
              onClick={() => setShowEditPanel(false)}
            />
            <aside className="fixed right-0 top-0 bottom-0 w-72 z-50 lg:hidden bg-card shadow-lg overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Edit Panel</span>
                <button
                  onClick={() => setShowEditPanel(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <EditPanel videoRef={getVideoRef()} />
            </aside>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
