"use client";

import { useAdminStats } from "@/modules/admin/hooks";
import { StatsCards } from "@/modules/admin/components/stats-cards";

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminStats();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
      <StatsCards stats={data} isLoading={isLoading} />
    </div>
  );
}
