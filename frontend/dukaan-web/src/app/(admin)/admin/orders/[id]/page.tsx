"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAdminOrder, useCancelOrder } from "@/modules/admin/hooks";
import type { OrderStatus } from "@/modules/admin/types";
import { DetailLayout } from "@/components/shared/detail-layout";
import { ConfirmDeleteModal } from "@/components/shared/confirm-delete-modal";

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useAdminOrder(id);
  const cancelOrder = useCancelOrder();
  const [cancelOpen, setCancelOpen] = useState(false);

  if (isLoading) return <p className="text-sm text-zinc-500">Loading...</p>;
  if (!order) return <p className="text-sm text-red-500">Order not found.</p>;

  async function handleCancel() {
    try {
      await cancelOrder.mutateAsync(order!.id);
      toast.success("Order cancelled.");
      setCancelOpen(false);
    } catch {
      toast.error("Failed to cancel order.");
    }
  }

  return (
    <>
      <DetailLayout title={order.orderNumber} breadcrumb={[{ label: "Orders", href: "/admin/orders" }, { label: order.orderNumber }]}>
        <div className="mb-4 flex items-center justify-between">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
          {order.status !== "Cancelled" && (
            <button onClick={() => setCancelOpen(true)} className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
              <XCircle className="h-4 w-4" />Cancel Order
            </button>
          )}
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><dt className="text-sm text-zinc-500">Store</dt><dd className="text-sm text-zinc-900">{order.storeName}</dd></div>
          <div><dt className="text-sm text-zinc-500">Customer</dt><dd className="text-sm text-zinc-900">{order.customerName}</dd></div>
          <div><dt className="text-sm text-zinc-500">Items</dt><dd className="text-sm text-zinc-900">{order.itemCount}</dd></div>
          <div><dt className="text-sm text-zinc-500">Total</dt><dd className="text-sm text-zinc-900">${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</dd></div>
          <div><dt className="text-sm text-zinc-500">Date</dt><dd className="text-sm text-zinc-900">{new Date(order.createdAt).toLocaleDateString()}</dd></div>
        </dl>
      </DetailLayout>
      <ConfirmDeleteModal open={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={handleCancel} isPending={cancelOrder.isPending} title="Cancel Order" message={`Cancel order ${order.orderNumber}? This cannot be undone.`} />
    </>
  );
}
