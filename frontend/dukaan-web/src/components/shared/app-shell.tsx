import { cn } from "@/lib/utils";

interface AppShellProps {
  sideNav: React.ReactNode;
  children: React.ReactNode;
  /** 0 = no padding (dashboard), 4 = p-4 (forms), 6 = p-6 (tables) */
  contentPadding?: 0 | 4 | 6;
}

const paddingMap: Record<number, string> = {
  0: "",
  4: "p-4",
  6: "p-6",
};

export function AppShell({ sideNav, children, contentPadding = 6 }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-zinc-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>
      {sideNav}
      <main
        id="admin-main-content"
        className={cn("flex-1 lg:ml-60", paddingMap[contentPadding])}
      >
        {children}
      </main>
    </div>
  );
}
