import { cn } from "@/lib/utils";

interface PageLayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function PageLayout({ header, children, footer, className }: PageLayoutProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {header && (
        <header className="border-b border-zinc-200 pb-4">{header}</header>
      )}
      <main className="flex-1 overflow-auto">{children}</main>
      {footer && (
        <footer className="border-t border-zinc-200 pt-4">{footer}</footer>
      )}
    </div>
  );
}
