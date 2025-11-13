"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "@/common/util/format-currency";

export function ToggleBalance({
  balance,
  color,
  size,
}: {
  balance: number;
  color: "BLACK" | "WHITE";
  size?: "SMALL" | "LARGE";
}) {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="flex items-center gap-2">
      <span
        className={`${size === "LARGE" ? "text-4xl " : "text-2xl"} font-bold ${
          color === "WHITE" ? "text-white" : "text-black"
        }`}
      >
        {showBalance ? formatCurrency(balance) : "R$ •••••"}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowBalance((s) => !s)}
        className={`text-primary-foreground hover:bg-primary-foreground/10 ${
          color === "WHITE" ? "text-white" : "text-black"
        }`}
      >
        {showBalance ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
