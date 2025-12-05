import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        display: "flex",
        gap: "16px",
        padding: "10px 20px",
        background: "#f8f9fa",
        borderBottom: "1px solid #ddd",
        alignItems: "center",
      }}
    >
      <Link to="/">Home</Link>

      {!user ? (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      ) : (
        <>
          <Link to="/dashboard">HeatMap Dashboard</Link>
          <button onClick={logout} style={{ marginLeft: "auto" }}>
            Logout
          </button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
