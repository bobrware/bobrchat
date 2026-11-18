"use client";

import { githubDark, githubLight } from "@pierre/highlights/themes";
import { createHighlightsPlugin } from "@pierre/words/highlights";
import { Markdown } from "@pierre/words/react";
import { memo } from "react";

const code = createHighlightsPlugin({
  themes: { light: githubLight, dark: githubDark },
  defaultColor: false,
});

const components = {
  a: (html: string) =>
    html.replace("<a ", "<a target=\"_blank\" rel=\"noopener noreferrer\" "),
};

export const MemoizedMarkdown = memo(
  ({
    content,
    id,
    streaming = false,
  }: { content: string; id: string; streaming?: boolean }) => {
    return (
      <Markdown
        key={id}
        components={components}
        isAnimating={streaming}
        math
        plugins={{ code }}
      >
        {content}
      </Markdown>
    );
  },
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
