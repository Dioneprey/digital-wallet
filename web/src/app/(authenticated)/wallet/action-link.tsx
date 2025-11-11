"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ActionLinkProps {
  href: string;
  title: string;
  icon: ReactNode;
  color?: string;
  textColor?: string;
}

export function ActionLink({
  href,
  title,
  icon,
  color = "bg-primary",
  textColor = "text-primary-foreground",
}: ActionLinkProps) {
  return (
    <Link href={href} className="group">
      <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform",
            color
          )}
        >
          <div className={cn("h-6 w-6", textColor)}>{icon}</div>
        </div>
        <span className="text-sm font-medium">{title}</span>
      </div>
    </Link>
  );
}
