import * as React from "react";

import { cn } from "@/lib/utils";
import { FormErrors } from "@/common/interfaces/form-response.interface";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps & {
    error?: FormErrors;
    label?: string;
    icon?: React.ReactNode;
  }
>(({ className, error, label, icon, ...props }, ref) => {
  const errorMessage =
    (props.name && error?.[props.name]) || error?.["response"];

  return (
    <div className="relative">
      {label && <span className="font-semibold text-[15px]">{label}</span>}
      {icon && <div className="absolute top-[34px] left-3">{icon}</div>}
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          props.name &&
            errorMessage &&
            "file:text-red-400 placeholder:text-red-400 text-red-400 border-red-400",
          icon && "pl-10",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
