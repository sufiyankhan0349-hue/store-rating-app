import { useEffect, useState } from "react";
import { api } from "../api";
import Table, { useSort } from "../Table.jsx";

export default function UserStores() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState({ name: "", address: "" });
  const [message, setMessage] = useState("");
  const [reload, setReload] = useState(0);
  const { sortBy, order, onSort } = useSort("name");

  useEffect(() => {
    const params = new URLSearchParams({ ...search, sortBy, order });
    api("/stores?" + params).then(setRows).catch((e) => setMessage(e.message));
  }, [search, sortBy, order, reload]);

  const rate = async (storeId, value) => {
    setMessage("");
    try {
      await api(`/stores/${storeId}/rating`, "POST", { rating: Number(value) });
      setReload((n) => n + 1);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const columns = [
    { key: "name", label: "Store Name" },
    { key: "address", label: "Address" },
    { key: "overallRating", label: "Overall Rating" },
    { key: "myRating", label: "Your Rating", sortable: false },
    { key: "action", label: "Submit / Modify Rating", sortable: false },
  ];

  return (
    <div className="container">
      <h2>All Stores</h2>
      <div className="card">
        <div className="filters">
          <input
            placeholder="Search by name"
            value={search.name}
            onChange={(e) => setSearch({ ...search, name: e.target.value })}
          />
          <input
            placeholder="Search by address"
            value={search.address}
            onChange={(e) => setSearch({ ...search, address: e.target.value })}
          />
        </div>
        {message && <div className="error">{message}</div>}
        <Table
          columns={columns}
          rows={rows}
          sortBy={sortBy}
          order={order}
          onSort={onSort}
          renderCell={(row, key) => {
            if (key === "action") {
              return (
                <select value={row.myRating || ""} onChange={(e) => rate(row.id, e.target.value)}>
                  <option value="" disabled>Rate (1-5)</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              );
            }
            if (key === "myRating") return row.myRating ?? "Not rated";
            return row[key] ?? "-";
          }}
        />
      </div>
    </div>
  );
}
