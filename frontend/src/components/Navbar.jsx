import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 1000,
        margin: 0,
      }}
    >
      {/* Left Side - Logo & Branding */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none",
          color: "white",
          fontWeight: "bold",
          fontSize: "1.4rem",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.9";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      >
        <span style={{ fontSize: "1.8rem" }}>🌡️</span>
        <span>Urban Heat Map</span>
      </Link>

      {/* Center - Navigation Links */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "white",
            fontWeight: location.pathname === "/" ? "bold" : "500",
            fontSize: "1rem",
            padding: "8px 16px",
            borderRadius: "6px",
            background:
              location.pathname === "/"
                ? "rgba(255,255,255,0.2)"
                : "transparent",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            if (location.pathname !== "/") {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== "/") {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          Home
        </Link>

        {user && (
          <Link
            to="/dashboard"
            style={{
              textDecoration: "none",
              color: "white",
              fontWeight: location.pathname === "/dashboard" ? "bold" : "500",
              fontSize: "1rem",
              padding: "8px 16px",
              borderRadius: "6px",
              background:
                location.pathname === "/dashboard"
                  ? "rgba(255,255,255,0.2)"
                  : "transparent",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== "/dashboard") {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== "/dashboard") {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            📊 Dashboard
          </Link>
        )}
      </div>

      {/* Right Side - User Info & Logout */}
      {user ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "white",
              fontSize: "0.95rem",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>👤</span>
            <span style={{ fontWeight: "500" }}>
              {user.username || user.email?.split("@")[0]}
            </span>
          </div>
          <button
            onClick={logout}
            style={{
              padding: "10px 20px",
              background: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.95rem",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            🚪 Logout
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "white",
            fontSize: "0.9rem",
            fontStyle: "italic",
            opacity: 0.9,
          }}
        >
          <span>🌍</span>
          <span>Explore Environmental Data</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
