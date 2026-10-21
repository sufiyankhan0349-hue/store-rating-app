import { useEffect, useState } from "react";
import { api } from "../api";
import Table, { useSort } from "../Table.jsx";
import { checkName, checkEmail, checkAddress, checkPassword } from "../validate";

function Stats() {
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
  useEffect(() => {
    api("/admin/stats").then(setStats).catch(() => {});
  }, []);
  return (
    <div className="stats">
      <div className="card stat"><h2>{stats.users}</h2>Total Users</div>
      <div className="card stat"><h2>{stats.stores}</h2>Total Stores</div>
      <div className="card stat"><h2>{stats.ratings}</h2>Total Ratings</div>
    </div>
  );
}

function AddUser({ onAdded }) {
  const empty = { name: "", email: "", address: "", password: "", role: "user" };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const problem =
      checkName(form.name) || checkEmail(form.email) || checkAddress(form.address) || checkPassword(form.password);
    if (problem) return setError(problem);
    try {
      const data = await api("/admin/users", "POST", form);
      setSuccess(data.message);
      setForm(empty);
      onAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form className="card" onSubmit={submit}>
      <h3>Add User</h3>
      <div className="row">
        <div><input placeholder="Name (20-60 chars)" value={form.name} onChange={set("name")} /></div>
        <div><input placeholder="Email" value={form.email} onChange={set("email")} /></div>
      </div>
      <div className="row">
        <div><input type="password" placeholder="Password" value={form.password} onChange={set("password")} /></div>
        <div>
          <select value={form.role} onChange={set("role")}>
            <option value="user">Normal User</option>
            <option value="admin">Admin</option>
            <option value="owner">Store Owner</option>
          </select>
        </div>
      </div>
      <textarea placeholder="Address" value={form.address} onChange={set("address")} />
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <button type="submit">Add User</button>
    </form>
  );
}

function AddStore({ owners, onAdded }) {
  const empty = { name: "", email: "", address: "", ownerId: "" };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const problem = checkName(form.name) || checkEmail(form.email) || checkAddress(form.address);
    if (problem) return setError(problem);
    try {
      const data = await api("/admin/stores", "POST", form);
      setSuccess(data.message);
      setForm(empty);
      onAdded();
    } catch (err) {
      setError(err.message);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form className="card" onSubmit={submit}>
      <h3>Add Store</h3>
      <div className="row">
        <div><input placeholder="Store name (20-60 chars)" value={form.name} onChange={set("name")} /></div>
        <div><input placeholder="Store email" value={form.email} onChange={set("email")} /></div>
      </div>
      <select value={form.ownerId} onChange={set("ownerId")}>
        <option value="">No owner</option>
        {owners.map((o) => (
          <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
        ))}
      </select>
      <textarea placeholder="Address" value={form.address} onChange={set("address")} />
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <button type="submit">Add Store</button>
    </form>
  );
}

function UsersList({ refresh }) {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ name: "", email: "", address: "", role: "" });
  const [detail, setDetail] = useState(null);
  const { sortBy, order, onSort } = useSort("name");

  useEffect(() => {
    const params = new URLSearchParams({ ...filters, sortBy, order });
    api("/admin/users?" + params).then(setRows).catch(() => {});
  }, [filters, sortBy, order, refresh]);

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "role", label: "Role" },
    { key: "view", label: "Details", sortable: false },
  ];

  return (
    <div className="card">
      <h3>Users</h3>
      <div className="filters">
        <input placeholder="Filter name" value={filters.name} onChange={set("name")} />
        <input placeholder="Filter email" value={filters.email} onChange={set("email")} />
        <input placeholder="Filter address" value={filters.address} onChange={set("address")} />
        <select value={filters.role} onChange={set("role")}>
          <option value="">All roles</option>
          <option value="user">Normal User</option>
          <option value="admin">Admin</option>
          <option value="owner">Store Owner</option>
        </select>
      </div>
      <Table
        columns={columns}
        rows={rows}
        sortBy={sortBy}
        order={order}
        onSort={onSort}
        renderCell={(row, key) =>
          key === "view" ? (
            <button onClick={() => api("/admin/users/" + row.id).then(setDetail)}>View</button>
          ) : (
            row[key] ?? "-"
          )
        }
      />
      {detail && (
        <div className="card" style={{ marginTop: 16, background: "#eef2f7" }}>
          <h4>User Details</h4>
          <p>Name: {detail.name}</p>
          <p>Email: {detail.email}</p>
          <p>Address: {detail.address}</p>
          <p>Role: {detail.role}</p>
          {detail.role === "owner" && <p>Rating: {detail.rating ?? "No ratings yet"}</p>}
          <button onClick={() => setDetail(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

function StoresList({ refresh }) {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ name: "", email: "", address: "" });
  const { sortBy, order, onSort } = useSort("name");

  useEffect(() => {
    const params = new URLSearchParams({ ...filters, sortBy, order });
    api("/admin/stores?" + params).then(setRows).catch(() => {});
  }, [filters, sortBy, order, refresh]);

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "rating", label: "Rating" },
  ];

  return (
    <div className="card">
      <h3>Stores</h3>
      <div className="filters">
        <input placeholder="Filter name" value={filters.name} onChange={set("name")} />
        <input placeholder="Filter email" value={filters.email} onChange={set("email")} />
        <input placeholder="Filter address" value={filters.address} onChange={set("address")} />
      </div>
      <Table columns={columns} rows={rows} sortBy={sortBy} order={order} onSort={onSort} />
    </div>
  );
}

export default function Admin() {
  const [refresh, setRefresh] = useState(0);
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    api("/admin/users?role=owner").then(setOwners).catch(() => {});
  }, [refresh]);

  const reload = () => setRefresh((n) => n + 1);

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <Stats key={refresh} />
      <AddUser onAdded={reload} />
      <AddStore owners={owners} onAdded={reload} />
      <UsersList refresh={refresh} />
      <StoresList refresh={refresh} />
    </div>
  );
}
