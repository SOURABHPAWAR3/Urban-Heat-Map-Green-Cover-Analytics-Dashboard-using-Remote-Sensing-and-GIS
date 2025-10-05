import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import "leaflet/dist/leaflet.css";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
