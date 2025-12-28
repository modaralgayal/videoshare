import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUser, isAuthenticated } from "../controllers/user";
import { fetchPhotographerPortfolio } from "../controllers/portfolio";

export const ViewPhotographerPortfolio = () => {
  const navigate = useNavigate();
  const { photographerId } = useParams();
  const [user] = useState(() => getUser());

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (!isAuthenticated() || !user || user.userType !== "customer") {
      navigate("/signin");
    }
  }, [navigate, user]);

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!photographerId || !user || user.userType !== "customer") {
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        // Fetch portfolio from backend
        const portfolioData = await fetchPhotographerPortfolio(photographerId);
        setPortfolio(portfolioData);
      } catch (err) {
        setError(err.message || "Failed to load photographer portfolio.");
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [photographerId, user]);

  if (!user || user.userType !== "customer") {
    return null;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1rem" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "2rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#1E3A8A",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "14px",
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1D4ED8"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1E3A8A"}
      >
        ← Back
      </button>

      <h1 style={{ color: "#0F172A", marginBottom: "2rem" }}>Photographer Portfolio</h1>

      {loading && <p style={{ color: "#475569" }}>Loading portfolio...</p>}

      {error && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "1rem",
            borderRadius: "5px",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && portfolio && (
        <>
          {/* Portfolio Description Section */}
          {portfolio.description && (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "2rem",
                marginBottom: "2rem",
              }}
            >
              <h2 style={{ color: "#0F172A", marginTop: 0, marginBottom: "1rem" }}>
                About This Photographer
              </h2>
              <p
                style={{
                  color: "#475569",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  margin: 0,
                }}
              >
                {portfolio.description}
              </p>
            </div>
          )}

          {/* Portfolio Items */}
          {portfolio.items && portfolio.items.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
                marginTop: portfolio.description ? "0" : "2rem",
              }}
            >
              {portfolio.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  {/* Image placeholder */}
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      backgroundColor: "#F8FAFC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#475569",
                    }}
                  >
                    Image Placeholder
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <h3 style={{ color: "#0F172A", marginTop: 0, marginBottom: "0.5rem" }}>
                      {item.title || "Untitled"}
                    </h3>
                    <p style={{ color: "#475569", fontSize: "14px" }}>
                      {item.description || "No description"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : !portfolio.description ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
              }}
            >
              <p style={{ color: "#475569" }}>
                This photographer hasn't set up their portfolio yet.
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default ViewPhotographerPortfolio;
