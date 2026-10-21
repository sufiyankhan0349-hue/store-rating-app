import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "./api";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Password from "./pages/Password.jsx";
import Admin from "./pages/Admin.jsx";
import UserStores from "./pages/UserStores.jsx";
import Owner from "./pages/Owner.jsx";

const HOME = { admin: "/admin", user: "/stores", owner: "/owner" };

// Only lets the right role open a page
function Protected({ role, children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to={HOME[user.role]} />;
  return children;
}

function Navbar() {
  const user = getUser();
  const navigate = useNavigate();
  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav>
      <div>
        <Link to={HOME[user.role]}>Home</Link>
        <Link to="/password">Change Password</Link>
      </div>
      <div>
        {user.name} ({user.role}) <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default function App() {
  const user = getUser();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to={user ? HOME[user.role] : "/login"} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/password" element={user ? <Password /> : <Navigate to="/login" />} />
        <Route path="/admin" element={<Protected role="admin"><Admin /></Protected>} />
        <Route path="/stores" element={<Protected role="user"><UserStores /></Protected>} />
        <Route path="/owner" element={<Protected role="owner"><Owner /></Protected>} />
      </Routes>
    </>
  );
}
