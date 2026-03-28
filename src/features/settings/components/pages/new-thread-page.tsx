"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { PreferencesUpdate } from "~/features/settings/types";
import type { ThreadIcon } from "~/lib/db/schema/chat";

import { Skeleton } from "~/components/ui/skeleton";
import { useUpdatePreferences, useUserSettings } from "~/features/settings/hooks/use-user-settings";

import { IconSelectItem } from "../ui/icon-select-item";
import { SelectionCardItem } from "../ui/selection-card-item";
import { SettingsSection } from "../ui/settings-section";
import { TextInputItem } from "../ui/text-input-item";

const landingPageOptions = [
  { value: "suggestions" as const, label: "Prompts", description: "Show some suggested prompts" },
  { value: "greeting" as const, label: "Greeting", description: "Simple welcome message" },
  { value: "blank" as const, label: "Blank", description: "Render nothing: blank slate" },
];

export function NewThreadPage() {
  const { data: settings, isLoading } = useUserSettings({ enabled: true });
  const updatePreferences = useUpdatePreferences();
  const [defaultThreadName, setDefaultThreadName] = useState("");
  const [defaultThreadIcon, setDefaultThreadIcon] = useState<ThreadIcon>("message-circle");
  const [customInstructions, setCustomInstructions] = useState("");

  useEffect(() => {
    setDefaultThreadName(settings?.defaultThreadName ?? "");
    setDefaultThreadIcon(settings?.defaultThreadIcon ?? "message-circle");
    setCustomInstructions(settings?.customInstructions ?? "");
  }, [settings]);

  const save = async (patch: PreferencesUpdate) => {
    try {
      await updatePreferences.mutateAsync(patch);
    }
    catch (error) {
      console.error("Failed to save preferences:", error);
      const message = error instanceof Error ? error.message : "Failed to save preferences";
      toast.error(message);
    }
  };

  if (isLoading || !settings) {
    return <NewThreadPageSkeleton />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto w-full max-w-3xl space-y-8 p-6">
        <SettingsSection
          title="New Threads"
          description="Configure what you see and how new threads are initialized."
        >
          <SelectionCardItem
            label="Landing Page Content"
            options={landingPageOptions}
            value={settings.landingPageContent}
            onChange={value => save({ landingPageContent: value })}
            layout="flex"
          />

          <TextInputItem
            label="Default Thread Name"
            description="The default name for new threads."
            value={defaultThreadName}
            placeholder="New Thread"
            maxLength={80}
            onChange={setDefaultThreadName}
            onBlur={() => {
              if (defaultThreadName !== settings.defaultThreadName && defaultThreadName.length <= 80) {
                save({ defaultThreadName });
              }
            }}
          />

          {!settings.showSidebarIcons && (
            <IconSelectItem
              label="Default Thread Icon"
              description="The default icon for new threads."
              value={defaultThreadIcon}
              onChange={(icon) => {
                setDefaultThreadIcon(icon);
                if (icon !== settings.defaultThreadIcon) {
                  save({ defaultThreadIcon: icon });
                }
              }}
            />
          )}

          <TextInputItem
            label="Custom Instructions"
            description="These instructions will be included in every thread."
            value={customInstructions}
            placeholder="Add any custom instructions for the AI assistant..."
            size="multi"
            onChange={setCustomInstructions}
            onBlur={() => {
              if (customInstructions !== (settings.customInstructions ?? "")) {
                save({ customInstructions });
              }
            }}
          />
        </SettingsSection>
      </div>
    </div>
  );
}

function NewThreadPageSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <div className="flex gap-2">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
