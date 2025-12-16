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
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1rem" }}>
      <h2>{headingText}</h2>

      {loading && <p>Loading jobs...</p>}

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

      {!loading && !error && filteredJobs.length === 0 && <p>No jobs found.</p>}

      {!loading && !error && filteredJobs.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {filteredJobs.map((job) => (
            <li
              key={job.id || job.jobId}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <b>{job.title}</b>
              <p style={{ marginTop: "0.5rem" }}>{job.description}</p>
              <p style={{ marginTop: "0.5rem" }}>
                Budget: €{job.budget_min} – €{job.budget_max}
              </p>
              <small>Status: {job.status}</small>
              <div
                style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}
              >
                {isPhotographer && (
                  <>
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                      onClick={() => navigate("/make-bid", { state: { job } })}
                    >
                      Make a Bid
                    </button>
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
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
  );
};
