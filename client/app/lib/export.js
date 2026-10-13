"use client";

// ---------------------------------------------------------------------------
// HotelFlow admin export helpers — CSV download + printable tables.
// Used by the dashboard, bookings and payments pages.
// ---------------------------------------------------------------------------

// Download rows as a CSV file. columns: [{ key, label }].
export function downloadCSV(filename, columns, rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = columns.map((c) => esc(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => esc(typeof c.key === "function" ? c.key(r) : r[c.key])).join(","));
  const blob = new Blob([[head, ...body].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Open a clean print window with a titled table, then trigger printing.
export function printTable(title, columns, rows) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  const th = columns.map((c) => `<th>${c.label}</th>`).join("");
  const tr = rows
    .map(
      (r) =>
        `<tr>${columns
          .map((c) => `<td>${String(typeof c.key === "function" ? c.key(r) : r[c.key] ?? "")}</td>`)
          .join("")}</tr>`
    )
    .join("");
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
<style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{font-size:20px;margin-bottom:4px}p{color:#555;font-size:12px}table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}th,td{border:1px solid #bbb;padding:6px 8px;text-align:left}th{background:#eee}</style>
</head><body><h1>${title}</h1><p>HotelFlow Admin • ${new Date().toLocaleString("en-GB")}</p>
<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>
<script>window.onload=()=>{window.print();}</script></body></html>`);
  w.document.close();
}
