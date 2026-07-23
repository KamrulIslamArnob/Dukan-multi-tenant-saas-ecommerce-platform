"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import { useUpdateCustomer } from "../hooks";
import type { UpdateCustomerDto } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  firstName: string;
  lastName: string;
}

export function EditCustomerModal({ open, onClose, userId, firstName, lastName }: Props) {
  const updateCustomer = useUpdateCustomer();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateCustomerDto>({
    defaultValues: { userId, firstName, lastName },
  });

  useEffect(() => { if (open) reset({ userId, firstName, lastName }); }, [open, userId, firstName, lastName, reset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  async function onSubmit(data: UpdateCustomerDto) {
    try {
      await updateCustomer.mutateAsync(data);
      toast.success("Customer updated.");
      onClose();
    } catch {
      toast.error("Failed to update customer.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Edit Customer</h2>
          <button onClick={onClose} className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input type="hidden" {...register("userId")} />
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">First Name</label>
            <input {...register("firstName", { required: "First name is required." })} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" />
            {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Last Name</label>
            <input {...register("lastName", { required: "Last name is required." })} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" />
            {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50">Cancel</button>
            <button type="submit" disabled={updateCustomer.isPending} className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"><Save className="h-4 w-4" />{updateCustomer.isPending ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
