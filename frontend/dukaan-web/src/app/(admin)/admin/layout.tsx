"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/modules/admin/components/admin-sidebar";
import { AppShell } from "@/components/shared/app-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      if (pathname !== "/admin/login") router.push("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!authorized) return null;

  return (
    <AppShell sideNav={<AdminSidebar />} contentPadding={6}>
      {children}
    </AppShell>
  );
}
