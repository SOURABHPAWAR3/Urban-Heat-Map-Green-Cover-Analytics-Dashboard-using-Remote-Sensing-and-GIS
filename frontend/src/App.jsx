import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Home route */}
        <Route
          path="/"
          element={
            <h1 style={{ textAlign: "center", marginTop: "50px" }}>
              Welcome to Urban Heat Map Dashboard
            </h1>
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected route */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
