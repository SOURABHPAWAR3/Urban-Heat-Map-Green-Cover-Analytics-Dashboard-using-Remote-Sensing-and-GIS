import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Please try again!");
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          padding: "50px 40px",
          width: "100%",
          maxWidth: "450px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              fontSize: "4rem",
              marginBottom: "15px",
            }}
          >
            🔐
          </div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "10px",
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "#666", fontSize: "1rem" }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: "#fee",
              color: "#c33",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "0.9rem",
              border: "1px solid #fcc",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#333",
                fontWeight: "600",
                fontSize: "0.95rem",
              }}
            >
              📧 Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "8px",
                border: "2px solid #e0e0e0",
                fontSize: "1rem",
                transition: "border-color 0.3s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
            />
          </div>

          <div style={{ marginBottom: "30px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#333",
                fontWeight: "600",
                fontSize: "0.95rem",
              }}
            >
              🔒 Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "8px",
                border: "2px solid #e0e0e0",
                fontSize: "1rem",
                transition: "border-color 0.3s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#667eea")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: loading
                ? "#ccc"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading
                ? "none"
                : "0 4px 15px rgba(102, 126, 234, 0.4)",
              transition: "transform 0.2s, box-shadow 0.2s",
              marginBottom: "20px",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
              }
            }}
          >
            {loading ? "⏳ Logging in..." : "🚀 Login"}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <p style={{ color: "#666", fontSize: "0.95rem" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
