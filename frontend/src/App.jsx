import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import HeatMap from "./components/HeatMap";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Home route */}
        <Route path="/" element={<Home />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected HeatMap route */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <HeatMap />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
