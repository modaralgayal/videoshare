import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { makeBid } from "../controllers/jobs";
import { getUser, isAuthenticated } from "../controllers/user";

export const MakeBid = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  const [price, setPrice] = useState("");
  const [proposal, setProposal] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get job data from navigation state
  const job = location.state?.job;

  // Redirect if not authenticated, not a photographer, or no job data
  useEffect(() => {
    if (!isAuthenticated() || !user || user.userType !== "photographer") {
      navigate("/signin");
      return;
    }

    if (!job) {
      navigate("/jobs");
      return;
    }
  }, [navigate, user, job]);

  if (!job || !user || user.userType !== "photographer") {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Validation
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      setError("Please enter a valid price");
      setLoading(false);
      return;
    }

    if (!proposal.trim()) {
      setError("Please enter a proposal");
      setLoading(false);
      return;
    }

    try {
      // videographerId is now set on backend from JWT token, don't send it
      const bidData = {
        jobId: job.id || job.jobId,
        price: priceNum,
        proposal: proposal.trim(),
        status: "pending",
      };

      await makeBid(bidData);
      setSuccess(true);

      // Redirect to jobs page after 2 seconds
      setTimeout(() => {
        navigate("/jobs");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to submit bid. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "100%", padding: "2rem", margin: 0 }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      <h1 style={{ color: "#0F172A" }}>Make a Bid</h1>

      {/* Job Information */}
      <div
        style={{
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#0F172A" }}>{job.title}</h2>
        <p style={{ color: "#475569" }}>{job.description}</p>
        <p style={{ color: "#475569" }}>
          <strong>Budget Range:</strong> €{job.budget_min} – €{job.budget_max}
        </p>
        <p style={{ color: "#475569" }}>
          <strong>Status:</strong> {job.status}
        </p>
      </div>

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

      {success && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "1rem",
            borderRadius: "5px",
            marginBottom: "1rem",
          }}
        >
          Bid submitted successfully! Redirecting to jobs page...
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
      >
        <div>
          <label
            htmlFor="price"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#0F172A",
            }}
          >
            Your Bid Price (€) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 750"
            min="0"
            step="0.01"
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "16px",
              border: "1px solid #E2E8F0",
              borderRadius: "5px",
              boxSizing: "border-box",
              backgroundColor: "#FFFFFF",
              color: "#0F172A",
            }}
          />
          <small
            style={{ color: "#475569", marginTop: "0.25rem", display: "block" }}
          >
            Budget range: €{job.budget_min} – €{job.budget_max}
          </small>
        </div>

        <div>
          <label
            htmlFor="proposal"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
              color: "#0F172A",
            }}
          >
            Your Proposal *
          </label>
          <textarea
            id="proposal"
            name="proposal"
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="Describe your approach, timeline, and why you're the right fit for this job..."
            required
            rows={8}
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "16px",
              border: "1px solid #E2E8F0",
              borderRadius: "5px",
              boxSizing: "border-box",
              fontFamily: "inherit",
              backgroundColor: "#FFFFFF",
              color: "#0F172A",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: "#F59E0B",
              color: "white",
              border: "none",
              padding: "0.75rem 2rem",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Submitting..." : "Submit Bid"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            style={{
              backgroundColor: "#1E3A8A",
              color: "white",
              border: "none",
              padding: "0.75rem 2rem",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1D4ED8"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1E3A8A"}
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};
