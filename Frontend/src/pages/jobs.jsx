import { useEffect, useState } from "react";
import { fetchJobs, deleteJob } from "../controllers/jobs";
import { getUser } from "../controllers/user";
import { useNavigate } from "react-router-dom";

export const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState({});
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
        // Filter out expired jobs
        const now = new Date();
        const activeJobs = data.filter((job) => {
          if (job.status === "expired") return false;
          if (job.expiresAt) {
            const expiresAt = new Date(job.expiresAt);
            if (expiresAt < now) {
              return false;
            }
          }
          return true;
        });
        setJobs(activeJobs);
      } catch (err) {
        setError(err.message || "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job request? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting((prev) => ({ ...prev, [jobId]: true }));
      setError("");
      await deleteJob(jobId);
      // Reload jobs after deletion
      const data = await fetchJobs();
      const now = new Date();
      const activeJobs = data.filter((job) => {
        if (job.status === "expired") return false;
        if (job.expiresAt) {
          const expiresAt = new Date(job.expiresAt);
          if (expiresAt < now) {
            return false;
          }
        }
        return true;
      });
      setJobs(activeJobs);
    } catch (err) {
      setError(err.message || "Failed to delete job. Please try again.");
    } finally {
      setDeleting((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const headingText = isPhotographer
    ? "Available Jobs"
    : isCustomer
    ? "Your Job Postings"
    : "Job Postings";

  const filteredJobs =
    isCustomer && user?.uid
      ? jobs.filter((job) => job.customerId === user.uid)
      : jobs;

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("fi-FI", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatDateRange = (dateRange) => {
    if (!dateRange || !dateRange.start) return "Not set";
    const start = new Date(dateRange.start);
    const end = dateRange.end ? new Date(dateRange.end) : null;
    const startStr = start.toLocaleDateString("fi-FI", { year: "numeric", month: "long", day: "numeric" });
    if (end) {
      const endStr = end.toLocaleDateString("fi-FI", { year: "numeric", month: "long", day: "numeric" });
      return `${startStr} - ${endStr}`;
    }
    return startStr;
  };

  const getServiceLabel = (service) => {
    const labels = {
      valokuvat: "Photos",
      videotuotanto: "Video Production",
      dronekuvat: "Drone Photos",
      dronevideo: "Drone Video",
      lyhytvideot: "Short Videos",
      editointi: "Editing Only",
    };
    return labels[service] || service;
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      perus: "Basic",
      keskitaso: "Intermediate",
      vaativa: "Advanced",
    };
    return labels[difficulty] || difficulty;
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1rem" }}>
      <h2 style={{ color: "#0F172A", marginBottom: "1rem" }}>{headingText}</h2>

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

      {!loading && !error && filteredJobs.length === 0 && (
        <p style={{ color: "#475569" }}>No jobs found.</p>
      )}

      {!loading && !error && filteredJobs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {filteredJobs.map((job) => (
            <div
              key={job.id || job.jobId}
              style={{
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                backgroundColor: "#FFFFFF",
              }}
            >
              {/* Services */}
              {job.services && job.services.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {job.services.map((service) => (
                      <span
                        key={service}
                        style={{
                          padding: "0.25rem 0.75rem",
                          backgroundColor: "#EFF6FF",
                          color: "#1E3A8A",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {getServiceLabel(service)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div style={{ marginBottom: "0.75rem" }}>
                <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
                  <strong style={{ color: "#0F172A" }}>Location:</strong> {job.city}
                  {job.area && `, ${job.area}`}
                  {job.radius && ` (${job.radius} km radius)`}
                  {job.allowFurther && " • Can offer from further away"}
                </p>
              </div>

              {/* Date & Duration */}
              <div style={{ marginBottom: "0.75rem" }}>
                <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
                  <strong style={{ color: "#0F172A" }}>Date:</strong>{" "}
                  {job.date
                    ? formatDate(job.date)
                    : job.dateRange
                    ? formatDateRange(job.dateRange)
                    : "Not set"}
                  {job.dateNotLocked && " (Not locked)"}
                </p>
                <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
                  <strong style={{ color: "#0F172A" }}>Duration:</strong> {job.duration || "Not set"}
                </p>
              </div>

              {/* Budget */}
              <div style={{ marginBottom: "0.75rem" }}>
                <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
                  <strong style={{ color: "#0F172A" }}>Budget:</strong>{" "}
                  {job.budgetUnknown
                    ? "I don't know"
                    : job.budgetMin && job.budgetMax
                    ? `€${job.budgetMin.toLocaleString()} - €${job.budgetMax.toLocaleString()}`
                    : "Not set"}
                </p>
              </div>

              {/* Difficulty & Priority */}
              <div style={{ marginBottom: "0.75rem" }}>
                <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
                  <strong style={{ color: "#0F172A" }}>Difficulty:</strong>{" "}
                  {job.difficulty ? getDifficultyLabel(job.difficulty) : "Not set"}
                  {job.difficultyDetails && ` - ${job.difficultyDetails}`}
                </p>
                {job.priority && job.priority.length > 0 && (
                  <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
                    <strong style={{ color: "#0F172A" }}>Priority:</strong>{" "}
                    {job.priority.join(", ")}
                  </p>
                )}
              </div>

              {/* Preferred Profile */}
              {job.preferredProfile && (
                <div style={{ marginBottom: "0.75rem" }}>
                  <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
                    <strong style={{ color: "#0F172A" }}>Preferred Profile:</strong>{" "}
                    {job.preferredProfile === "solo"
                      ? "Solo"
                      : job.preferredProfile === "2-3"
                      ? "2-3 people"
                      : job.preferredProfile === "tuotantoyhtiö"
                      ? "Production Company"
                      : "No preference"}
                  </p>
                </div>
              )}

              {/* Description */}
              <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#F8FAFC", borderRadius: "5px" }}>
                <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap", margin: 0 }}>
                  {job.description}
                </p>
              </div>

              {/* Service-specific details */}
              {job.services && job.services.includes("valokuvat") && job.photoSubjects && (
                <div style={{ marginBottom: "0.75rem", padding: "0.75rem", backgroundColor: "#F8FAFC", borderRadius: "5px" }}>
                  <p style={{ color: "#0F172A", fontSize: "13px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
                    Photos:
                  </p>
                  <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                    Subjects: {Array.isArray(job.photoSubjects) ? job.photoSubjects.join(", ") : job.photoSubjects}
                  </p>
                  {job.photoCount && (
                    <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                      Count: {job.photoCount}
                    </p>
                  )}
                  {job.photoEditing && (
                    <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                      Editing: {job.photoEditing}
                    </p>
                  )}
                </div>
              )}

              {job.services && job.services.includes("videotuotanto") && job.videoFormat && (
                <div style={{ marginBottom: "0.75rem", padding: "0.75rem", backgroundColor: "#F8FAFC", borderRadius: "5px" }}>
                  <p style={{ color: "#0F172A", fontSize: "13px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
                    Video Production:
                  </p>
                  {job.videoFormat && Array.isArray(job.videoFormat) && job.videoFormat.length > 0 && (
                    <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                      Format: {job.videoFormat.join(", ")}
                    </p>
                  )}
                  {job.videoLength && (
                    <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                      Length: {job.videoLength}
                    </p>
                  )}
                </div>
              )}

              {/* Reference Links */}
              {job.referenceLinks && job.referenceLinks.length > 0 && (
                <div style={{ marginBottom: "0.75rem" }}>
                  <p style={{ color: "#0F172A", fontSize: "13px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
                    Reference Links:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {job.referenceLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#1E3A8A",
                          fontSize: "13px",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status & Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #E2E8F0" }}>
                <div>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor:
                        job.status === "open"
                          ? "#D1FAE5"
                          : job.status === "accepted"
                          ? "#DBEAFE"
                          : "#FEE2E2",
                      color:
                        job.status === "open"
                          ? "#065F46"
                          : job.status === "accepted"
                          ? "#1E40AF"
                          : "#991B1B",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    {job.status === "open" ? "Open" : job.status === "accepted" ? "Accepted" : job.status}
                  </span>
                  {job.expiresAt && (
                    <span style={{ color: "#64748B", fontSize: "12px", marginLeft: "0.5rem" }}>
                      Expires: {formatDate(job.expiresAt)}
                    </span>
                  )}
                </div>

                {isPhotographer && job.status === "open" && (
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
                )}

                {isCustomer && (
                  <button
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: deleting[job.id || job.jobId] ? "#94A3B8" : "#EF4444",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: deleting[job.id || job.jobId] ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      opacity: deleting[job.id || job.jobId] ? 0.6 : 1,
                    }}
                    onClick={() => handleDeleteJob(job.id || job.jobId)}
                    disabled={deleting[job.id || job.jobId]}
                  >
                    {deleting[job.id || job.jobId] ? "Deleting..." : "Delete Request"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
