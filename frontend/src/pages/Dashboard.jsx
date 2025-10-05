import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/heatmap")
      .then((res) => res.json())
      .then((data) => setHeatmapData(data.heatmap))
      .catch((err) => console.error(err));
  }, []);

  const getCityName = (lat) => {
    switch (lat) {
      case 28.6139:
        return "Delhi";
      case 19.076:
        return "Mumbai";
      case 13.0827:
        return "Chennai";
      case 22.5726:
        return "Kolkata";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Urban Heat Map & Green Cover Dashboard</h1>

      {user && (
        <p className="mb-6">
          Logged in as: <strong>{user.username || user.email}</strong>
        </p>
      )}

      {heatmapData.length === 0 ? (
        <p>Loading data...</p>
      ) : (
        <table className="table-auto border-collapse border border-gray-400 w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-4 py-2">City</th>
              <th className="border border-gray-400 px-4 py-2">Latitude</th>
              <th className="border border-gray-400 px-4 py-2">Longitude</th>
              <th className="border border-gray-400 px-4 py-2">Temp (°C)</th>
              <th className="border border-gray-400 px-4 py-2">NDVI</th>
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((point, idx) => (
              <tr key={idx}>
                <td className="border border-gray-400 px-4 py-2">{getCityName(point.lat)}</td>
                <td className="border border-gray-400 px-4 py-2">{point.lat}</td>
                <td className="border border-gray-400 px-4 py-2">{point.lon}</td>
                <td className="border border-gray-400 px-4 py-2">{point.temp}</td>
                <td className="border border-gray-400 px-4 py-2">{point.ndvi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;
