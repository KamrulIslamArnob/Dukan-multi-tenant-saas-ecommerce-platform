import { cn } from "@/lib/utils";

interface CenterLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function CenterLayout({ children, className }: CenterLayoutProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center",
        className
      )}
    >
      {children}
    </div>
  );
}
