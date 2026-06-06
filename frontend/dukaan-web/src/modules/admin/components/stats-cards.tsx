"use client";

import {
  Store,
  Briefcase,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AdminStatsDto } from "../types";
import { StatCard } from "@/components/shared/stat-card";

interface StatsCardsProps {
  stats: AdminStatsDto | undefined;
  isLoading: boolean;
}

interface StatCardDef {
  key: keyof AdminStatsDto;
  label: string;
  icon: LucideIcon;
  href?: string;
  isCurrency?: boolean;
}

const CARDS: StatCardDef[] = [
  { key: "totalTenants", label: "Tenants", icon: Store, href: "/admin/tenants" },
  { key: "totalMerchants", label: "Merchants", icon: Briefcase, href: "/admin/merchants" },
  { key: "totalCustomers", label: "Customers", icon: Users, href: "/admin/customers" },
  { key: "totalProducts", label: "Products", icon: Package },
  { key: "totalOrders", label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { key: "totalRevenue", label: "Revenue", icon: DollarSign, isCurrency: true },
];

function formatValue(value: number, isCurrency?: boolean): string {
  if (isCurrency) {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  }
  return value.toLocaleString();
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {CARDS.map((card) => (
        <StatCard
          key={card.key}
          label={card.label}
          value={stats ? formatValue(stats[card.key] as number, card.isCurrency) : "0"}
          icon={card.icon}
          href={card.href}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
