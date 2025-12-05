import React, { useMemo, useState, useEffect } from "react";
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
  dates,
  currentIndex,
  setCurrentIndex,
  isPlaying,
  setIsPlaying,
  playSpeed,
}) {
  // 🔹 Time mode: monthly or NASA
  const [timeMode, setTimeMode] = useState("monthly"); // "monthly" | "nasa"

  // NASA POWER states
  const [nasaSeries, setNasaSeries] = useState([]);
  const [nasaLoading, setNasaLoading] = useState(false);
  const [nasaError, setNasaError] = useState("");

  // ML Forecast states --------------
  const [forecastData, setForecastData] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState("");

  // ========== NASA FETCH ==========
  const fetchNasaData = async () => {
    if (!selectedCity) {
      setNasaError("Select a city on the map first.");
      return;
    }

    setNasaLoading(true);
    setNasaError("");

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/temperature?lat=${selectedCity.lat}&lon=${selectedCity.lon}`
      );

      if (!res.ok) throw new Error("Failed to fetch NASA data");

      const data = await res.json();

      if (!data.series || !Array.isArray(data.series)) {
        throw new Error("Unexpected NASA response format");
      }

      const combined = data.series.map((item) => {
        const d = item.date || "";
        const mm = d.slice(4, 6);
        const dd = d.slice(6, 8);
        const label = mm && dd ? `${mm}/${dd}` : d;

        return {
          date: label,
          temp: item.temp,
          ndvi: item.ndvi,
        };
      });

      setNasaSeries(combined);
    } catch (err) {
      console.error(err);
      setNasaError("Could not load NASA data.");
      setNasaSeries([]);
    } finally {
      setNasaLoading(false);
    }
  };

  // Auto-load NASA when city changes
  useEffect(() => {
    if (selectedCity) {
      fetchNasaData();
    } else {
      setNasaSeries([]);
      setNasaError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  // ========== ML FORECAST FETCH ==========
  const fetchForecast = async () => {
    if (!selectedCity) {
      setForecastError("Select a city on the map first.");
      return;
    }

    setForecastLoading(true);
    setForecastError("");
    setForecastData(null);

    try {
      // Try city name first, fallback to lat/lon for searched cities
      const params = new URLSearchParams({
        months_ahead: "6",
      });
      
      if (selectedCity.city && ["Delhi", "Mumbai", "Chennai", "Kolkata", "Bengaluru"].includes(selectedCity.city.split(",")[0].trim())) {
        params.append("city", selectedCity.city.split(",")[0].trim());
      } else {
        params.append("lat", selectedCity.lat);
        params.append("lon", selectedCity.lon);
        if (selectedCity.city) params.append("city", selectedCity.city);
      }

      const res = await fetch(
        `http://127.0.0.1:5000/api/predict?${params.toString()}`
      );

      if (!res.ok) throw new Error("Failed to fetch forecast");

      const data = await res.json();

      // Convert API result into chart rows
      const rows = [];

      data.baseMonths.forEach((m, idx) => {
        rows.push({
          month: m,
          actualTemp: data.baseTemp[idx] != null ? parseFloat(data.baseTemp[idx]) : null,
          forecastTemp: null,
          actualNdvi: data.baseNdvi[idx] != null ? parseFloat(data.baseNdvi[idx]) : null,
          forecastNdvi: null,
        });
      });

      data.futureMonths.forEach((m, idx) => {
        rows.push({
          month: m,
          actualTemp: null,
          forecastTemp: data.tempPred[idx] != null ? parseFloat(data.tempPred[idx]) : null,
          actualNdvi: null,
          forecastNdvi: data.ndviPred[idx] != null ? parseFloat(data.ndviPred[idx]) : null,
        });
      });

      setForecastData({
        raw: data,
        chart: rows,
      });
    } catch (err) {
      console.error(err);
      setForecastError("Could not load forecast.");
    } finally {
      setForecastLoading(false);
    }
  };

  // ----------------------------------------
  // Monthly static data
  // ----------------------------------------
  const chartData = useMemo(() => {
    const city = selectedCity;
    if (!city || !city.timeSeries) {
      return dates.map((d) => ({ date: d, temp: 0, ndvi: 0 }));
    }
    return city.timeSeries.dates.map((d, i) => ({
      date: d,
      temp: city.timeSeries.temp[i],
      ndvi: city.timeSeries.ndvi[i],
    }));
  }, [selectedCity, dates]);

  // Map slider → NASA index
  const nasaSelectedIndex = useMemo(() => {
    if (!nasaSeries.length) return -1;
    if (dates && dates.length > 1) {
      const ratio = (currentIndex || 0) / (dates.length - 1 || 1);
      const idx = Math.round(ratio * (nasaSeries.length - 1));
      return Math.min(Math.max(idx, 0), nasaSeries.length - 1);
    }
    return Math.min(currentIndex || 0, nasaSeries.length - 1);
  }, [nasaSeries, dates, currentIndex]);

  const nasaSelected =
    nasaSelectedIndex >= 0 && nasaSelectedIndex < nasaSeries.length
      ? nasaSeries[nasaSelectedIndex]
      : null;

  const monthlyLabel = dates && dates.length > 0 ? dates[currentIndex] : "";
  const nasaLabel = nasaSelected ? nasaSelected.date : "";

  const canExport = selectedCity && selectedCity.timeSeries;
  const canExportForecast = forecastData && forecastData.chart;

  // CSV/Excel/PDF export helpers for monthly data
  const handleExportExcel = () => {
    if (!canExport) return;
    const rows = chartData.map((row) => ({
      Date: row.date,
      Temperature: row.temp,
      NDVI: row.ndvi,
    }));
    exportToExcel(rows, `${selectedCity.city}_timeseries`);
  };

  const handleExportCSV = () => {
    if (!canExport) return;
    const rows = chartData.map((row) => ({
      Date: row.date,
      Temperature: row.temp,
      NDVI: row.ndvi,
    }));
    exportToCSV(rows, `${selectedCity.city}_timeseries`);
  };

  const handleExportPDF = () => {
    if (!canExport) return;
    exportToPDF("pdf-export-only", `${selectedCity.city}_charts`);
  };

  // Export forecast data
  const handleExportForecastExcel = () => {
    if (!canExportForecast) return;
    const rows = forecastData.chart.map((row) => ({
      Month: row.month,
      "Actual Temperature (°C)": row.actualTemp ?? "",
      "Forecast Temperature (°C)": row.forecastTemp ?? "",
      "Actual NDVI": row.actualNdvi ?? "",
      "Forecast NDVI": row.forecastNdvi ?? "",
    }));
    exportToExcel(rows, `${selectedCity.city}_forecast`);
  };

  const handleExportForecastCSV = () => {
    if (!canExportForecast) return;
    const rows = forecastData.chart.map((row) => ({
      Month: row.month,
      "Actual Temperature (°C)": row.actualTemp ?? "",
      "Forecast Temperature (°C)": row.forecastTemp ?? "",
      "Actual NDVI": row.actualNdvi ?? "",
      "Forecast NDVI": row.forecastNdvi ?? "",
    }));
    exportToCSV(rows, `${selectedCity.city}_forecast`);
  };

  const handleExportForecastPDF = () => {
    if (!canExportForecast) return;
    exportToPDF("pdf-export-forecast", `${selectedCity.city}_forecast`);
  };

  // Risk calculation helpers
  const getTempRisk = (temp) => {
    if (temp > 35) return { level: "Extreme Heat", icon: "🔥", color: "#dc3545", bg: "#f8d7da" };
    if (temp >= 32) return { level: "High Heat", icon: "🌡", color: "#fd7e14", bg: "#fff3cd" };
    if (temp >= 28) return { level: "Moderate", icon: "⚠", color: "#ffc107", bg: "#fffbf0" };
    return { level: "Low", icon: "🟢", color: "#28a745", bg: "#d4edda" };
  };

  const getNdviRisk = (ndvi) => {
    if (ndvi < 0.3) return { level: "Sparse Vegetation", icon: "🚨", color: "#dc3545", bg: "#f8d7da" };
    if (ndvi < 0.5) return { level: "Moderate Vegetation", icon: "⚠", color: "#fd7e14", bg: "#fff3cd" };
    if (ndvi < 0.7) return { level: "Healthy Vegetation", icon: "🌱", color: "#28a745", bg: "#d4edda" };
    return { level: "Dense Vegetation", icon: "🌳", color: "#155724", bg: "#c3e6cb" };
  };

  // Get last predicted values for risk badges
  const lastPredictedTemp = forecastData?.chart
    ?.filter((row) => row.forecastTemp !== null)
    ?.slice(-1)[0]?.forecastTemp;

  const lastPredictedNdvi = forecastData?.chart
    ?.filter((row) => row.forecastNdvi !== null)
    ?.slice(-1)[0]?.forecastNdvi;

  const tempRisk = lastPredictedTemp !== null && lastPredictedTemp !== undefined
    ? getTempRisk(lastPredictedTemp)
    : null;

  const ndviRisk = lastPredictedNdvi !== null && lastPredictedNdvi !== undefined
    ? getNdviRisk(lastPredictedNdvi)
    : null;

  if (!sidebarOpen) return null;

  // -----------------------------------------------------------
  // R E N D E R   S T A R T
  // -----------------------------------------------------------
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        width: "300px",
        background: "#f8f9fa",
        padding: "16px",
        borderRight: "1px solid #ddd",
        overflowY: "auto",
        zIndex: 1200,
        boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
      }}
    >
      <button
        onClick={() => setSidebarOpen(false)}
        style={{
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "6px 10px",
          cursor: "pointer",
          marginBottom: "12px",
        }}
      >
        ❮ Close
      </button>

      <h3 style={{ marginBottom: "12px" }}>Controls</h3>

      {/* Metric Selector */}
      <div style={{ marginBottom: "12px" }}>
        <label>
          Metric:{" "}
          <select
            value={metric}
            onChange={(e) => {
              setMetric(e.target.value);
              if (e.target.value === "temp") {
                setShowTempHeatmap(true);
                setShowNdviHeatmap(false);
              } else {
                setShowTempHeatmap(false);
                setShowNdviHeatmap(true);
              }
            }}
          >
            <option value="temp">🌡 Temperature</option>
            <option value="ndvi">🌱 NDVI</option>
          </select>
        </label>
      </div>

      {/* Layer toggles */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={showTempHeatmap}
            onChange={(e) => setShowTempHeatmap(e.target.checked)}
          />{" "}
          🌡 Temperature Heatmap
        </label>

        <label style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={showNdviHeatmap}
            onChange={(e) => setShowNdviHeatmap(e.target.checked)}
          />{" "}
          🌱 NDVI Heatmap
        </label>

        <label style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={showMarkers}
            onChange={(e) => setShowMarkers(e.target.checked)}
          />{" "}
          📍 City Markers
        </label>
      </div>

      <hr />

      {/* Time Mode + Slider */}
      <div style={{ marginTop: "10px", marginBottom: "6px" }}>
        <b>Time Mode</b>
        <div style={{ marginTop: "4px", fontSize: "13px" }}>
          <label>
            <input
              type="radio"
              name="timeMode"
              value="monthly"
              checked={timeMode === "monthly"}
              onChange={(e) => setTimeMode(e.target.value)}
            />{" "}
            Monthly (Synthetic)
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="timeMode"
              value="nasa"
              checked={timeMode === "nasa"}
              onChange={(e) => setTimeMode(e.target.value)}
              disabled={!nasaSeries.length}
            />{" "}
            Daily – NASA
          </label>
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "#666",
            marginTop: "6px",
            minHeight: "18px",
          }}
        >
          Selected:{" "}
          <strong>
            {timeMode === "monthly" ? monthlyLabel : nasaLabel || "—"}
          </strong>
        </div>

        {/* Play controls */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            marginTop: "8px",
          }}
        >
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: isPlaying ? "#dc3545" : "#28a745",
              color: "white",
              border: "none",
              padding: "6px 10px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <label style={{ fontSize: "13px" }}>
            Speed:
            <select
              value={playSpeed}
              onChange={(e) => setPlaySpeed(Number(e.target.value))}
              style={{ marginLeft: "8px" }}
            >
              <option value={1200}>Slow</option>
              <option value={800}>Normal</option>
              <option value={400}>Fast</option>
            </select>
          </label>
        </div>

        {/* Slider */}
        <div style={{ marginTop: "10px" }}>
          <input
            type="range"
            min={0}
            max={dates && dates.length > 0 ? dates.length - 1 : 0}
            value={currentIndex}
            onChange={(e) => setCurrentIndex(Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "#666",
            }}
          >
            <span>
              {timeMode === "monthly"
                ? dates && dates.length
                  ? dates[0]
                  : ""
                : nasaSeries.length
                ? nasaSeries[0].date
                : ""}
            </span>
            <span>
              {timeMode === "monthly"
                ? dates && dates.length
                  ? dates[dates.length - 1]
                  : ""
                : nasaSeries.length
                ? nasaSeries[nasaSeries.length - 1].date
                : ""}
            </span>
          </div>
        </div>
      </div>

      <hr />

      {/* Selected City Summary */}
      <div style={{ marginTop: "12px" }}>
        <h4 style={{ margin: "6px 0" }}>
          {selectedCity?.city ?? "Select a city"}
        </h4>

        {selectedCity && (
          <>
            <p style={{ margin: "4px 0" }}>
              🌡 Temp:{" "}
              {selectedCity.timeSeries?.temp?.[currentIndex] ??
                selectedCity.temp}
              °C
            </p>
            <p style={{ margin: "4px 0" }}>
              🌱 NDVI:{" "}
              {selectedCity.timeSeries?.ndvi?.[currentIndex] ??
                selectedCity.ndvi}
            </p>
          </>
        )}
      </div>

      {/* Monthly Data Export Buttons */}
      {canExport && (
        <div style={{ marginTop: "12px", marginBottom: "12px" }}>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              onClick={handleExportPDF}
              style={{
                flex: 1,
                minWidth: "80px",
                padding: "6px 8px",
                background: "#343a40",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              📄 PDF
            </button>
            <button
              onClick={handleExportExcel}
              style={{
                flex: 1,
                minWidth: "80px",
                padding: "6px 8px",
                background: "#198754",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              📊 Excel
            </button>
            <button
              onClick={handleExportCSV}
              style={{
                flex: 1,
                minWidth: "80px",
                padding: "6px 8px",
                background: "#0d6efd",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              📋 CSV
            </button>
          </div>
        </div>
      )}

      <hr style={{ margin: "14px 0" }} />

      {/* NASA Temperature Panel */}
      <div style={{ marginTop: "8px" }}>
        <h4>NASA POWER – Daily Temperature</h4>

        <button
          onClick={fetchNasaData}
          disabled={!selectedCity || nasaLoading}
          style={{
            padding: "6px 10px",
            borderRadius: "4px",
            border: "none",
            background:
              selectedCity && !nasaLoading ? "#007bff" : "#adb5bd",
            color: "white",
            cursor:
              selectedCity && !nasaLoading ? "pointer" : "not-allowed",
            marginBottom: "8px",
          }}
        >
          {nasaLoading ? "Loading NASA..." : "🔄 Refresh NASA Data"}
        </button>

        {nasaError && (
          <p style={{ fontSize: "13px", color: "red" }}>{nasaError}</p>
        )}

        {!nasaError && !nasaLoading && nasaSeries.length > 0 && (
          <>
            {timeMode === "nasa" && nasaSelected && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#555",
                  marginBottom: "4px",
                }}
              >
                Selected day (NASA):{" "}
                <b>
                  {nasaSelected.date} – {nasaSelected.temp.toFixed(1)}°C
                </b>
              </p>
            )}

            {(() => {
              // Calculate dynamic Y-axis domain based on actual data
              const temps = nasaSeries.map((d) => d.temp).filter((t) => t != null && !isNaN(t));
              const minTemp = temps.length > 0 ? Math.min(...temps) : 0;
              const maxTemp = temps.length > 0 ? Math.max(...temps) : 40;
              const padding = (maxTemp - minTemp) * 0.1 || 2; // 10% padding or 2°C minimum
              const yMin = Math.max(0, Math.floor(minTemp - padding));
              const yMax = Math.ceil(maxTemp + padding);
              
              return (
                <div style={{ width: "100%", height: 160 }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={nasaSeries}
                      margin={{ top: 10, right: 20, left: 30, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        domain={[yMin, yMax]}
                        label={{
                          value: "Temp (°C)",
                          angle: -90,
                          position: "left",
                          offset: -5,
                          style: { textAnchor: "middle" },
                        }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="temp"
                        stroke="#ff7300"
                        dot={{ r: 3 }}
                        name="Temp (°C)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* NASA NDVI Panel */}
      <div style={{ marginTop: "16px", marginBottom: "16px" }}>
        <h4>NASA POWER – Daily NDVI (Synthetic)</h4>

        {!nasaError && !nasaLoading && nasaSeries.length > 0 && (
          <>
            {timeMode === "nasa" && nasaSelected && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#555",
                  marginBottom: "4px",
                }}
              >
                Selected day NDVI:{" "}
                <b>{nasaSelected.ndvi.toFixed(3)}</b>
              </p>
            )}

            <div style={{ width: "100%", height: 160 }}>
              <ResponsiveContainer>
                <AreaChart
                  data={nasaSeries}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    domain={[0, 1]}
                    label={{
                      value: "NDVI",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="ndvi"
                    name="NDVI"
                    stroke="#008000"
                    fill="#b7f7b7"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {!nasaLoading &&
          !nasaError &&
          nasaSeries.length === 0 &&
          selectedCity && (
            <p style={{ fontSize: "13px", color: "#666" }}>
              No NASA data loaded yet. Click “Refresh NASA Data”.
            </p>
          )}
      </div>

      {/* ───── ML Forecast Panel ───── */}
      <hr style={{ margin: "14px 0" }} />

      <div style={{ marginTop: "8px", marginBottom: "16px" }}>
        <h4>ML Forecast – Next 6 Months</h4>

        <button
          onClick={fetchForecast}
          disabled={!selectedCity || forecastLoading}
          style={{
            padding: "6px 10px",
            borderRadius: "4px",
            border: "none",
            background:
              selectedCity && !forecastLoading ? "#6f42c1" : "#adb5bd",
            color: "white",
            cursor:
              selectedCity && !forecastLoading ? "pointer" : "not-allowed",
            marginBottom: "8px",
          }}
        >
          {forecastLoading ? "Calculating..." : "🔮 Predict Next 6 Months"}
        </button>

        {forecastError && (
          <p style={{ fontSize: "13px", color: "red" }}>{forecastError}</p>
        )}

        {/* Risk Badges */}
        {forecastData && (tempRisk || ndviRisk) && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "12px",
              marginBottom: "12px",
              flexWrap: "wrap",
            }}
          >
            {tempRisk && (
              <div
                style={{
                  flex: "1 1 auto",
                  minWidth: "120px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: tempRisk.bg,
                  border: `2px solid ${tempRisk.color}`,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "18px", marginBottom: "2px" }}>
                  {tempRisk.icon}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: tempRisk.color,
                    marginBottom: "2px",
                  }}
                >
                  Temp Risk
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#555",
                  }}
                >
                  {tempRisk.level}
                </div>
                {lastPredictedTemp !== null && lastPredictedTemp !== undefined && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      marginTop: "2px",
                    }}
                  >
                    {lastPredictedTemp.toFixed(1)}°C
                  </div>
                )}
              </div>
            )}

            {ndviRisk && (
              <div
                style={{
                  flex: "1 1 auto",
                  minWidth: "120px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: ndviRisk.bg,
                  border: `2px solid ${ndviRisk.color}`,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "18px", marginBottom: "2px" }}>
                  {ndviRisk.icon}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: ndviRisk.color,
                    marginBottom: "2px",
                  }}
                >
                  NDVI Risk
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#555",
                  }}
                >
                  {ndviRisk.level}
                </div>
                {lastPredictedNdvi !== null && lastPredictedNdvi !== undefined && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      marginTop: "2px",
                    }}
                  >
                    {lastPredictedNdvi.toFixed(3)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {forecastData && (
          <>
            {/* Temperature Forecast */}
            <div style={{ marginTop: "6px" }}>
              <h5 style={{ marginBottom: "4px" }}>Temperature Forecast</h5>
              <div style={{ width: "100%", height: 160 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={forecastData.chart}
                    margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      domain={[0, 50]}
                      label={{
                        value: "Temp (°C)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actualTemp"
                      name="Actual Temp"
                      stroke="#007bff"
                      dot={{ r: 3 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="forecastTemp"
                      name="Forecast Temp"
                      stroke="#ff7300"
                      strokeDasharray="4 4"
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* NDVI Forecast */}
            <div style={{ marginTop: "10px" }}>
              <h5 style={{ marginBottom: "4px" }}>NDVI Forecast</h5>
              <div style={{ width: "100%", height: 160 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={forecastData.chart}
                    margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      domain={[0, 1]}
                      label={{
                        value: "NDVI",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actualNdvi"
                      name="Actual NDVI"
                      stroke="#28a745"
                      dot={{ r: 3 }}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="forecastNdvi"
                      name="Forecast NDVI"
                      stroke="#6610f2"
                      strokeDasharray="4 4"
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Forecast Export Buttons */}
            {canExportForecast && (
              <div style={{ marginTop: "12px", marginBottom: "8px" }}>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button
                    onClick={handleExportForecastPDF}
                    style={{
                      flex: 1,
                      minWidth: "80px",
                      padding: "6px 8px",
                      background: "#343a40",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    📄 PDF
                  </button>
                  <button
                    onClick={handleExportForecastExcel}
                    style={{
                      flex: 1,
                      minWidth: "80px",
                      padding: "6px 8px",
                      background: "#198754",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    📊 Excel
                  </button>
                  <button
                    onClick={handleExportForecastCSV}
                    style={{
                      flex: 1,
                      minWidth: "80px",
                      padding: "6px 8px",
                      background: "#0d6efd",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    📋 CSV
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {!forecastLoading &&
          !forecastData &&
          !forecastError &&
          selectedCity && (
            <p
              style={{
                fontSize: "13px",
                color: "#666",
                marginTop: "4px",
              }}
            >
              Click the button to generate ML-based forecast.
            </p>
          )}
      </div>

      {/* Hidden div for PDF export - Monthly Charts Only */}
      {canExport && (
        <div
          id="pdf-export-only"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            width: "800px",
            background: "white",
            padding: "40px",
          }}
        >
          <div style={{ marginBottom: "40px" }}>
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Temperature Trend
            </h2>
            <div style={{ width: "100%", height: "300px", background: "white" }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => d.slice(5)}
                    label={{ value: "Date", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis
                    label={{
                      value: "Temperature (°C)",
                      angle: -90,
                      position: "left",
                      offset: -5,
                      style: { textAnchor: "middle" },
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#ff7f0e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              NDVI Trend
            </h2>
            <div style={{ width: "100%", height: "300px", background: "white" }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => d.slice(5)}
                    label={{ value: "Date", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis
                    domain={[0, 1]}
                    label={{
                      value: "NDVI",
                      angle: -90,
                      position: "left",
                      offset: -5,
                      style: { textAnchor: "middle" },
                    }}
                  />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="ndvi"
                    stroke="#2ca02c"
                    fill="#2ca02c"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Hidden div for PDF export - Forecast Charts Only */}
      {canExportForecast && (
        <div
          id="pdf-export-forecast"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            width: "800px",
            background: "white",
            padding: "40px",
          }}
        >
          <div style={{ marginBottom: "40px" }}>
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Temperature Forecast
            </h2>
            <div style={{ width: "100%", height: "300px", background: "white" }}>
              <ResponsiveContainer>
                <LineChart
                  data={forecastData.chart}
                  margin={{ top: 10, right: 20, left: 30, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    domain={[0, 50]}
                    label={{
                      value: "Temperature (°C)",
                      angle: -90,
                      position: "left",
                      offset: -5,
                      style: { textAnchor: "middle" },
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actualTemp"
                    name="Actual Temp"
                    stroke="#007bff"
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="forecastTemp"
                    name="Forecast Temp"
                    stroke="#ff7300"
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h2
              style={{
                margin: "0 0 20px 0",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              NDVI Forecast
            </h2>
            <div style={{ width: "100%", height: "300px", background: "white" }}>
              <ResponsiveContainer>
                <LineChart
                  data={forecastData.chart}
                  margin={{ top: 10, right: 20, left: 30, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    domain={[0, 1]}
                    label={{
                      value: "NDVI",
                      angle: -90,
                      position: "left",
                      offset: -5,
                      style: { textAnchor: "middle" },
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actualNdvi"
                    name="Actual NDVI"
                    stroke="#28a745"
                    dot={{ r: 3 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="forecastNdvi"
                    name="Forecast NDVI"
                    stroke="#6610f2"
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
