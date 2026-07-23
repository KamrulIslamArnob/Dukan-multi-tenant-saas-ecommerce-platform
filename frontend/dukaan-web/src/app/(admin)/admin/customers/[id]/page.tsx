"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminCustomer, useDeleteCustomer } from "@/modules/admin/hooks";
import { DetailLayout } from "@/components/shared/detail-layout";
import { EditCustomerModal } from "@/modules/admin/components/edit-customer-modal";
import { ConfirmDeleteModal } from "@/components/shared/confirm-delete-modal";

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: customer, isLoading } = useAdminCustomer(id);
  const deleteCustomer = useDeleteCustomer();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) return <p className="text-sm text-zinc-500">Loading...</p>;
  if (!customer) return <p className="text-sm text-red-500">Customer not found.</p>;

  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "\u2014";

  async function handleDelete() {
    try {
      await deleteCustomer.mutateAsync(customer!.id);
      toast.success("Customer deleted.");
      router.push("/admin/customers");
    } catch {
      toast.error("Failed to delete customer.");
    }
  }

  return (
    <>
      <DetailLayout title={fullName} breadcrumb={[{ label: "Customers", href: "/admin/customers" }, { label: fullName }]}>
        <div className="mb-4 flex justify-end gap-2">
          <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50">
            <Pencil className="h-4 w-4" />Edit
          </button>
          <button onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />Delete
          </button>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><dt className="text-sm text-zinc-500">Email</dt><dd className="text-sm text-zinc-900">{customer.email}</dd></div>
          <div><dt className="text-sm text-zinc-500">Store</dt><dd className="text-sm text-zinc-900">{customer.storeSlug}</dd></div>
          <div><dt className="text-sm text-zinc-500">Orders</dt><dd className="text-sm text-zinc-900">{customer.orderCount.toLocaleString()}</dd></div>
          <div><dt className="text-sm text-zinc-500">Total Spent</dt><dd className="text-sm text-zinc-900">${customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</dd></div>
          <div><dt className="text-sm text-zinc-500">Registered</dt><dd className="text-sm text-zinc-900">{new Date(customer.registeredAt).toLocaleDateString()}</dd></div>
        </dl>
      </DetailLayout>
      <EditCustomerModal open={editOpen} onClose={() => setEditOpen(false)} userId={customer.id} firstName={customer.firstName ?? ""} lastName={customer.lastName ?? ""} />
      <ConfirmDeleteModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} isPending={deleteCustomer.isPending} title="Delete Customer" message={`Delete ${fullName} (${customer.email})?`} />
    </>
  );
}
