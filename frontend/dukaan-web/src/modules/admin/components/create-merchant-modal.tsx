"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { useCreateMerchant } from "../hooks";
import type { CreateMerchantDto } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  tenants: { id: string; storeName: string }[];
}

export function CreateMerchantModal({ open, onClose, tenants }: Props) {
  const createMerchant = useCreateMerchant();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateMerchantDto>({
    defaultValues: { email: "", password: "", tenantId: "" },
  });

  useEffect(() => { if (open) reset(); }, [open, reset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  async function onSubmit(data: CreateMerchantDto) {
    try {
      await createMerchant.mutateAsync(data);
      toast.success("Merchant created.");
      onClose();
    } catch {
      toast.error("Failed to create merchant.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Create Merchant</h2>
          <button onClick={onClose} className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input {...register("email", { required: "Email is required." })} type="email" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input {...register("password", { required: "Password is required.", minLength: { value: 6, message: "Min 6 characters" } })} type="password" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Tenant</label>
            <select {...register("tenantId", { required: "Tenant is required." })} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500">
              <option value="">Select tenant...</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.storeName}</option>)}
            </select>
            {errors.tenantId && <p className="mt-1 text-xs text-red-500">{errors.tenantId.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">Cancel</button>
            <button type="submit" disabled={createMerchant.isPending} className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"><Plus className="h-4 w-4" />{createMerchant.isPending ? "Creating..." : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
