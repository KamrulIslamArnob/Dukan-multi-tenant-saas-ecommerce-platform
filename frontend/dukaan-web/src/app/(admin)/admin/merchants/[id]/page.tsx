"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminMerchant, useDeleteMerchant } from "@/modules/admin/hooks";
import { DetailLayout } from "@/components/shared/detail-layout";
import { EditMerchantModal } from "@/modules/admin/components/edit-merchant-modal";
import { ConfirmDeleteModal } from "@/components/shared/confirm-delete-modal";

export default function AdminMerchantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: merchant, isLoading } = useAdminMerchant(id);
  const deleteMerchant = useDeleteMerchant();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) return <p className="text-sm text-zinc-500">Loading...</p>;
  if (!merchant) return <p className="text-sm text-red-500">Merchant not found.</p>;

  async function handleDelete() {
    try {
      await deleteMerchant.mutateAsync(merchant!.id);
      toast.success("Merchant deleted.");
      router.push("/admin/merchants");
    } catch {
      toast.error("Failed to delete merchant.");
    }
  }

  return (
    <>
      <DetailLayout title={merchant.email} breadcrumb={[{ label: "Merchants", href: "/admin/merchants" }, { label: merchant.email }]}>
        <div className="mb-4 flex justify-end gap-2">
          <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50">
            <Pencil className="h-4 w-4" />Edit
          </button>
          <button onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />Delete
          </button>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><dt className="text-sm text-zinc-500">Store Name</dt><dd className="text-sm text-zinc-900">{merchant.storeName}</dd></div>
          <div><dt className="text-sm text-zinc-500">Slug</dt><dd className="text-sm text-zinc-900">{merchant.slug}</dd></div>
          <div><dt className="text-sm text-zinc-500">Products</dt><dd className="text-sm text-zinc-900">{merchant.productCount.toLocaleString()}</dd></div>
          <div><dt className="text-sm text-zinc-500">Orders</dt><dd className="text-sm text-zinc-900">{merchant.orderCount.toLocaleString()}</dd></div>
          <div><dt className="text-sm text-zinc-500">Registered</dt><dd className="text-sm text-zinc-900">{new Date(merchant.registeredAt).toLocaleDateString()}</dd></div>
        </dl>
      </DetailLayout>
      <EditMerchantModal open={editOpen} onClose={() => setEditOpen(false)} userId={merchant.id} storeName={merchant.storeName} slug={merchant.slug} />
      <ConfirmDeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} isPending={deleteMerchant.isPending} title="Delete Merchant" message={`Delete ${merchant.email}? Their store tenant will remain.`} />
    </>
  );
}
