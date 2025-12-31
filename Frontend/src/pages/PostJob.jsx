import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postJob } from "../controllers/jobs";
import { getUser, isAuthenticated } from "../controllers/user";

export const PostJob = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated or not a customer
  if (!isAuthenticated() || !user || user.userType !== "customer") {
    navigate("/signin");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      setLoading(false);
      return;
    }

    const budgetMin = parseFloat(formData.budget_min);
    const budgetMax = parseFloat(formData.budget_max);

    if (isNaN(budgetMin) || budgetMin <= 0) {
      setError("Minimum budget must be a positive number");
      setLoading(false);
      return;
    }

    if (isNaN(budgetMax) || budgetMax <= 0) {
      setError("Maximum budget must be a positive number");
      setLoading(false);
      return;
    }

    if (budgetMin >= budgetMax) {
      setError("Maximum budget must be greater than minimum budget");
      setLoading(false);
      return;
    }

    try {
      // customerId is now set on backend from JWT token, don't send it
      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        budget_min: budgetMin,
        budget_max: budgetMax,
        status: "open",
      };

      await postJob(jobData);
      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        budget_min: "",
        budget_max: "",
      });

      // Redirect to jobs page after 2 seconds
      setTimeout(() => {
        navigate("/jobs");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ color: "#0F172A" }}>Post a New Job</h1>

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
          Job posted successfully! Redirecting to jobs page...
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div>
          <label htmlFor="title" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#0F172A" }}>
            Job Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Wedding Highlight Video"
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
        </div>

        <div>
          <label htmlFor="description" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#0F172A" }}>
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the job requirements, timeline, and any specific details..."
            required
            rows={6}
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label htmlFor="budget_min" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#0F172A" }}>
              Minimum Budget (€) *
            </label>
            <input
              type="number"
              id="budget_min"
              name="budget_min"
              value={formData.budget_min}
              onChange={handleChange}
              placeholder="e.g., 500"
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
          </div>

          <div>
            <label htmlFor="budget_max" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold", color: "#0F172A" }}>
              Maximum Budget (€) *
            </label>
            <input
              type="number"
              id="budget_max"
              name="budget_max"
              value={formData.budget_max}
              onChange={handleChange}
              placeholder="e.g., 1000"
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
          </div>
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
            {loading ? "Posting..." : "Post Job"}
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
  );
};

export default PostJob;


