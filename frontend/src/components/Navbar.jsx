import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{ padding: "10px", background: "#f8f9fa", borderBottom: "1px solid #ddd" }}>
      <Link to="/" style={{ marginRight: "10px" }}>Home</Link>
      
      {!user ? (
        <>
          <Link to="/login" style={{ marginRight: "10px" }}>Login</Link>
          <Link to="/register" style={{ marginRight: "10px" }}>Register</Link>
        </>
      ) : (
        <>
          <Link to="/dashboard" style={{ marginRight: "10px" }}>Dashboard</Link>
          <Link to="/heatmap" style={{ marginRight: "10px" }}>Heatmap</Link>
          <button onClick={logout} style={{ marginLeft: "10px" }}>Logout</button>
        </>
      )}
    </nav>
  );
}

export default Navbar;
