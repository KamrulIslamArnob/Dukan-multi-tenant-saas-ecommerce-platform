"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
  variant?: "default" | "muted";
  isLoading?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  variant = "default",
  isLoading = false,
}: StatCardProps) {
  const card = (
    <div
      className={cn(
        "rounded-lg border border-zinc-200 bg-white p-4 shadow-sm",
        variant === "muted" && "bg-zinc-50",
        href && "cursor-pointer hover:shadow-md transition-shadow"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("rounded-md p-2", isLoading ? "bg-zinc-100" : "bg-zinc-100")}>
          <Icon
            className={cn(
              "h-5 w-5",
              isLoading ? "text-zinc-300" : "text-zinc-600"
            )}
          />
        </div>
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          {isLoading ? (
            <p className="text-xl font-semibold text-zinc-300">...</p>
          ) : (
            <p className="text-xl font-semibold text-zinc-900">{value}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }

  return card;
}
