"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import type { CustomerAdminDto } from "@/modules/admin/types";
import { useAdminCustomers, useAdminTenants } from "@/modules/admin/hooks";
import { DataTable } from "@/components/shared/data-table";
import { CreateCustomerModal } from "@/modules/admin/components/create-customer-modal";

const columnHelper = createColumnHelper<CustomerAdminDto>();

const columns = [
  columnHelper.accessor(
    (row) => [row.firstName, row.lastName].filter(Boolean).join(" ") || "\u2014",
    { id: "name", header: "Name" }
  ),
  columnHelper.accessor("email", { header: "Email", cell: (info) => <span className="text-zinc-500">{info.getValue()}</span> }),
  columnHelper.accessor("storeSlug", { header: "Store", cell: (info) => <span className="text-zinc-500">{info.getValue()}</span> }),
  columnHelper.accessor("orderCount", { header: "Orders", cell: (info) => <span className="text-zinc-600">{info.getValue().toLocaleString()}</span> }),
  columnHelper.accessor("totalSpent", { header: "Spent", cell: (info) => <span className="text-zinc-900">${info.getValue().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> }),
  columnHelper.accessor("registeredAt", { header: "Registered", cell: (info) => <span className="text-zinc-500">{new Date(info.getValue()).toLocaleDateString()}</span> }),
];

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useAdminCustomers({ pageNumber: page, pageSize: 10 });
  const { data: tenantData } = useAdminTenants({ pageNumber: 1, pageSize: 100 });
  const router = useRouter();

  const tenants = useMemo(
    () => (tenantData?.items ?? []).map((t) => ({ id: t.id, storeName: t.storeName })),
    [tenantData]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Customers</h1>
        <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800">
          <Plus className="h-4 w-4" />Create Customer
        </button>
      </div>
      <DataTable columns={columns} data={data} isLoading={isLoading} page={page} onPageChange={setPage} onRowClick={(row) => router.push(`/admin/customers/${row.id}`)} emptyMessage="No customers found." />
      <CreateCustomerModal open={createOpen} onClose={() => setCreateOpen(false)} tenants={tenants} />
    </div>
  );
}
