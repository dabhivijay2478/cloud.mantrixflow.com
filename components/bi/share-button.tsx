"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2, Link, Mail, Copy, Check } from "lucide-react";

/**
 * ShareButton
 * @description Shareable link generator with multiple sharing options.
 * Provides social sharing, email, and link copying functionality.
 * @param {ShareButtonProps} props - Component properties
 * @param {string} props.url - URL to share
 * @param {string} [props.title] - Share title/subject
 * @param {string} [props.description] - Share description
 * @param {boolean} [props.showLabel] - Show "Share" label (default: true)
 * @param {ShareButtonVariant} [props.variant] - Button variant
 * @param {ShareButtonSize} [props.size] - Button size
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} ShareButton component
 * @example
 * <ShareButton
 *   url="https://example.com/dashboard/123"
 *   title="Q4 Revenue Dashboard"
 *   description="Check out our latest analytics"
 * />
 */

export type ShareButtonVariant = "default" | "outline" | "ghost" | "secondary";
export type ShareButtonSize = "sm" | "default" | "lg";

export interface ShareButtonProps {
  url: string;
  title?: string;
  description?: string;
  showLabel?: boolean;
  variant?: ShareButtonVariant;
  size?: ShareButtonSize;
  className?: string;
}

export function ShareButton({
  url,
  title = "Check this out",
  description = "",
  showLabel = true,
  variant = "default",
  size = "default",
  className,
}: ShareButtonProps) {
  const [showDialog, setShowDialog] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${description}\n\n${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <Share2 className="h-4 w-4" />
            {showLabel && <span className="ml-2">Share</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowDialog(true)}>
            <Link className="mr-2 h-4 w-4" />
            Copy Link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Share via Email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Link</DialogTitle>
            <DialogDescription>
              Anyone with this link can view this dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input value={url} readOnly />
            <Button onClick={handleCopyLink} size="sm">
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="ml-2">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="ml-2">Copy</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
