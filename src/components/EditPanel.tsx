import { useState, useRef, useEffect, useCallback } from "react";
import {
  Undo2, Redo2, Eye,
  Image, Paintbrush, SunMedium,
  Contrast, Scissors, Palette,
  Check, Upload, Type
} from "lucide-react";

type Tab = "background" | "design" | "adjust";

interface EditPanelProps {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

const bgOptions = [
  { label: "Green", color: "hsl(120, 100%, 35%)" },
  { label: "Black", color: "hsl(0, 0%, 0%)" },
  { label: "White", color: "hsl(0, 0%, 100%)" },
  { label: "Transparent", color: "transparent", checkerboard: true },
  { label: "Alpha", color: "transparent", gradient: true },
];

const EditPanel = ({ videoRef }: EditPanelProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("background");
  const [selectedBg, setSelectedBg] = useState("Green");
  const [customColor, setCustomColor] = useState("#ff0000");

  // Design state
  const [textValue, setTextValue] = useState("");
  const [textFont, setTextFont] = useState("sans-serif");
  const [textSize, setTextSize] = useState(24);
  const [textColor, setTextColor] = useState("#ffffff");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [textOverlays, setTextOverlays] = useState<Array<{
    text: string; font: string; size: number; color: string; x: number; y: number;
  }>>([]);

  // Adjust state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);

  // Canvas for drawing
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Undo/redo
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Apply CSS filters to video
  useEffect(() => {
    const video = videoRef?.current;
    if (!video) return;
    video.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  }, [brightness, contrast, saturation, videoRef]);

  // Setup drawing canvas overlay
  const setupCanvas = useCallback(() => {
    const video = videoRef?.current;
    if (!video || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = video.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = isDrawing ? "auto" : "none";
    canvas.style.zIndex = "10";

    // Restore from history
    if (historyIndex >= 0 && history[historyIndex]) {
      const img = new window.Image();
      img.onload = () => {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0);
      };
      img.src = history[historyIndex];
    }
  }, [videoRef, isDrawing, history, historyIndex]);

  useEffect(() => {
    setupCanvas();
  }, [setupCanvas]);

  // Position canvas on top of video
  useEffect(() => {
    const video = videoRef?.current;
    if (!video) return;
    const parent = video.parentElement;
    if (!parent || !canvasRef.current) return;
    if (!parent.contains(canvasRef.current)) {
      parent.style.position = "relative";
      parent.appendChild(canvasRef.current);
    }
    const resizeObserver = new ResizeObserver(() => setupCanvas());
    resizeObserver.observe(video);
    return () => resizeObserver.disconnect();
  }, [videoRef, setupCanvas]);

  const saveCanvasState = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex <= 0) {
      // Clear canvas
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHistoryIndex(-1);
      return;
    }
    setHistoryIndex(historyIndex - 1);
    const img = new window.Image();
    img.onload = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0);
      }
    };
    img.src = history[historyIndex - 1];
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    setHistoryIndex(historyIndex + 1);
    const img = new window.Image();
    img.onload = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0);
      }
    };
    img.src = history[historyIndex + 1];
  };

  // Drawing handlers
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    drawingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    lastPointRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    lastPointRef.current = { x, y };
  };

  const endDraw = () => {
    if (drawingRef.current) {
      drawingRef.current = false;
      lastPointRef.current = null;
      saveCanvasState();
    }
  };

  // Add text overlay to canvas
  const addTextOverlay = () => {
    if (!textValue.trim() || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const fontFamily = textFont === "sans-serif" ? "sans-serif" : textFont === "serif" ? "serif" : "monospace";
    ctx.font = `${textSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.fillText(textValue, canvas.width / 2 - ctx.measureText(textValue).width / 2, canvas.height / 2);
    setTextOverlays([...textOverlays, { text: textValue, font: textFont, size: textSize, color: textColor, x: 50, y: 50 }]);
    setTextValue("");
    saveCanvasState();
  };

  // Trim video
  const applyTrim = () => {
    const video = videoRef?.current;
    if (!video || !video.duration) return;
    const startTime = (trimStart / 100) * video.duration;
    video.currentTime = startTime;
  };

  useEffect(() => {
    applyTrim();
  }, [trimStart]);

  // Show original
  const [showOriginal, setShowOriginal] = useState(false);
  const toggleOriginal = () => {
    const video = videoRef?.current;
    if (!video) return;
    if (!showOriginal) {
      video.style.filter = "none";
      if (canvasRef.current) canvasRef.current.style.display = "none";
    } else {
      video.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      if (canvasRef.current) canvasRef.current.style.display = "block";
    }
    setShowOriginal(!showOriginal);
  };

  // Create canvas element
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.style.position = "absolute";
      canvasRef.current.style.top = "0";
      canvasRef.current.style.left = "0";
      canvasRef.current.style.cursor = "crosshair";
    }
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "background", label: "BG", icon: <Image className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: "design", label: "DESIGN", icon: <Paintbrush className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    { id: "adjust", label: "ADJUST", icon: <SunMedium className="w-3.5 h-3.5" strokeWidth={1.5} /> },
  ];

  const formatTime = (pct: number) => {
    const video = videoRef?.current;
    const duration = video?.duration || 154; // fallback 2:34
    const secs = (pct / 100) * duration;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-card border-l border-border h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={undo} className="p-1 rounded hover:bg-accent transition-colors" title="Undo">
            <Undo2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <button onClick={redo} className="p-1 rounded hover:bg-accent transition-colors" title="Redo">
            <Redo2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <div className="w-px h-3 bg-border mx-1" />
          <button
            onClick={toggleOriginal}
            className={`p-1 rounded transition-colors ${showOriginal ? "bg-accent" : "hover:bg-accent"}`}
            title="Preview original"
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
        <span className="text-[10px] text-muted-foreground/50 tracking-wider">1920×1080</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] tracking-[0.15em] font-medium transition-all ${
              activeTab === tab.id
                ? "text-foreground border-b border-foreground"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5 space-y-5 flex-1 overflow-y-auto">
        {activeTab === "background" && (
          <>
            <div>
              <p className="text-[10px] tracking-[0.2em] text-muted-foreground/50 uppercase mb-3">Replace</p>
              <div className="grid grid-cols-5 gap-2">
                {bgOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setSelectedBg(opt.label)}
                    className={`flex flex-col items-center gap-1.5 p-1.5 rounded transition-all ${
                      selectedBg === opt.label
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-sm border border-border"
                      style={{
                        backgroundColor: opt.gradient ? undefined : (opt.checkerboard ? undefined : opt.color),
                        backgroundImage: opt.gradient
                          ? "linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(0 0% 0%) 100%)"
                          : opt.checkerboard
                          ? "repeating-conic-gradient(hsl(0 0% 82%) 0% 25%, transparent 0% 50%)"
                          : undefined,
                        backgroundSize: opt.checkerboard ? "6px 6px" : undefined,
                      }}
                    />
                    <span className="text-[8px] tracking-wider text-muted-foreground">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 rounded px-3 py-2 bg-accent/50">
                <Palette className="w-3.5 h-3.5 text-muted-foreground/50" strokeWidth={1.5} />
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => { setCustomColor(e.target.value); setSelectedBg("custom"); }}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[10px] text-muted-foreground/50">Custom</span>
              </div>
              <button className="flex items-center gap-1.5 rounded px-3 py-2 bg-accent/50 hover:bg-accent transition-colors">
                <Upload className="w-3.5 h-3.5 text-muted-foreground/50" strokeWidth={1.5} />
                <span className="text-[10px] text-muted-foreground/50">Image</span>
              </button>
            </div>
          </>
        )}

        {activeTab === "design" && (
          <>
            <div>
              <p className="text-[10px] tracking-[0.2em] text-muted-foreground/50 uppercase mb-3">Text</p>
              <input
                type="text"
                placeholder="Type here..."
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className="w-full bg-accent/30 rounded px-3 py-2 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:bg-accent/50 transition-colors"
              />
              <div className="flex gap-2 mt-2">
                <select
                  value={textFont}
                  onChange={(e) => setTextFont(e.target.value)}
                  className="flex-1 bg-accent/30 rounded px-2 py-1.5 text-[10px] text-muted-foreground focus:outline-none appearance-none"
                >
                  <option value="sans-serif">Sans-serif</option>
                  <option value="serif">Serif</option>
                  <option value="mono">Mono</option>
                </select>
                <select
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  className="w-14 bg-accent/30 rounded px-2 py-1.5 text-[10px] text-muted-foreground focus:outline-none appearance-none"
                >
                  <option value={16}>16</option>
                  <option value={24}>24</option>
                  <option value={32}>32</option>
                  <option value={48}>48</option>
                </select>
                <div className="flex items-center gap-1 bg-accent/30 rounded px-2">
                  <Type className="w-3 h-3 text-muted-foreground/50" strokeWidth={1.5} />
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
              <button
                onClick={addTextOverlay}
                disabled={!textValue.trim()}
                className="mt-2 w-full py-1.5 text-[10px] tracking-wider uppercase bg-foreground text-background rounded hover:opacity-80 transition-opacity disabled:opacity-30"
              >
                Add Text
              </button>
            </div>

            <div className="border-t border-border pt-5">
              <p className="text-[10px] tracking-[0.2em] text-muted-foreground/50 uppercase mb-3">Draw</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDrawing(!isDrawing)}
                  className={`flex items-center gap-2 rounded px-2.5 py-1.5 transition-colors ${
                    isDrawing ? "bg-foreground text-background" : "bg-accent/30"
                  }`}
                >
                  <Paintbrush className="w-3 h-3" strokeWidth={1.5} />
                  <span className="text-[9px] tracking-wider uppercase">{isDrawing ? "On" : "Off"}</span>
                </button>
                <div className="flex items-center gap-2 bg-accent/30 rounded px-2.5 py-1.5">
                  <input
                    type="color"
                    value={drawColor}
                    onChange={(e) => setDrawColor(e.target.value)}
                    className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
                <div className="flex gap-1.5">
                  {[2, 4, 8].map((size) => (
                    <button
                      key={size}
                      onClick={() => setBrushSize(size)}
                      className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                        brushSize === size ? "bg-accent" : "bg-accent/30 hover:bg-accent"
                      }`}
                    >
                      <div className="rounded-full bg-foreground" style={{ width: size + 1, height: size + 1 }} />
                    </button>
                  ))}
                </div>
              </div>
              {isDrawing && (
                <p className="text-[9px] text-muted-foreground/40 mt-2">Draw directly on the video preview</p>
              )}
            </div>
          </>
        )}

        {activeTab === "adjust" && (
          <>
            <div>
              <p className="text-[10px] tracking-[0.2em] text-muted-foreground/50 uppercase mb-3">Trim</p>
              <div className="flex items-center gap-2">
                <Scissors className="w-3.5 h-3.5 text-muted-foreground/40" strokeWidth={1.5} />
                <div className="flex-1 h-7 bg-accent/30 rounded relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 bg-accent border-x border-foreground/20 rounded-sm"
                    style={{ left: `${trimStart}%`, right: `${100 - trimEnd}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={trimStart}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (v < trimEnd) setTrimStart(v);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground/40 mt-1 px-6">
                <span>{formatTime(trimStart)}</span>
                <span>{formatTime(trimEnd)}</span>
              </div>
            </div>

            <div className="border-t border-border pt-5 space-y-4">
              {[
                { label: "Brightness", icon: <SunMedium className="w-3.5 h-3.5" strokeWidth={1.5} />, value: brightness, setValue: setBrightness },
                { label: "Contrast", icon: <Contrast className="w-3.5 h-3.5" strokeWidth={1.5} />, value: contrast, setValue: setContrast },
                { label: "Saturation", icon: <Palette className="w-3.5 h-3.5" strokeWidth={1.5} />, value: saturation, setValue: setSaturation },
              ].map((ctrl) => (
                <div key={ctrl.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-muted-foreground/50">
                      {ctrl.icon}
                      <span className="text-[10px] tracking-wider uppercase">{ctrl.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/40">{ctrl.value}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={ctrl.value}
                    onChange={(e) => ctrl.setValue(Number(e.target.value))}
                    className="w-full h-[2px] bg-accent rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>
              ))}
              <button
                onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); }}
                className="w-full py-1.5 text-[9px] tracking-wider uppercase text-muted-foreground/50 hover:text-foreground bg-accent/30 rounded transition-colors"
              >
                Reset Adjustments
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditPanel;
