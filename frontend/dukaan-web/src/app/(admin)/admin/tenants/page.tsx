"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import type { TenantAdminDto } from "@/modules/admin/types";
import { useAdminTenants } from "@/modules/admin/hooks";
import { DataTable } from "@/components/shared/data-table";
import { CreateTenantModal } from "@/modules/admin/components/create-tenant-modal";

const columnHelper = createColumnHelper<TenantAdminDto>();

const columns = [
  columnHelper.accessor("storeName", { header: "Store Name" }),
  columnHelper.accessor("slug", { header: "Slug", cell: (info) => <span className="text-zinc-500">{info.getValue()}</span> }),
  columnHelper.accessor("merchantEmail", { header: "Merchant Email", cell: (info) => <span className="text-zinc-500">{info.getValue() ?? "\u2014"}</span> }),
  columnHelper.accessor("productCount", { header: "Products", cell: (info) => <span className="text-zinc-600">{info.getValue().toLocaleString()}</span> }),
  columnHelper.accessor("orderCount", { header: "Orders", cell: (info) => <span className="text-zinc-600">{info.getValue().toLocaleString()}</span> }),
  columnHelper.accessor("revenue", { header: "Revenue", cell: (info) => <span className="text-zinc-900">${info.getValue().toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> }),
  columnHelper.accessor("createdAt", { header: "Created", cell: (info) => <span className="text-zinc-500">{new Date(info.getValue()).toLocaleDateString()}</span> }),
];

export default function AdminTenantsPage() {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading, refetch } = useAdminTenants({ pageNumber: page, pageSize: 10 });
  const router = useRouter();

  const handleClose = useCallback(() => {
    setModalOpen(false);
    refetch();
  }, [refetch]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Tenants</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
        >
          <Plus className="h-4 w-4" />
          Create Tenant
        </button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/admin/tenants/${row.id}`)}
        emptyMessage="No tenants found."
      />
      <CreateTenantModal open={modalOpen} onClose={handleClose} />
    </div>
  );
}
