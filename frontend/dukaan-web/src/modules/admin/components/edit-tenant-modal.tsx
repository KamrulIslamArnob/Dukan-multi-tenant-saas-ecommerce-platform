"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { useUpdateTenant } from "../hooks";
import type { UpdateTenantDto } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  storeName: string;
  slug: string;
  category: string;
  country: string;
  currency: string;
}

export function EditTenantModal({ open, onClose, tenantId, storeName, slug, category, country, currency }: Props) {
  const updateTenant = useUpdateTenant();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateTenantDto>({
    defaultValues: { tenantId, storeName, slug, category, country, currency },
  });

  useEffect(() => {
    if (open) reset({ tenantId, storeName, slug, category, country, currency });
  }, [open, tenantId, storeName, slug, category, country, currency, reset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  async function onSubmit(data: UpdateTenantDto) {
    try {
      await updateTenant.mutateAsync(data);
      toast.success(`Tenant "${data.storeName}" updated.`);
      onClose();
    } catch {
      toast.error("Failed to update. Slug may already be taken.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Edit Tenant</h2>
          <button onClick={onClose} className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input type="hidden" {...register("tenantId")} />

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Store Name</label>
            <input
              {...register("storeName", { required: "Store name is required." })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-none"
            />
            {errors.storeName && <p className="mt-1 text-xs text-red-500">{errors.storeName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Slug</label>
            <input
              {...register("slug", { required: "Slug is required." })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-none"
            />
            {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
            <input
              {...register("category")}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Country</label>
              <input
                {...register("country")}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-none"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Currency</label>
              <input
                {...register("currency")}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 outline-none"
                maxLength={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateTenant.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {updateTenant.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
