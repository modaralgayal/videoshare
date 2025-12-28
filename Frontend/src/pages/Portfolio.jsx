import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, isAuthenticated } from "../controllers/user";

export const Portfolio = () => {
  const navigate = useNavigate();
  const [user] = useState(() => getUser());

  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");

  // Redirect if not authenticated or not a photographer
  useEffect(() => {
    if (!isAuthenticated() || !user || user.userType !== "photographer") {
      navigate("/signin");
    }
  }, [navigate, user]);

  // Load portfolio data (placeholder for now)
  useEffect(() => {
    if (user && user.userType === "photographer") {
      setLoading(true);
      // TODO: Fetch portfolio items and description from backend
      // For now, using empty array and empty description
      setPortfolioItems([]);
      // TODO: Load description from backend/localStorage
      const savedDescription = localStorage.getItem(`portfolio_description_${user.uid}`) || "";
      setDescription(savedDescription);
      setLoading(false);
    }
  }, [user]);

  const handleSaveDescription = () => {
    if (description.length > 1000) {
      setDescriptionError("Description must be 1000 characters or less");
      return;
    }

    // TODO: Save description to backend
    // For now, save to localStorage
    if (user?.uid) {
      localStorage.setItem(`portfolio_description_${user.uid}`, description);
    }
    
    setIsEditingDescription(false);
    setDescriptionError("");
  };

  const handleCancelEdit = () => {
    // Reload original description
    const savedDescription = localStorage.getItem(`portfolio_description_${user.uid}`) || "";
    setDescription(savedDescription);
    setIsEditingDescription(false);
    setDescriptionError("");
  };

  if (!user || user.userType !== "photographer") {
    return null;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ color: "#0F172A" }}>My Portfolio</h1>
        <button
          onClick={() => navigate("/portfolio/add")}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#F59E0B",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Add Portfolio Item
        </button>
      </div>

      {/* Portfolio Description Section */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          padding: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ color: "#0F172A", margin: 0 }}>About Me</h2>
          {!isEditingDescription && (
            <button
              onClick={() => setIsEditingDescription(true)}
              style={{
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
              {description ? "Edit Description" : "Add Description"}
            </button>
          )}
        </div>

        {isEditingDescription ? (
          <div>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setDescriptionError("");
              }}
              placeholder="Tell potential clients about yourself, your experience, your style, and what makes your work unique..."
              rows={6}
              maxLength={1000}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "16px",
                border: descriptionError ? "1px solid #dc3545" : "1px solid #E2E8F0",
                borderRadius: "5px",
                boxSizing: "border-box",
                fontFamily: "inherit",
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                resize: "vertical",
              }}
            />
            {descriptionError && (
              <p style={{ color: "#721c24", fontSize: "14px", margin: "0.5rem 0 0 0" }}>
                {descriptionError}
              </p>
            )}
            <p style={{ color: "#475569", fontSize: "14px", margin: "0.5rem 0 1rem 0" }}>
              {description.length}/1000 characters
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleSaveDescription}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#F59E0B",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Save Description
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "transparent",
                  color: "#475569",
                  border: "1px solid #E2E8F0",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            {description ? (
              <p
                style={{
                  color: "#475569",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  margin: 0,
                }}
              >
                {description}
              </p>
            ) : (
              <p
                style={{
                  color: "#475569",
                  fontSize: "16px",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                No description added yet. Click "Add Description" to tell clients about yourself and your work.
              </p>
            )}
          </div>
        )}
      </div>

      {loading && <p style={{ color: "#475569" }}>Loading portfolio...</p>}

      {!loading && portfolioItems.length === 0 && (
        <div
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
          }}
        >
          <p style={{ color: "#475569", fontSize: "18px", marginBottom: "1rem" }}>
            Your portfolio is empty.
          </p>
          <p style={{ color: "#475569", marginBottom: "2rem" }}>
            Start building your portfolio by adding your best work to showcase your skills to potential clients.
          </p>
          <button
            onClick={() => navigate("/portfolio/add")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#F59E0B",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Add Your First Portfolio Item
          </button>
        </div>
      )}

      {!loading && portfolioItems.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          {portfolioItems.map((item) => (
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
                <p style={{ color: "#475569", fontSize: "14px", marginBottom: "1rem" }}>
                  {item.description || "No description"}
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    style={{
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
                    Edit
                  </button>
                  <button
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "transparent",
                      color: "#475569",
                      border: "1px solid #E2E8F0",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Portfolio Stats Section */}
      <div
        style={{
          marginTop: "3rem",
          padding: "2rem",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ color: "#0F172A", marginTop: 0, marginBottom: "1.5rem" }}>
          Portfolio Statistics
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          <div>
            <p style={{ color: "#475569", fontSize: "14px", margin: 0 }}>Total Items</p>
            <p style={{ color: "#0F172A", fontSize: "32px", fontWeight: "bold", margin: "0.5rem 0 0 0" }}>
              {portfolioItems.length}
            </p>
          </div>
          <div>
            <p style={{ color: "#475569", fontSize: "14px", margin: 0 }}>Total Views</p>
            <p style={{ color: "#0F172A", fontSize: "32px", fontWeight: "bold", margin: "0.5rem 0 0 0" }}>
              {/* TODO: Add views count from backend */}
              0
            </p>
          </div>
          <div>
            <p style={{ color: "#475569", fontSize: "14px", margin: 0 }}>Active Bids</p>
            <p style={{ color: "#0F172A", fontSize: "32px", fontWeight: "bold", margin: "0.5rem 0 0 0" }}>
              {/* TODO: Add active bids count from backend */}
              0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;

