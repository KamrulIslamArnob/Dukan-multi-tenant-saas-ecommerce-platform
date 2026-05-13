"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface PaginatedData<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: PaginatedData<T> | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  page,
  onPageChange,
  onRowClick,
  emptyMessage = "No data found.",
}: DataTableProps<T>) {
  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = data?.totalPages ?? 1;
  const hasPrev = data?.hasPreviousPage ?? false;
  const hasNext = data?.hasNextPage ?? false;
  const colCount = columns.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-zinc-200 bg-zinc-50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-2 text-left text-xs font-medium text-zinc-500 uppercase tracking-wide"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-zinc-100 last:border-0">
                    {Array.from({ length: colCount }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-zinc-100 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-8 text-center text-sm text-zinc-400">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-zinc-100 last:border-0 transition-colors",
                      onRowClick && "cursor-pointer hover:bg-zinc-50"
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-zinc-900">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">
          {data ? `${data.totalCount} total` : ""}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrev}
            className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-zinc-50"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext}
            className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-zinc-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
