import { useEffect, useState } from "react";
import { fetchJobs, deleteJob } from "../controllers/jobs";
import { getUser } from "../controllers/user";
import { useNavigate } from "react-router-dom";
import { colors, shadow, radius, badge, btn } from "../styles/theme";

const SERVICE_LABELS = {
  valokuvat: "Photos",
  videotuotanto: "Video Production",
  dronekuvat: "Drone Photos",
  dronevideo: "Drone Video",
  lyhytvideot: "Short Videos",
  editointi: "Editing Only",
};

const DIFFICULTY_LABELS = {
  perus: "Basic",
  keskitaso: "Intermediate",
  vaativa: "Advanced",
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString("fi-FI", { year: "numeric", month: "short", day: "numeric" }) : "Not set";
const formatDateRange = (r) => {
  if (!r?.start) return "Not set";
  const s = formatDate(r.start);
  return r.end ? `${s} – ${formatDate(r.end)}` : s;
};

const JobCard = ({ job, isPhotographer, isCustomer, onBid, onDelete, deleting }) => {
  const [hovered, setHovered] = useState(false);
  const id = job.id || job.jobId;

  const statusVariant = job.status === "open" ? "success" : job.status === "accepted" ? "default" : "muted";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.lg,
        padding: "1.5rem",
        boxShadow: hovered ? shadow.md : shadow.sm,
        transition: "box-shadow 0.15s, transform 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      {/* Services */}
      {job.services?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "1rem" }}>
          {job.services.map((s) => (
            <span key={s} style={badge("default")}>{SERVICE_LABELS[s] || s}</span>
          ))}
        </div>
      )}

      {/* Description */}
      <p style={{ color: colors.textSecondary, fontSize: "14px", lineHeight: "1.65", marginBottom: "1.25rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {job.description}
      </p>

      {/* Info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.5rem 1.5rem", marginBottom: "1.25rem" }}>
        <InfoRow label="Location" value={`${job.city}${job.area ? `, ${job.area}` : ""} · ${job.radius} km`} />
        <InfoRow label="Date" value={job.date ? formatDate(job.date) : formatDateRange(job.dateRange)} />
        <InfoRow label="Duration" value={job.duration || "Not set"} />
        <InfoRow
          label="Budget"
          value={
            job.budgetUnknown ? "Unspecified"
            : job.budgetMin && job.budgetMax ? `€${job.budgetMin.toLocaleString()} – €${job.budgetMax.toLocaleString()}`
            : "Not set"
          }
        />
        <InfoRow label="Difficulty" value={DIFFICULTY_LABELS[job.difficulty] || job.difficulty || "Not set"} />
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: `1px solid ${colors.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={badge(statusVariant)}>
            {job.status === "open" ? "Open" : job.status === "accepted" ? "Accepted" : job.status}
          </span>
          {job.expiresAt && (
            <span style={{ color: colors.textMuted, fontSize: "12px" }}>
              Expires {formatDate(job.expiresAt)}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {isPhotographer && job.status === "open" && (
            <button
              onClick={onBid}
              style={{ ...btn.accent, fontSize: "13px", padding: "0.5rem 1rem" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accentHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.accent}
            >
              Make a Bid
            </button>
          )}
          {isCustomer && (
            <button
              onClick={onDelete}
              disabled={deleting}
              style={{
                ...btn.danger,
                fontSize: "13px",
                padding: "0.5rem 1rem",
                opacity: deleting ? 0.6 : 1,
                cursor: deleting ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.backgroundColor = "#B91C1C"; }}
              onMouseLeave={(e) => { if (!deleting) e.currentTarget.style.backgroundColor = colors.error; }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <span style={{ fontSize: "11px", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
    <p style={{ fontSize: "13px", color: colors.text, marginTop: "0.125rem" }}>{value}</p>
  </div>
);

export const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState({});
  const navigate = useNavigate();
  const user = getUser();
  const isPhotographer = user?.userType === "photographer";
  const isCustomer = user?.userType === "customer";

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchJobs();
      const now = new Date();
      setJobs(data.filter((j) => j.status !== "expired" && (!j.expiresAt || new Date(j.expiresAt) >= now)));
    } catch (err) {
      setError(err.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job request? This cannot be undone.")) return;
    setDeleting((p) => ({ ...p, [jobId]: true }));
    try {
      await deleteJob(jobId);
      await loadJobs();
    } catch (err) {
      setError(err.message || "Failed to delete job.");
    } finally {
      setDeleting((p) => ({ ...p, [jobId]: false }));
    }
  };

  const filteredJobs = isCustomer && user?.uid ? jobs.filter((j) => j.customerId === user.uid) : jobs;
  const heading = isPhotographer ? "Available Jobs" : isCustomer ? "Your Job Postings" : "Job Postings";

  return (
    <div style={{ backgroundColor: colors.bgPage, minHeight: "100%", padding: "2.5rem 1.5rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "24px", color: colors.text, marginBottom: "0.25rem" }}>{heading}</h1>
            {!loading && (
              <p style={{ fontSize: "13px", color: colors.textMuted }}>
                {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"} found
              </p>
            )}
          </div>
          {isCustomer && (
            <button
              onClick={() => navigate("/post-job")}
              style={{ ...btn.accent, padding: "0.625rem 1.25rem" }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accentHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.accent}
            >
              + Post a Job
            </button>
          )}
        </div>

        {error && (
          <div style={{ backgroundColor: "#FEE2E2", color: "#991B1B", padding: "0.875rem 1rem", borderRadius: radius.sm, marginBottom: "1.5rem", fontSize: "14px" }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: "200px", backgroundColor: colors.bgCard, borderRadius: radius.lg, border: `1px solid ${colors.border}` }} />
            ))}
          </div>
        )}

        {!loading && filteredJobs.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: colors.bgCard, borderRadius: radius.lg, border: `1px solid ${colors.border}` }}>
            <p style={{ color: colors.textMuted, fontSize: "15px", marginBottom: "1.5rem" }}>
              {isCustomer ? "You haven't posted any jobs yet." : "No jobs available right now."}
            </p>
            {isCustomer && (
              <button
                onClick={() => navigate("/post-job")}
                style={{ ...btn.accent }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accentHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.accent}
              >
                Post your first job
              </button>
            )}
          </div>
        )}

        {!loading && filteredJobs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredJobs.map((job) => {
              const id = job.id || job.jobId;
              return (
                <JobCard
                  key={id}
                  job={job}
                  isPhotographer={isPhotographer}
                  isCustomer={isCustomer}
                  onBid={() => navigate("/make-bid", { state: { job } })}
                  onDelete={() => handleDelete(id)}
                  deleting={!!deleting[id]}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
