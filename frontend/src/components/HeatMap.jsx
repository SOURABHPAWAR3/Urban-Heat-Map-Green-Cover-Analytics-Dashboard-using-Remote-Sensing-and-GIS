import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMap,
} from "react-leaflet";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
import "leaflet/dist/leaflet.css";

import Sidebar from "./Sidebar";

function FitBounds({ cities }) {
  const map = useMap();
  useEffect(() => {
    if (cities.length > 0) {
      const bounds = cities.map((c) => [c.lat, c.lon]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // If no cities, show India by default
      map.fitBounds(
        [
          [6.5, 68.0],   // Southwest corner (southern India)
          [37.0, 97.0],  // Northeast corner (northern India)
        ],
        { padding: [50, 50] }
      );
    }
  }, [cities, map]);
  return null;
}

function generateTimeSeries(city, days = 14) {
  const dates = [];
  const temps = [];
  const ndvis = [];

  const baseTemp = city.temp ?? 30;
  const baseNdvi = city.ndvi ?? 0.3;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));

    const seasonal = Math.sin((i / days) * Math.PI * 2) * 1.5;
    const jitterT = (Math.random() - 0.5) * 1.2;
    temps.push(parseFloat((baseTemp + seasonal + jitterT).toFixed(2)));

    const seasonalN = Math.cos((i / days) * Math.PI * 2) * 0.02;
    const jitterN = (Math.random() - 0.5) * 0.02;
    let ndv = parseFloat((baseNdvi + seasonalN + jitterN).toFixed(3));
    ndv = Math.max(0, Math.min(1, ndv));
    ndvis.push(ndv);
  }

  return { dates, temps, ndvis };
}

