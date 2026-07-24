"use client";

import * as React from "react";

export function useCopyToClipboard(timeout = 2000): {
  isCopied: boolean;
  copyToClipboard: (text: string) => Promise<boolean>;
} {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyToClipboard = React.useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator?.clipboard) {
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), timeout);
        return true;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to copy to clipboard:", error);
        setIsCopied(false);
        return false;
      }
    },
    [timeout],
  );

  return { isCopied, copyToClipboard };
}
