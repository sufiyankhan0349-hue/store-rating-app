import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

const HOME = { admin: "/admin", user: "/stores", owner: "/owner" };

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await api("/auth/login", "POST", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(HOME[data.user.role]);
      window.location.reload(); // refresh navbar
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card auth-box">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <div className="error">{error}</div>}
        <button type="submit">Login</button>
      </form>
      <p>
        New user? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
