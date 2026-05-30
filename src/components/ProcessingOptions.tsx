import { useState } from "react";

const ProcessingOptions = () => {
  const [selected, setSelected] = useState<"standard" | "premium">("standard");

  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setSelected("standard")}
          className={`px-10 py-2.5 rounded-full border text-xs tracking-[0.2em] uppercase transition-all ${
            selected === "standard"
              ? "border-foreground text-foreground"
              : "border-border text-muted-foreground hover:border-muted-foreground"
          }`}
        >
          Standard
        </button>
        <button
          onClick={() => setSelected("premium")}
          className={`px-10 py-2.5 rounded-full border text-xs tracking-[0.2em] uppercase transition-all ${
            selected === "premium"
              ? "border-foreground text-foreground"
              : "border-border text-muted-foreground hover:border-muted-foreground"
          }`}
        >
          Premium
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground tracking-wide">
        Standard 5 credits&nbsp;&nbsp;·&nbsp;&nbsp;Premium 10 credits
      </p>
      <div className="text-[11px] text-muted-foreground/60 leading-relaxed">
        <p>Standard — WebM with alpha, ideal for web.</p>
        <p>Premium — ProRes 4444 MOV with alpha, for editing.</p>
      </div>
    </div>
  );
};

export default ProcessingOptions;
