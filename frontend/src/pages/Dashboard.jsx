import { useEffect, useState } from "react";

export default function Dashboard() {
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/heatmap")
      .then((res) => res.json())
      .then((data) => setHeatmapData(data.heatmap))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Urban Heat Map & Green Cover Dashboard</h1>

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
                <td className="border border-gray-400 px-4 py-2">
                  {point.lat === 28.6139 ? "Delhi" : 
                   point.lat === 19.0760 ? "Mumbai" :
                   point.lat === 13.0827 ? "Chennai" :
                   "Kolkata"}
                </td>
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
}
