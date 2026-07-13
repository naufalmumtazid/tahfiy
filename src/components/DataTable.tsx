"use client";

import React, { useState } from "react";
import Select from "react-select";
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getSortedRowModel, 
  getPaginationRowModel,
  flexRender, 
  ColumnDef,
  SortingState
} from "@tanstack/react-table";
import { 
  FiSearch, 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronsLeft, 
  FiChevronsRight,
  FiArrowUp,
  FiArrowDown
} from "react-icons/fi";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  placeholderSearch?: string;
  renderTopActions?: () => React.ReactNode;
  loading?: boolean;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  placeholderSearch = "Cari data...",
  renderTopActions,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10, // Default baris per halaman
      },
    },
  });

  return (
    <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 overflow-hidden">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={placeholderSearch}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm bg-gray-50/50"
          />
        </div>
        {renderTopActions && <div className="flex gap-2">{renderTopActions()}</div>}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-blue-50 text-left text-gray-400 font-medium">
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <th key={header.id} className="py-4 px-4 text-xs uppercase tracking-wider">
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-1 ${
                            isSortable ? "cursor-pointer select-none hover:text-gray-700" : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {isSortable && (
                            <span className="text-gray-400 shrink-0">
                              {sortDirection === "asc" && <FiArrowUp className="w-3.5 h-3.5 text-blue-600" />}
                              {sortDirection === "desc" && <FiArrowDown className="w-3.5 h-3.5 text-blue-600" />}
                              {!sortDirection && (
                                <div className="flex flex-col opacity-30 group-hover:opacity-100 scale-75">
                                  <FiArrowUp className="w-2.5 h-2.5 -mb-1" />
                                  <FiArrowDown className="w-2.5 h-2.5" />
                                </div>
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-blue-50/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: columns.length }).map((_, j) => (
                    <td key={j} className="py-4 px-4">
                      <div className={`h-4 bg-gray-100 rounded ${j === 1 ? "w-40" : "w-12"}`} />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-gray-400">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/20 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-4 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && table.getPageCount() > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-blue-50/50 text-gray-500 text-xs font-medium">
          <div className="flex items-center gap-2 min-w-[220px]">
            <span>Tampilkan</span>
            <div className="w-32">
              <Select
                options={[5, 10, 20, 50].map((size) => ({ value: size, label: `${size} Data` }))}
                value={{ value: table.getState().pagination.pageSize, label: `${table.getState().pagination.pageSize} Data` }}
                onChange={(option) => table.setPageSize(option?.value ?? 5)}
                isSearchable={false}
                classNamePrefix="react-select"
              />
            </div>
            <span className="text-gray-400 ml-2">
              Menampilkan {table.getRowModel().rows.length} dari {data.length} entri
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <FiChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl">
              Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
            </span>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <FiChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}