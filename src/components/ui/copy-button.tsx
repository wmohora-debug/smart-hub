"use client";

import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { notify } from "@/components/ui/toast-wrapper";

export interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  textToCopy: string;
  successMessage?: string;
}

export function CopyButton({
  textToCopy,
  successMessage = "Copied to clipboard!",
  variant = "ghost",
  size = "icon",
  className,
  ...props
}: CopyButtonProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const handleCopy = async () => {
    const success = await copyToClipboard(textToCopy);
    if (success) {
      notify.success(successMessage);
    } else {
      notify.error("Failed to copy text.");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
      title="Copy to clipboard"
      {...props}
    >
      {isCopied ? (
        <Icons.copyCheck className="h-4 w-4 text-success" />
      ) : (
        <Icons.copy className="h-4 w-4" />
      )}
      <span className="sr-only">Copy text</span>
    </Button>
  );
}
