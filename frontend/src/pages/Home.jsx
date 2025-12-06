import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Hero Section */}
      <div
        style={{
          padding: "80px 20px",
          textAlign: "center",
          color: "white",
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: "bold",
            marginBottom: "20px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          🌡️ Urban Heat Map Dashboard
        </h1>
        <p
          style={{
            fontSize: "1.3rem",
            marginBottom: "40px",
            maxWidth: "700px",
            margin: "0 auto 40px",
            opacity: 0.95,
          }}
        >
          Monitor temperature and NDVI data across India with real-time NASA satellite data.
          Track environmental changes, predict future trends, and make data-driven decisions.
        </p>
        {!user ? (
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/register"
              style={{
                padding: "14px 32px",
                background: "white",
                color: "#667eea",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "1.1rem",
                boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Get Started
            </Link>
            <Link
              to="/login"
              style={{
                padding: "14px 32px",
                background: "transparent",
                color: "white",
                border: "2px solid white",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "1.1rem",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Login
            </Link>
          </div>
        ) : (
          <Link
            to="/dashboard"
            style={{
              padding: "14px 32px",
              background: "white",
              color: "#667eea",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "1.1rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
              display: "inline-block",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Go to Dashboard →
          </Link>
        )}
      </div>

      {/* Features Section */}
      <div
        style={{
          background: "white",
          padding: "60px 20px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "50px",
            color: "#333",
          }}
        >
          Key Features
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* Feature 1 */}
          <div
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              padding: "30px",
              borderRadius: "12px",
              color: "white",
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🌡️</div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "10px" }}>
              Real-Time Temperature
            </h3>
            <p style={{ fontSize: "1rem", opacity: 0.95 }}>
              Get accurate daily temperature data from NASA POWER API for any location in India.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              padding: "30px",
              borderRadius: "12px",
              color: "white",
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🌱</div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "10px" }}>
              NDVI Monitoring
            </h3>
            <p style={{ fontSize: "1rem", opacity: 0.95 }}>
              Track vegetation health with Normalized Difference Vegetation Index (NDVI) analysis.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            style={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              padding: "30px",
              borderRadius: "12px",
              color: "white",
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🔮</div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "10px" }}>
              ML Predictions
            </h3>
            <p style={{ fontSize: "1rem", opacity: 0.95 }}>
              Forecast temperature and NDVI trends for the next 6 months using machine learning.
            </p>
          </div>

          {/* Feature 4 */}
          <div
            style={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              padding: "30px",
              borderRadius: "12px",
              color: "white",
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🗺️</div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "10px" }}>
              Interactive Maps
            </h3>
            <p style={{ fontSize: "1rem", opacity: 0.95 }}>
              Explore heatmaps and search for any city or village in India with interactive visualizations.
            </p>
          </div>

          {/* Feature 5 */}
          <div
            style={{
              background: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
              padding: "30px",
              borderRadius: "12px",
              color: "white",
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📊</div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "10px" }}>
              Data Export
            </h3>
            <p style={{ fontSize: "1rem", opacity: 0.95 }}>
              Export your data in multiple formats: PDF, Excel, and CSV for further analysis.
            </p>
          </div>

          {/* Feature 6 */}
          <div
            style={{
              background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
              padding: "30px",
              borderRadius: "12px",
              color: "#333",
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-5px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>⚡</div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "10px" }}>
              Up-to-Date Data
            </h3>
            <p style={{ fontSize: "1rem", opacity: 0.9 }}>
              Always get the latest 7 days of data up to today, ensuring you have current information.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "60px 20px",
          color: "white",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            maxWidth: "1000px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "10px" }}>100%</div>
            <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>NASA Data Accuracy</div>
          </div>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "10px" }}>∞</div>
            <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>Cities & Villages</div>
          </div>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "10px" }}>7</div>
            <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>Days of History</div>
          </div>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "10px" }}>6</div>
            <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>Months Forecast</div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div
        style={{
          background: "white",
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "20px",
            color: "#333",
          }}
        >
          Ready to Get Started?
        </h2>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#666",
            marginBottom: "30px",
            maxWidth: "600px",
            margin: "0 auto 30px",
          }}
        >
          Join us today and start monitoring environmental data across India with powerful visualization tools.
        </p>
        {!user && (
          <Link
            to="/register"
            style={{
              padding: "16px 40px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "1.2rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
              display: "inline-block",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Create Free Account
          </Link>
        )}
      </div>
    </div>
  );
}

export default Home;
