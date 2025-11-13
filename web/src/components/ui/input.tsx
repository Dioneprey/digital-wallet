import * as React from "react";

import { cn } from "@/lib/utils";
import { FormErrors } from "@/common/interfaces/form-response.interface";

function Input({
  className,
  type,
  error,
  label,
  icon,
  customName,
  ...props
}: React.ComponentProps<"input"> & {
  customName?: string;
  error?: FormErrors;
  label?: string;
  icon?: React.ReactNode;
}) {
  const containName = props.name || customName;
  const errorMessage =
    (containName && error?.[containName]) || error?.["response"];

  return (
    <div className="relative">
      {label && <span className="font-semibold text-[15px]">{label}</span>}
      {icon && (
        <div
          className={cn(
            "absolute top-[34px] left-3",
            containName &&
              errorMessage &&
              "file:text-red-400 placeholder:text-red-400 text-red-400 border-red-400"
          )}
        >
          {icon}
        </div>
      )}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground bg-background placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-border flex h-9 w-full min-w-0 rounded-md border hover:border-primary px-3 py-5 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          containName &&
            errorMessage &&
            "file:text-red-400 placeholder:text-red-400 text-red-400 border-red-400",
          icon && "pl-10",
          className
        )}
        {...props}
      />
      {errorMessage ? (
        <span className="absolute text-xs text-red-400">{errorMessage}</span>
      ) : null}
    </div>
  );
}

export { Input };
