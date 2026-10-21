import { useState } from "react";

// Reusable sortable table.
// columns: [{ key, label, sortable }]  rows: array of objects
export default function Table({ columns, rows, sortBy, order, onSort, renderCell }) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} onClick={() => c.sortable !== false && onSort && onSort(c.key)}>
              {c.label}
              {sortBy === c.key ? (order === "asc" ? " ▲" : " ▼") : ""}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={columns.length}>No records found</td>
          </tr>
        )}
        {rows.map((row, i) => (
          <tr key={row.id || i}>
            {columns.map((c) => (
              <td key={c.key}>
                {renderCell ? renderCell(row, c.key) : row[c.key] ?? "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Small hook to keep sort state
export function useSort(defaultKey) {
  const [sortBy, setSortBy] = useState(defaultKey);
  const [order, setOrder] = useState("asc");
  const onSort = (key) => {
    if (key === sortBy) setOrder(order === "asc" ? "desc" : "asc");
    else {
      setSortBy(key);
      setOrder("asc");
    }
  };
  return { sortBy, order, onSort };
}
