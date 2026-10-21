import { useState } from "react";
import { api } from "../api";
import { checkPassword } from "../validate";

export default function Password() {
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const problem = checkPassword(newPassword);
    if (problem) return setError(problem);
    try {
      const data = await api("/auth/password", "PUT", { oldPassword, newPassword });
      setSuccess(data.message);
      setOld("");
      setNew("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card auth-box">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <input type="password" placeholder="Old password" value={oldPassword} onChange={(e) => setOld(e.target.value)} />
        <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNew(e.target.value)} />
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <button type="submit">Update</button>
      </form>
    </div>
  );
}
