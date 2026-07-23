"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import type { AdminOrderSummaryDto, OrderStatus } from "@/modules/admin/types";
import { useAdminOrders } from "@/modules/admin/hooks";
import { DataTable } from "@/components/shared/data-table";

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const columnHelper = createColumnHelper<AdminOrderSummaryDto>();

const columns = [
  columnHelper.accessor("orderNumber", { header: "Order #", cell: (info) => <span className="font-medium">{info.getValue()}</span> }),
  columnHelper.accessor("storeName", { header: "Store", cell: (info) => <span className="text-zinc-500">{info.getValue()}</span> }),
  columnHelper.accessor("customerName", { header: "Customer", cell: (info) => <span className="text-zinc-500">{info.getValue()}</span> }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue();
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
          {status}
        </span>
      );
    },
  }),
  columnHelper.accessor("itemCount", { header: "Items", cell: (info) => <span className="text-zinc-600">{info.getValue()}</span> }),
  columnHelper.accessor("total", { header: "Total", cell: (info) => <span className="text-zinc-900">${info.getValue().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> }),
  columnHelper.accessor("createdAt", { header: "Date", cell: (info) => <span className="text-zinc-500">{new Date(info.getValue()).toLocaleDateString()}</span> }),
];

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminOrders({ pageNumber: page, pageSize: 10 });
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Orders</h1>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/admin/orders/${row.id}`)}
        emptyMessage="No orders found."
      />
    </div>
  );
}
