export function CostBreakdownMockup() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-2">
      {/* Message metrics bar */}
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <span className="font-medium">claude-opus-4.6</span>
        <span>•</span>
        <span>42.8 tok/s</span>
        <span>•</span>
        <span>847 tokens</span>
        <span>•</span>
        <span className="cursor-help underline decoration-dotted">$0.032688</span>
      </div>

      {/* Tooltip mockup */}
      <div className={`
        bg-popover text-popover-foreground ml-auto w-48 border p-3 shadow-md
      `}
      >
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between">
            <span>Model:</span>
            <span className="font-mono">$0.016688</span>
          </div>
          <div className="flex justify-between">
            <span>Search:</span>
            <span className="font-mono">$0.015000</span>
          </div>
          <div className="flex justify-between">
            <span>Extract:</span>
            <span className="font-mono">$0.001000</span>
          </div>
          <div className="flex justify-between border-t pt-1.5 font-medium">
            <span>Total:</span>
            <span className="font-mono">$0.032688</span>
          </div>
        </div>
      </div>
    </div>
  );
}
