import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { checkName, checkEmail, checkAddress, checkPassword } from "../validate";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", address: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {
      name: checkName(form.name),
      email: checkEmail(form.email),
      address: checkAddress(form.address),
      password: checkPassword(form.password),
    };
    setErrors(found);
    if (Object.values(found).some((m) => m)) return;

    try {
      await api("/auth/signup", "POST", form);
      navigate("/login");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const field = (key, label, type = "text") => (
    <>
      <input
        type={type}
        placeholder={label}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
      {errors[key] && <div className="error">{errors[key]}</div>}
    </>
  );

  return (
    <div className="card auth-box">
      <h2>Sign up</h2>
      <form onSubmit={handleSubmit}>
        {field("name", "Full name (20-60 characters)")}
        {field("email", "Email")}
        <textarea
          placeholder="Address (max 400 characters)"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        {errors.address && <div className="error">{errors.address}</div>}
        {field("password", "Password (8-16, 1 uppercase, 1 special)", "password")}
        {message && <div className="error">{message}</div>}
        <button type="submit">Create account</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
