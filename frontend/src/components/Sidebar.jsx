import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  ResponsiveContainer,
  Legend,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// 🧠 Import helper functions (new)
import { exportToCSV, exportToExcel, exportToPDF } from "../utils/exportHelpers";


function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  selectedCity,
  setSelectedCity,
  metric,
  setMetric,
  showTempHeatmap,
  setShowTempHeatmap,
  showNdviHeatmap,
  setShowNdviHeatmap,
  showMarkers,
  setShowMarkers,
}) {
  const [range, setRange] = useState("7d");
  const [customRange, setCustomRange] = useState([null, null]);

  const legends = {
    temp: {
      title: "Temperature (°C)",
      gradient: "linear-gradient(to right, blue, green, yellow, orange, red)",
      labels: ["0", "10", "20", "30", "40+"],
    },
    ndvi: {
      title: "NDVI (Vegetation Index)",
      gradient:
        "linear-gradient(to right, brown, yellow, lightgreen, green, darkgreen)",
      labels: ["0", "0.25", "0.5", "0.75", "1.0"],
    },
  };

  // Sample time series generation
  const generateSampleData = () => {
    if (!selectedCity) return [];

    const today = new Date();
    return Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (29 - i));
      return {
        date: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        temp: selectedCity.temp + (Math.random() * 4 - 2),
        ndvi: Math.max(0, Math.min(1, selectedCity.ndvi + (Math.random() * 0.2 - 0.1))),
      };
    });
  };

  const rawData = useMemo(generateSampleData, [selectedCity]);

  const filteredData = useMemo(() => {
    if (!rawData.length) return [];

    const today = new Date();
    let startDate;

    if (range === "7d") {
      startDate = new Date(today.setDate(today.getDate() - 7));
    } else if (range === "30d") {
      startDate = new Date(today.setDate(today.getDate() - 30));
    } else if (range === "custom" && customRange[0] && customRange[1]) {
      return rawData.filter((d) => {
        const date = new Date(d.date);
        return date >= customRange[0] && date <= customRange[1];
      });
    } else {
      startDate = new Date(today.setDate(today.getDate() - 7));
    }

    return rawData.filter((d) => new Date(d.date) >= startDate);
  }, [range, customRange, rawData]);

  return (
    <div
      style={{
        width: sidebarOpen ? "250px" : "0px",
        overflow: "hidden",
        transition: "width 0.3s ease-in-out",
        background: "#f8f9fa",
        padding: sidebarOpen ? "16px" : "0px",
        borderRight: sidebarOpen ? "1px solid #ddd" : "none",
        boxShadow: sidebarOpen ? "2px 0 6px rgba(0,0,0,0.1)" : "none",
        position: "relative",
      }}
    >
      {sidebarOpen && (
        <>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "absolute",
              top: "10px",
              right: "-40px",
              padding: "6px 10px",
              border: "none",
              background: "#007bff",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              zIndex: 1000,
            }}
          >
            ⬅
          </button>

          {selectedCity ? (
            // ⬇️ Wrap exportable content in a div with id="city-details"
            <div id="city-details">
              <h3>{selectedCity.city} 📊</h3>
              <p>🌡 Temperature: {selectedCity.temp.toFixed(1)}°C</p>
              <p>🌱 NDVI: {selectedCity.ndvi.toFixed(2)}</p>

              {/* ✅ Export Buttons */}
              <div style={{ marginBottom: "12px" }}>
                <button
                  onClick={() =>
                    exportToCSV(filteredData, `${selectedCity.city}_data`)
                  }
                  style={{
                    marginRight: "8px",
                    padding: "6px 10px",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Export CSV
                </button>
                <button
                  onClick={() =>
                    exportToExcel(filteredData, `${selectedCity.city}_data`)
                  }
                  style={{
                    marginRight: "8px",
                    padding: "6px 10px",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Export Excel
                </button>
                <button
                  onClick={() =>
                    exportToPDF("city-details", `${selectedCity.city}_report`)
                  }
                  style={{
                    padding: "6px 10px",
                    background: "#6f42c1",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Export PDF
                </button>
              </div>

              {/* 📅 Date Range Filter */}
              <div style={{ marginBottom: "12px" }}>
                <label>Date Range: </label>
                <select value={range} onChange={(e) => setRange(e.target.value)}>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {range === "custom" && (
                <DatePicker
                  selectsRange
                  startDate={customRange[0]}
                  endDate={customRange[1]}
                  onChange={(update) => setCustomRange(update)}
                  isClearable
                  dateFormat="yyyy-MM-dd"
                />
              )}

              {/* 📈 Temperature Chart */}
              <h4>Temperature Trend</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#ff7300"
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* 🌿 NDVI Chart */}
              <h4>NDVI Trend</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={filteredData}>
                  <defs>
                    <linearGradient id="ndviFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="ndvi"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#ndviFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <button
                onClick={() => setSelectedCity(null)}
                style={{
                  marginTop: "10px",
                  padding: "6px 10px",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                🔙 Back to Controls
              </button>
            </div>
          ) : (
            <>
              <h3>Controls</h3>
              <div style={{ marginBottom: "16px" }}>
                <label>
                  Select Metric:
                  <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    style={{ marginLeft: "8px" }}
                  >
                    <option value="temp">🌡 Temperature</option>
                    <option value="ndvi">🌱 NDVI</option>
                  </select>
                </label>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={showTempHeatmap}
                    onChange={(e) => setShowTempHeatmap(e.target.checked)}
                  />
                  🌡 Temperature Heatmap
                </label>
                <br />
                <label>
                  <input
                    type="checkbox"
                    checked={showNdviHeatmap}
                    onChange={(e) => setShowNdviHeatmap(e.target.checked)}
                  />
                  🌱 NDVI Heatmap
                </label>
                <br />
                <label>
                  <input
                    type="checkbox"
                    checked={showMarkers}
                    onChange={(e) => setShowMarkers(e.target.checked)}
                  />
                  📍 City Markers
                </label>
              </div>

              <div>
                <b>{legends[metric].title}</b>
                <div
                  style={{
                    height: "12px",
                    width: "100%",
                    background: legends[metric].gradient,
                    margin: "6px 0",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                  }}
                >
                  {legends[metric].labels.map((label, i) => (
                    <span key={i}>{label}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Sidebar;
