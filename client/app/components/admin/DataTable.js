"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin DataTable — searchable, sortable, paginated table with
// CSV export (Download) and Print (Printer) buttons.
// columns: [{ key, label, render?, sortable?, export? }]
// ---------------------------------------------------------------------------

import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Download, Printer, ArrowUpDown } from "lucide-react";
import { downloadCSV, printTable } from "../../lib/export";
import { EmptyState } from "./Skeleton";

export default function DataTable({
  columns,
  rows = [],
  loading = false,
  searchable = true,
  searchKeys = [],
  searchPlaceholder = "Search…",
  pageSize = 8,
  exportName = "export",
  printTitle = "Report",
  emptyTitle = "No records found",
  emptyHint = "Try changing your search or filters.",
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(1);
  const [page, setPage] = useState(1);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchKeys.length) return rows;
    return rows.filter((r) =>
      searchKeys.some((k) => String(typeof k === "function" ? k(r) : r[k] ?? "").toLowerCase().includes(q))
    );
  }, [rows, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return searched;
    return [...searched].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sortDir;
      return String(av).localeCompare(String(bv)) * sortDir;
    });
  }, [searched, sortKey, sortDir]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (col) => {
    if (!col.sortable) return;
    if (sortKey === col.key) setSortDir((d) => -d);
    else {
      setSortKey(col.key);
      setSortDir(1);
    }
    setPage(1);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Toolbar: search + export + print */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-4 dark:border-slate-700">
        {searchable && (
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              aria-label="Search table"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-[13px] font-medium outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
        )}
        <span className="text-[12.5px] font-semibold text-slate-500 dark:text-slate-400">
          {sorted.length} record{sorted.length === 1 ? "" : "s"}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => downloadCSV(exportName, columns, sorted)}
          aria-label="Export to CSV"
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[12.5px] font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <Download className="h-4 w-4" /> CSV
        </button>
        <button
          type="button"
          onClick={() => printTable(printTitle, columns, sorted)}
          aria-label="Print table"
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[12.5px] font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11.5px] uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-700/30 dark:text-slate-400">
              {columns.map((c) => (
                <th key={c.label} className="whitespace-nowrap px-4 py-3 font-bold">
                  {c.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c)}
                      className="inline-flex items-center gap-1 transition hover:text-slate-800 dark:hover:text-slate-100"
                    >
                      {c.label}
                      <ArrowUpDown className={`h-3.5 w-3.5 ${sortKey === c.key ? "text-[#2563EB]" : "opacity-40"}`} />
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-slate-100 last:border-0 dark:border-slate-700">
                  {columns.map((c, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div className="h-3.5 rounded bg-slate-100 dark:bg-slate-700" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              pageRows.map((r, i) => (
                <tr key={r.id || i} className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70 dark:border-slate-700 dark:hover:bg-slate-700/40">
                  {columns.map((c) => (
                    <td key={c.label} className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                      {c.render ? c.render(r) : String(r[c.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && pageRows.length === 0 && (
        <div className="p-4">
          <EmptyState title={emptyTitle} hint={emptyHint} />
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-700">
          <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
            Page {safePage} of {pages}
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              aria-label="Previous page"
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={safePage >= pages}
              onClick={() => setPage(safePage + 1)}
              aria-label="Next page"
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
