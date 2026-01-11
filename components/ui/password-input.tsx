"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.ComponentProps<"input"> {
  showPasswordToggle?: boolean;
  autoComplete?: string;
}

export function PasswordInput({
  className,
  showPasswordToggle = true,
  autoComplete,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        autoComplete={
          autoComplete ||
          (props.id === "password" ? "current-password" : "new-password")
        }
        {...props}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
