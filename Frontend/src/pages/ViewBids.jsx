import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBidsForCustomer, updateBidStatus } from "../controllers/jobs";
import { getUser, isAuthenticated } from "../controllers/user";

export const ViewBids = () => {
  const navigate = useNavigate();
  const [user] = useState(() => getUser());

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (!isAuthenticated() || !user || user.userType !== "customer") {
      navigate("/signin");
    }
  }, [navigate, user]);

  const loadBids = useCallback(async () => {
    if (!user || user.userType !== "customer" || !user.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await fetchBidsForCustomer();
      setBids(data);
    } catch (err) {
      setError(err.message || "Failed to load bids.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBids();
  }, [loadBids]);

  const handleBidStatusUpdate = async (bidId, status) => {
    try {
      await updateBidStatus(bidId, status);
      // Reload bids to get updated status
      await loadBids();
    } catch (err) {
      setError(err.message || `Failed to ${status} bid. Please try again.`);
    }
  };

  if (!user || user.userType !== "customer") {
    return null;
  }

  return (
    <div style={{ width: "100%", maxWidth: "100%", padding: "2rem", margin: 0 }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      <h1 style={{ color: "#0F172A" }}>Bids Received</h1>

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
          <p style={{ color: "#475569" }}>No bids received yet.</p>
          <button
            onClick={() => navigate("/post-job")}
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
            Post a Job
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
                </div>
              )}

              {/* Bid Information */}
              <div>
                {/* Photographer Info */}
                {bid.photographer && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "1.5rem",
                      padding: "1rem",
                      backgroundColor: "#F8FAFC",
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    {bid.photographer.profilePicture ? (
                      <img
                        src={bid.photographer.profilePicture}
                        alt={bid.photographer.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #E2E8F0",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        backgroundColor: "#E2E8F0",
                        display: bid.photographer.profilePicture ? "none" : "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#475569",
                        fontSize: "24px",
                        fontWeight: "bold",
                      }}
                    >
                      {bid.photographer.name ? bid.photographer.name.charAt(0).toUpperCase() : "P"}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: "#0F172A", fontSize: "18px" }}>
                        {bid.photographer.name || "Photographer"}
                      </h4>
                      <p style={{ margin: "0.25rem 0 0 0", color: "#475569", fontSize: "14px" }}>
                        Photographer
                      </p>
                    </div>
                  </div>
                )}
                
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 0.5rem 0", color: "#0F172A" }}>Bid Details</h4>
                    <p style={{ margin: "0.5rem 0", fontSize: "18px", color: "#0F172A" }}>
                      <strong>Price: €{bid.price}</strong>
                    </p>
                    <p style={{ margin: "0.5rem 0", color: "#475569" }}>
                      <strong>Status:</strong>{" "}
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
                        }}
                      >
                        {bid.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <h4 style={{ marginBottom: "0.5rem", color: "#0F172A" }}>Proposal</h4>
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

                <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
                  {bid.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleBidStatusUpdate(bid.id || bid.bidId, "accepted")}
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
                        Accept Bid
                      </button>
                      <button
                        onClick={() => handleBidStatusUpdate(bid.id || bid.bidId, "rejected")}
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
                        Reject Bid
                      </button>
                    </>
                  )}
                  {bid.status !== "pending" && (
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#475569",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "not-allowed",
                        fontSize: "14px",
                        opacity: 0.6,
                      }}
                      disabled
                    >
                      {bid.status === "accepted" ? "Bid Accepted" : "Bid Rejected"}
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/photographer/${bid.videographerId}/portfolio`)}
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
                    View Portfolio
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default ViewBids;
