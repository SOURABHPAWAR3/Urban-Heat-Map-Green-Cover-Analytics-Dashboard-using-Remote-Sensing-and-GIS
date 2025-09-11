import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <div className="p-4">
        <nav className="mb-4">
          <Link to="/" className="mr-4 text-blue-600">Home</Link>
          <Link to="/dashboard" className="text-blue-600">Dashboard</Link>
        </nav>

        <Routes>
          <Route path="/" element={<h1 className="text-2xl">Welcome to IIRS Project 🚀</h1>} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
