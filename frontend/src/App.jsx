import { useState, useEffect } from "react";

const API = "https://real-estate-ai-4j59.onrender.com";

function App() {
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [bhk, setBhk] = useState(2);
  const [budget, setBudget] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API}/history`);
      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.log("Could not load history");
    }
  };

  const handleSearch = async () => {
    if (!city || !budget) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch(
        `${API}/recommend?city=${city}&property_type=${propertyType}&bhk=${bhk}&max_budget=${budget}`
      );
      const data = await response.json();
      setResults(data);
      fetchHistory();
    } catch (err) {
      setError("Could not connect to API. Make sure FastAPI is running.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#1a1a2e" }}>🏠 Real Estate AI</h1>
      <p style={{ color: "#666" }}>Find your perfect property in India</p>

      <div style={{ background: "#f5f5f5", padding: "24px", borderRadius: "12px", marginTop: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>City</label>
          <input
            type="text"
            placeholder="e.g. Jaipur, Kochi, Ranchi"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Property Type</label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }}
          >
            <option>Apartment</option>
            <option>Villa</option>
            <option>Independent House</option>
          </select>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>BHK</label>
          <select
            value={bhk}
            onChange={(e) => setBhk(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }}
          >
            <option value={1}>1 BHK</option>
            <option value={2}>2 BHK</option>
            <option value={3}>3 BHK</option>
            <option value={4}>4 BHK</option>
            <option value={5}>5 BHK</option>
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>Max Budget (in Lakhs)</label>
          <input
            type="number"
            placeholder="e.g. 300"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }}
          />
        </div>

        <button
          onClick={handleSearch}
          style={{ width: "100%", padding: "12px", background: "#1a1a2e", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" }}
        >
          {loading ? "Searching..." : "Search Properties"}
        </button>

        {error && <p style={{ color: "red", marginTop: "12px" }}>{error}</p>}
      </div>

      {/* History Section */}
      <div style={{ marginTop: "32px" }}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{ background: "none", border: "1px solid #ddd", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }}
        >
          {showHistory ? "Hide" : "Show"} Recent Searches ({history.length})
        </button>

        {showHistory && history.length > 0 && (
          <div style={{ marginTop: "16px", background: "#f9f9f9", borderRadius: "12px", padding: "16px" }}>
            {history.map((h, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid #eee", fontSize: "13px", color: "#555" }}>
                🔍 <strong>{h.city}</strong> — {h.property_type}, {h.bhk} BHK, ₹{h.max_budget} Lakhs → {h.results_found} results found
                <span style={{ float: "right", color: "#aaa" }}>{new Date(h.searched_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div style={{ marginTop: "32px" }}>
          {results.message ? (
            <p style={{ color: "#666" }}>{results.message}</p>
          ) : (
            <>
              <h2 style={{ marginBottom: "16px" }}>Found {results.total_found} properties</h2>
              {results.properties.map((p, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "20px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <h3 style={{ margin: "0 0 8px" }}>{p.property_type} in {p.locality}, {p.city}</h3>
                  <p style={{ color: "#444", margin: "4px 0" }}>💰 ₹{p.price_in_lakhs} Lakhs</p>
                  <p style={{ color: "#444", margin: "4px 0" }}>📐 {p.size_sqft} sqft | {p.bhk} BHK | {p.furnished_status}</p>
                  <p style={{ color: "#444", margin: "4px 0" }}>📍 {p.state}</p>
                  <p style={{ color: "#444", margin: "4px 0" }}>🏗 {p.availability}</p>
                  <p style={{ color: "#888", margin: "8px 0 0", fontSize: "13px" }}>✨ {p.amenities}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;