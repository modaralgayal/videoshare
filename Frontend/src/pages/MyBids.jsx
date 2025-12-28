import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBidsForPhotographer } from "../controllers/jobs";
import { getUser, isAuthenticated } from "../controllers/user";

export const MyBids = () => {
  const navigate = useNavigate();
  const [user] = useState(() => getUser());

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if not authenticated or not a photographer
  useEffect(() => {
    if (!isAuthenticated() || !user || user.userType !== "photographer") {
      navigate("/signin");
    }
  }, [navigate, user]);

  const loadBids = async () => {
    if (!user || user.userType !== "photographer" || !user.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await fetchBidsForPhotographer();
      setBids(data);
    } catch (err) {
      setError(err.message || "Failed to load bids.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBids();
  }, [user?.uid]);

  if (!user || user.userType !== "photographer") {
    return null;
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ color: "#0F172A" }}>My Bids</h1>

      {loading && <p style={{ color: "#475569" }}>Loading bids...</p>}

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

      {!loading && !error && bids.length === 0 && (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "5px",
          }}
        >
          <p style={{ color: "#475569" }}>You haven't submitted any bids yet.</p>
          <button
            onClick={() => navigate("/jobs")}
            style={{
              marginTop: "1rem",
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
            Browse Jobs
          </button>
        </div>
      )}

      {!loading && !error && bids.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          {bids.map((bid) => (
            <div
              key={bid.id || bid.bidId}
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "1.5rem",
                marginBottom: "1.5rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                backgroundColor: "#FFFFFF",
              }}
            >
              {/* Job Information */}
              {bid.job && (
                <div
                  style={{
                    backgroundColor: "#F8FAFC",
                    padding: "1rem",
                    borderRadius: "5px",
                    marginBottom: "1rem",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: "0.5rem", color: "#0F172A" }}>
                    {bid.job.title}
                  </h3>
                  <p style={{ margin: 0, color: "#475569", fontSize: "14px" }}>
                    {bid.job.description}
                  </p>
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "14px", color: "#475569" }}>
                    <strong>Budget Range:</strong> €{bid.job.budget_min} – €
                    {bid.job.budget_max}
                  </p>
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "14px", color: "#475569" }}>
                    <strong>Job Status:</strong> {bid.job.status}
                  </p>
                </div>
              )}

              {/* Bid Information */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 0.5rem 0", color: "#0F172A" }}>Your Bid</h4>
                    <p style={{ margin: "0.5rem 0", fontSize: "18px", color: "#0F172A" }}>
                      <strong>Price: €{bid.price}</strong>
                    </p>
                    <p style={{ margin: "0.5rem 0", color: "#475569" }}>
                      <strong>Bid Status:</strong>{" "}
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "3px",
                          backgroundColor:
                            bid.status === "accepted"
                              ? "#d4edda"
                              : bid.status === "rejected"
                              ? "#f8d7da"
                              : "#fff3cd",
                          color:
                            bid.status === "accepted"
                              ? "#155724"
                              : bid.status === "rejected"
                              ? "#721c24"
                              : "#856404",
                          fontWeight: "bold",
                        }}
                      >
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <h4 style={{ marginBottom: "0.5rem", color: "#0F172A" }}>Your Proposal</h4>
                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.6",
                      color: "#475569",
                    }}
                  >
                    {bid.proposal}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBids;
