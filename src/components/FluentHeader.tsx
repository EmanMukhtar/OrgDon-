import { User, CreditCard } from "lucide-react";

const FluentHeader = () => {
  return (
    <header className="bg-header text-header-foreground">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-8 py-4">
        <span className="text-sm font-medium tracking-[0.35em] font-['Space_Grotesk']">FLUENT</span>
        <div className="flex items-center gap-5">
          <a href="#" className="opacity-60 hover:opacity-100 transition-opacity">
            <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </a>
          <a href="#" className="opacity-60 hover:opacity-100 transition-opacity">
            <CreditCard className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </header>
  );
};

export default FluentHeader;
