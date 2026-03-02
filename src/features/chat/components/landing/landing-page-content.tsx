"use client";

import type { LandingPageContentType } from "~/features/settings/types";

import { cn } from "~/lib/utils";

import { GreetingContent } from "./greeting-content";
import { SuggestionsContent } from "./suggestions-content";

export function LandingPageContent({
  type,
  isVisible,
  onSuggestionClickAction,
}: {
  type: LandingPageContentType;
  isVisible: boolean;
  onSuggestionClickAction?: (suggestion: string) => void;
}) {
  if (type === "blank") {
    return null;
  }

  return (
    <div
      className={cn(
        `
          flex justify-center p-4 pt-[33vh] transition-all duration-300
          ease-in-out
        `,
        isVisible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <div className="h-max w-max max-w-lg">
        <div
          className="transition-all duration-300 ease-in-out"
          style={{
            opacity: isVisible ? 1 : 0,
            pointerEvents: isVisible ? "auto" : "none",
          }}
        >
          {type === "suggestions" && <SuggestionsContent onSuggestionClickAction={onSuggestionClickAction} />}
          {type === "greeting" && <GreetingContent />}
        </div>
      </div>
    </div>
  );
}
