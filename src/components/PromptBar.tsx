const PromptBar = () => {
  return (
    <div className="py-4">
      <input
        type="text"
        placeholder="What would you like to isolate?"
        className="w-full bg-transparent border-t border-b border-border text-center py-3 text-sm tracking-wide placeholder:text-muted-foreground/60 focus:outline-none"
      />
    </div>
  );
};

export default PromptBar;
