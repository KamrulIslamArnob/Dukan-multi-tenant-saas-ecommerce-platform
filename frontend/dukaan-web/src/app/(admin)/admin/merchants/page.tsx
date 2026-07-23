"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createColumnHelper } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import type { MerchantAdminDto } from "@/modules/admin/types";
import { useAdminMerchants, useAdminTenants } from "@/modules/admin/hooks";
import { DataTable } from "@/components/shared/data-table";
import { CreateMerchantModal } from "@/modules/admin/components/create-merchant-modal";

const columnHelper = createColumnHelper<MerchantAdminDto>();

const columns = [
  columnHelper.accessor("email", { header: "Email" }),
  columnHelper.accessor("storeName", { header: "Store", cell: (info) => <span className="text-zinc-500">{info.getValue()}</span> }),
  columnHelper.accessor("slug", { header: "Slug", cell: (info) => <span className="text-zinc-500">{info.getValue()}</span> }),
  columnHelper.accessor("productCount", { header: "Products", cell: (info) => <span className="text-zinc-600">{info.getValue().toLocaleString()}</span> }),
  columnHelper.accessor("orderCount", { header: "Orders", cell: (info) => <span className="text-zinc-600">{info.getValue().toLocaleString()}</span> }),
  columnHelper.accessor("registeredAt", { header: "Registered", cell: (info) => <span className="text-zinc-500">{new Date(info.getValue()).toLocaleDateString()}</span> }),
];

export default function AdminMerchantsPage() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useAdminMerchants({ pageNumber: page, pageSize: 10 });
  const { data: tenantData } = useAdminTenants({ pageNumber: 1, pageSize: 100 });
  const router = useRouter();

  const tenants = useMemo(
    () => (tenantData?.items ?? []).map((t) => ({ id: t.id, storeName: t.storeName })),
    [tenantData]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Merchants</h1>
        <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800">
          <Plus className="h-4 w-4" />Create Merchant
        </button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/admin/merchants/${row.id}`)}
        emptyMessage="No merchants found."
      />
      <CreateMerchantModal open={createOpen} onClose={() => setCreateOpen(false)} tenants={tenants} />
    </div>
  );
}
