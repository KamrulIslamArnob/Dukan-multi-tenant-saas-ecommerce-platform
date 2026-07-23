"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DetailLayoutProps {
  title: string;
  breadcrumb: BreadcrumbItem[];
  children: React.ReactNode;
  className?: string;
}

export function DetailLayout({
  title,
  breadcrumb,
  children,
  className,
}: DetailLayoutProps) {
  const router = useRouter();

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          &larr; Back
        </button>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-zinc-400">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              {item.href ? (
                <a href={item.href} className="hover:text-zinc-900">
                  {item.label}
                </a>
              ) : (
                <span className="text-zinc-600">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
