import { useEffect, useState } from "react";
import { api } from "../api";
import Table, { useSort } from "../Table.jsx";

export default function Owner() {
  const [stores, setStores] = useState([]);
  const [message, setMessage] = useState("");
  const { sortBy, order, onSort } = useSort("name");

  useEffect(() => {
    const params = new URLSearchParams({ sortBy, order });
    api("/owner/dashboard?" + params)
      .then(setStores)
      .catch((e) => setMessage(e.message));
  }, [sortBy, order]);

  const columns = [
    { key: "name", label: "User Name" },
    { key: "email", label: "Email" },
    { key: "rating", label: "Rating" },
  ];

  return (
    <div className="container">
      <h2>Store Owner Dashboard</h2>
      {message && <div className="error">{message}</div>}
      {stores.length === 0 && !message && <div className="card">No store is linked to your account yet.</div>}
      {stores.map((store) => (
        <div className="card" key={store.id}>
          <h3>{store.name}</h3>
          <p>{store.address}</p>
          <p>
            <b>Average rating:</b> {store.averageRating ?? "No ratings yet"}
          </p>
          <h4>Users who rated this store</h4>
          <Table columns={columns} rows={store.raters} sortBy={sortBy} order={order} onSort={onSort} />
        </div>
      ))}
    </div>
  );
}
