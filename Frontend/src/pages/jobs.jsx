import { useEffect, useState } from "react";
import { fetchJobs } from "../controllers/jobs";
import { getUser } from "../controllers/user";
import { useNavigate } from "react-router-dom";

export const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = getUser();
  const isPhotographer = user?.userType === "photographer";
  const isCustomer = user?.userType === "customer";

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchJobs();
        setJobs(data);
      } catch (err) {
        setError(err.message || "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const headingText = isPhotographer
    ? "Available Jobs"
    : isCustomer
    ? "Your Job Postings"
    : "Job Postings";

  const filteredJobs =
    isCustomer && user?.uid
      ? jobs.filter((job) => job.customerId === user.uid)
      : jobs;

  return (
    <div style={{ width: "100%", maxWidth: "100%", padding: "2rem", margin: 0 }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      <h2 style={{ color: "#0F172A" }}>{headingText}</h2>

      {loading && <p style={{ color: "#475569" }}>Loading jobs...</p>}

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

      {!loading && !error && filteredJobs.length === 0 && <p style={{ color: "#475569" }}>No jobs found.</p>}

      {!loading && !error && filteredJobs.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {filteredJobs.map((job) => (
            <li
              key={job.id || job.jobId}
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "1.5rem",
                marginBottom: "1rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                backgroundColor: "#FFFFFF",
              }}
            >
              <b style={{ color: "#0F172A", fontSize: "18px" }}>{job.title}</b>
              <p style={{ marginTop: "0.5rem", color: "#475569" }}>{job.description}</p>
              <p style={{ marginTop: "0.5rem", color: "#475569" }}>
                Budget: €{job.budget_min} – €{job.budget_max}
            </p>
              <small style={{ color: "#475569" }}>Status: {job.status}</small>
              <div
                style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}
              >
                {isPhotographer && (
                  <>
                    <button
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
                      onClick={() => navigate("/make-bid", { state: { job } })}
                    >
                      Make a Bid
                    </button>
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
                      Send a Message
                    </button>
                  </>
                )}
              </div>
          </li>
        ))}
      </ul>
      )}
      </div>
    </div>
  );
};
