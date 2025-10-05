import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(username, email, password);

    if (success) {
      alert("Registration successful! You can now log in.");
      navigate("/login");
    } else {
      alert("Registration failed. Try again!");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: "inline-block", textAlign: "left" }}>
        <div>
          <label>Username:</label>
          <br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "250px", padding: "5px" }}
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          <label>Email:</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "250px", padding: "5px" }}
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          <label>Password:</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "250px", padding: "5px" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: "15px", width: "100%", padding: "8px" }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
