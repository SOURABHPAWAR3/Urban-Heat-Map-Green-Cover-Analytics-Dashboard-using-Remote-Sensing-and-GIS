import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMap,
} from "react-leaflet";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
import "leaflet/dist/leaflet.css";

import Sidebar from "./Sidebar"; // 👈 NEW

function FitBounds({ cities }) {
  const map = useMap();
  useEffect(() => {
    if (cities.length > 0) {
      const bounds = cities.map((c) => [c.lat, c.lon]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [cities, map]);
  return null;
}

function HeatMap() {
  const [cities, setCities] = useState([]);
  const [metric, setMetric] = useState("temp");
  const [showTempHeatmap, setShowTempHeatmap] = useState(true);
  const [showNdviHeatmap, setShowNdviHeatmap] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/cities")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Fetched city data:", data);
        setCities(data);
      });
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", position: "relative" }}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        metric={metric}
        setMetric={setMetric}
        showTempHeatmap={showTempHeatmap}
        setShowTempHeatmap={setShowTempHeatmap}
        showNdviHeatmap={showNdviHeatmap}
        setShowNdviHeatmap={setShowNdviHeatmap}
        showMarkers={showMarkers}
        setShowMarkers={setShowMarkers}
      />

      <div style={{ flex: 1, position: "relative" }}>
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              padding: "6px 10px",
              border: "none",
              background: "#007bff",
              color: "white",
              borderRadius: "4px",
              cursor: "pointer",
              zIndex: 1000,
            }}
          >
            ➡ Controls
          </button>
        )}

        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <FitBounds cities={cities} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {showTempHeatmap && (
            <HeatmapLayer
              points={cities}
              longitudeExtractor={(p) => p.lon}
              latitudeExtractor={(p) => p.lat}
              intensityExtractor={(p) => p.temp / 40}
              radius={30}
              blur={20}
              max={1.0}
            />
          )}

          {showNdviHeatmap && (
            <HeatmapLayer
              points={cities}
              longitudeExtractor={(p) => p.lon}
              latitudeExtractor={(p) => p.lat}
              intensityExtractor={(p) => p.ndvi}
              radius={30}
              blur={20}
              max={1.0}
            />
          )}

          {showMarkers &&
            cities.map((city, index) => (
              <CircleMarker
                key={index}
                center={[city.lat, city.lon]}
                radius={6}
                color="black"
                fillColor="white"
                fillOpacity={0.7}
                eventHandlers={{
                  click: () => setSelectedCity(city),
                }}
              />
            ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default HeatMap;
