"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "../hooks";
import { useCategoriesDropdown } from "../hooks";
import { buildColumns } from "./columns";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../types";

export function CategoriesTable() {
  const { data, isLoading, isError } = useCategories();
  const { data: dropdown } = useCategoriesDropdown();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createParent, setCreateParent] = useState("");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const { mutate: createCategory, isPending: isCreating } = useCreateCategory(() => {
    setShowCreate(false);
    setCreateName("");
    setCreateDesc("");
    setCreateParent("");
  });

  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory(() => {
    setEditingCategory(null);
  });

  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory(() => {
    setDeletingCategory(null);
  });

  const columns = buildColumns(
    (cat) => {
      setEditingCategory(cat);
      setEditName(cat.name);
      setEditDesc(cat.description ?? "");
    },
    (cat) => setDeletingCategory(cat),
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getSubRows: (row) => row.subCategories,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    createCategory({
      name: createName.trim(),
      description: createDesc.trim() || null,
      parentCategoryId: createParent || null,
    } satisfies CreateCategoryRequest);
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;
    updateCategory({
      id: editingCategory.id,
      data: { name: editName.trim(), description: editDesc.trim() || null } satisfies UpdateCategoryRequest,
    });
  }

  const parents = (dropdown ?? []).filter((p) => p.id !== editingCategory?.id);

  return (
    <div className="p-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Categories</h1>
        <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-700" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Category
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8 text-center text-sm text-red-500">
                  Failed to load categories.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8 text-center text-sm text-zinc-400">
                  No categories yet. Click &quot;Add Category&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreate(false)}>
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Add Category</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
                <input value={createName} onChange={(e) => setCreateName(e.target.value)} required
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                <input value={createDesc} onChange={(e) => setCreateDesc(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Parent Category</label>
                <select value={createParent} onChange={(e) => setCreateParent(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500">
                  <option value="">None (top-level)</option>
                  {parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)} disabled={isCreating}>Cancel</Button>
                <Button type="submit" disabled={isCreating || !createName.trim()} className="bg-zinc-900 text-white hover:bg-zinc-800">
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingCategory(null)}>
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Edit Category</h2>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} required
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
                <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingCategory(null)} disabled={isUpdating}>Cancel</Button>
                <Button type="submit" disabled={isUpdating || !editName.trim()} className="bg-zinc-900 text-white hover:bg-zinc-800">
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeletingCategory(null)}>
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-zinc-900 mb-2">Delete category</h2>
            <p className="text-sm text-zinc-500 mb-6">
              Are you sure you want to delete &quot;{deletingCategory.name}&quot;? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeletingCategory(null)} disabled={isDeleting}>Cancel</Button>
              <Button className="bg-red-600 text-white hover:bg-red-700" disabled={isDeleting} onClick={() => deleteCategory(deletingCategory.id)}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
