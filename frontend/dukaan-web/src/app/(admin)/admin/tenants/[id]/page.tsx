"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminTenant, useDeleteTenant } from "@/modules/admin/hooks";
import { DetailLayout } from "@/components/shared/detail-layout";
import { EditTenantModal } from "@/modules/admin/components/edit-tenant-modal";
import { ConfirmDeleteModal } from "@/components/shared/confirm-delete-modal";

export default function AdminTenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: tenant, isLoading } = useAdminTenant(id);
  const deleteTenant = useDeleteTenant();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) return <p className="text-sm text-zinc-500">Loading...</p>;
  if (!tenant) return <p className="text-sm text-red-500">Tenant not found.</p>;

  async function handleDelete() {
    try {
      await deleteTenant.mutateAsync(tenant!.id);
      toast.success("Tenant deleted.");
      router.push("/admin/tenants");
    } catch {
      toast.error("Failed to delete tenant. It may have existing orders.");
    }
  }

  return (
    <>
      <DetailLayout
        title={tenant.storeName}
        breadcrumb={[{ label: "Tenants", href: "/admin/tenants" }, { label: tenant.storeName }]}
      >
        <div className="mb-4 flex justify-end gap-2">
          <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50">
            <Pencil className="h-4 w-4" />Edit
          </button>
          <button onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />Delete
          </button>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><dt className="text-sm text-zinc-500">Slug</dt><dd className="text-sm text-zinc-900">{tenant.slug}</dd></div>
          <div><dt className="text-sm text-zinc-500">Category</dt><dd className="text-sm text-zinc-900">{tenant.category || "\u2014"}</dd></div>
          <div><dt className="text-sm text-zinc-500">Country</dt><dd className="text-sm text-zinc-900">{tenant.country || "\u2014"}</dd></div>
          <div><dt className="text-sm text-zinc-500">Currency</dt><dd className="text-sm text-zinc-900">{tenant.currency || "\u2014"}</dd></div>
          <div><dt className="text-sm text-zinc-500">Merchant Email</dt><dd className="text-sm text-zinc-900">{tenant.merchantEmail ?? "\u2014"}</dd></div>
          <div><dt className="text-sm text-zinc-500">Products</dt><dd className="text-sm text-zinc-900">{tenant.productCount.toLocaleString()}</dd></div>
          <div><dt className="text-sm text-zinc-500">Orders</dt><dd className="text-sm text-zinc-900">{tenant.orderCount.toLocaleString()}</dd></div>
          <div><dt className="text-sm text-zinc-500">Revenue</dt><dd className="text-sm text-zinc-900">${tenant.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</dd></div>
          <div><dt className="text-sm text-zinc-500">Created</dt><dd className="text-sm text-zinc-900">{new Date(tenant.createdAt).toLocaleDateString()}</dd></div>
        </dl>
      </DetailLayout>
      <EditTenantModal open={editOpen} onClose={() => setEditOpen(false)} tenantId={tenant.id} storeName={tenant.storeName} slug={tenant.slug} category={tenant.category || ""} country={tenant.country || ""} currency={tenant.currency || ""} />
      <ConfirmDeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} isPending={deleteTenant.isPending} title="Delete Tenant" message={`Delete "${tenant.storeName}"? This cannot be undone.`} />
    </>
  );
}