function HeatMap() {
  const [cities, setCities] = useState([]);
  const [metric, setMetric] = useState("temp");
  const [showTempHeatmap, setShowTempHeatmap] = useState(true);
  const [showNdviHeatmap, setShowNdviHeatmap] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);

  const [dates, setDates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(800);
  const playRef = useRef(null);

  // NASA-related states
  const [nasaLoading, setNasaLoading] = useState(false);
  const [nasaError, setNasaError] = useState("");
  const [nasaSeries, setNasaSeries] = useState([]);

  // Search bar states for any city/village in India
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Fetch cities and generate time series
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/cities")
      .then((res) => res.json())
      .then((data) => {
        const days = 14;
        const enhanced = data.map((c) => {
          const ts = generateTimeSeries(c, days);
          return {
            ...c,
            timeSeries: {
              dates: ts.dates,
              temp: ts.temps,
              ndvi: ts.ndvis,
            },
          };
        });

        setCities(enhanced);
        if (enhanced.length > 0) {
          setDates(enhanced[0].timeSeries.dates);
          setCurrentIndex(enhanced[0].timeSeries.dates.length - 1);
          setSelectedCity(enhanced[0]);
        }
      })
      .catch((err) => console.error("Failed to fetch cities:", err));
  }, []);

  // Play/pause animation
  useEffect(() => {
    if (isPlaying) {
      playRef.current = setInterval(() => {
        setCurrentIndex((prev) =>
          dates.length === 0 ? prev : (prev + 1) % dates.length
        );
      }, playSpeed);
    } else {
      if (playRef.current) {
        clearInterval(playRef.current);
        playRef.current = null;
      }
    }
    return () => {
      if (playRef.current) {
        clearInterval(playRef.current);
        playRef.current = null;
      }
    };
  }, [isPlaying, playSpeed, dates]);

  // Initialize selectedCity once from cities, but don't override search selections
  useEffect(() => {
    if (!selectedCity && cities.length > 0) {
      setSelectedCity(cities[0]); // first city (e.g. Delhi) only on initial load
    }
  }, [cities, selectedCity]);

  // Fetch NASA data for selected city when it changes
  useEffect(() => {
    if (!selectedCity) return;

    const fetchNasaForCity = async (city) => {
      setNasaLoading(true);
      setNasaError("");
      setNasaSeries([]);

      try {
        const params = new URLSearchParams({
          lat: city.lat,
          lon: city.lon,
          // no start/end → backend uses last 7 days up to today
        });

        const res = await fetch(
          `http://127.0.0.1:5000/api/temperature?${params.toString()}`
        );
        if (!res.ok) throw new Error("NASA API HTTP error");
        const data = await res.json();

        if (!data.series || !Array.isArray(data.series)) {
          throw new Error("Unexpected NASA response format");
        }

        setNasaSeries(data.series);
      } catch (err) {
        console.error("NASA fetch error:", err);
        setNasaError("Failed to load NASA temperature data");
      } finally {
        setNasaLoading(false);
      }
    };

    fetchNasaForCity(selectedCity);
  }, [selectedCity]);

  // Search handler: geocode any city/village in India → lat/lon → setSelectedCity
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError("");

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery + ", India"
      )}&limit=1`;

      const res = await fetch(url, {
        headers: { "User-Agent": "iirs-demo-app/1.0" },
      });
      const results = await res.json();

      if (!results.length) {
        setSearchError("Location not found in India.");
        return;
      }

      const place = results[0];
      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);

      // Fetch real NASA data for this location
      try {
        const nasaRes = await fetch(
          `http://127.0.0.1:5000/api/temperature?lat=${lat}&lon=${lon}`
        );
        const nasaData = await nasaRes.json();
        
        let realDates = dates;
        let realTemps = Array(dates.length).fill(30);
        let realNdvis = Array(dates.length).fill(0.4);
        
        if (nasaData.series && nasaData.series.length > 0) {
          // Use NASA data if available
          realDates = nasaData.series.map(item => {
            const d = item.date || "";
            const yyyy = d.slice(0, 4);
            const mm = d.slice(4, 6);
            const dd = d.slice(6, 8);
            return `${yyyy}-${mm}-${dd}`;
          });
          realTemps = nasaData.series.map(item => item.temp);
          realNdvis = nasaData.series.map(item => item.ndvi);
        }

        const dynamicCity = {
          city: place.display_name,
          lat,
          lon,
          temp: realTemps.length > 0 ? realTemps[realTemps.length - 1] : 30,
          ndvi: realNdvis.length > 0 ? realNdvis[realNdvis.length - 1] : 0.4,
          timeSeries: {
            dates: realDates,
            temp: realTemps,
            ndvi: realNdvis,
          },
        };

        setSelectedCity(dynamicCity);
        setCities((prev) => [...prev, dynamicCity]);
      } catch (nasaErr) {
        // Fallback if NASA fetch fails
        const dynamicCity = {
          city: place.display_name,
          lat,
          lon,
          temp: 30,
          ndvi: 0.4,
          timeSeries: {
            dates,
            temp: Array(dates.length).fill(30),
            ndvi: Array(dates.length).fill(0.4),
          },
        };
        setSelectedCity(dynamicCity);
        setCities((prev) => [...prev, dynamicCity]);
      }
    } catch (e) {
      console.error(e);
      setSearchError("Error looking up location.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Intensity for heatmap points
  const intensityForPoint = (p) => {
    const idx = currentIndex ?? 0;
    if (!p.timeSeries) return 0.5;
    if (metric === "temp") {
      const t = p.timeSeries.temp[idx] ?? p.temp;
      // Clamp between 0 and 40 for normalization
      const clamped = Math.min(Math.max(t, 0), 40);
      return clamped / 40;
    } else {
      const n = p.timeSeries.ndvi[idx] ?? p.ndvi;
      return Math.max(0, Math.min(1, n));
    }
  };

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
        dates={dates}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        playSpeed={playSpeed}
        setPlaySpeed={setPlaySpeed}
        nasaSeries={nasaSeries}
        nasaLoading={nasaLoading}
        nasaError={nasaError}
        onReloadNasa={() => selectedCity && setSelectedCity({ ...selectedCity })}
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

        {/* Search bar for any Indian city/village */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1100,
            background: "white",
            padding: "6px 8px",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            maxWidth: "320px",
          }}
        >
          <input
            type="text"
            placeholder="Search city/village in India"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "200px", marginRight: "6px" }}
          />
          <button onClick={handleSearch} disabled={searchLoading}>
            {searchLoading ? "Searching..." : "Search"}
          </button>
          {searchError && (
            <div style={{ fontSize: "11px", color: "red", marginTop: "4px" }}>
              {searchError}
            </div>
          )}
        </div>

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

          {showTempHeatmap && metric === "temp" && cities.length > 0 && (
            <HeatmapLayer
              points={cities}
              longitudeExtractor={(p) => p.lon}
              latitudeExtractor={(p) => p.lat}
              intensityExtractor={(p) => intensityForPoint(p)}
              radius={30}
              blur={20}
              max={1.0}
            />
          )}

          {showNdviHeatmap && metric === "ndvi" && cities.length > 0 && (
            <HeatmapLayer
              points={cities}
              longitudeExtractor={(p) => p.lon}
              latitudeExtractor={(p) => p.lat}
              intensityExtractor={(p) => intensityForPoint(p)}
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
                radius={8}
                color="black"
                fillColor="white"
                fillOpacity={0.9}
                eventHandlers={{
                  click: () => {
                    setSelectedCity(city);
                  },
                }}
              />
            ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default HeatMap;
