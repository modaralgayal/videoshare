import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { makeBid } from "../controllers/jobs";
import { getUser, isAuthenticated } from "../controllers/user";
import { colors, shadow, radius, badge, btn, input } from "../styles/theme";

const SERVICE_LABELS = {
  valokuvat: "Photos", videotuotanto: "Video Production",
  dronekuvat: "Drone Photos", dronevideo: "Drone Video",
  lyhytvideot: "Short Videos", editointi: "Editing Only",
};
const DIFFICULTY_LABELS = { perus: "Basic", keskitaso: "Intermediate", vaativa: "Advanced" };

const formatDate = (d) => d ? new Date(d).toLocaleDateString("fi-FI", { year: "numeric", month: "short", day: "numeric" }) : "Not set";
const formatDateRange = (r) => {
  if (!r?.start) return "Not set";
  return r.end ? `${formatDate(r.start)} – ${formatDate(r.end)}` : formatDate(r.start);
};

export const MakeBid = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const job = location.state?.job;

  const [price, setPrice] = useState("");
  const [proposal, setProposal] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || !user || user.userType !== "photographer") { navigate("/signin"); return; }
    if (!job) navigate("/jobs");
  }, [navigate, user, job]);

  if (!job || !user || user.userType !== "photographer") return null;

  const canSubmit = confirmed && price && parseFloat(price) > 0 && proposal.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      await makeBid({ jobId: job.id || job.jobId, price: parseFloat(price), proposal: proposal.trim(), confirmedAllServices: true });
      setSuccess(true);
      setTimeout(() => navigate("/my-bids"), 1800);
    } catch (err) {
      setError(err.message || "Failed to submit bid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: colors.bgPage, minHeight: "100%", padding: "2.5rem 1.5rem" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        <button
          onClick={() => navigate("/jobs")}
          style={{ background: "none", border: "none", color: colors.textMuted, fontSize: "13px", cursor: "pointer", marginBottom: "1.5rem", padding: 0 }}
        >
          ← Back to jobs
        </button>

        <h1 style={{ fontSize: "24px", color: colors.text, marginBottom: "2rem" }}>Make a Bid</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>

          {/* Left: Job details */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: radius.lg, overflow: "hidden", boxShadow: shadow.sm }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${colors.border}`, backgroundColor: "#F8FAFC" }}>
              <h2 style={{ fontSize: "15px", color: colors.text }}>Job Details</h2>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* Services */}
              {job.services?.length > 0 && (
                <div>
                  <Label>Services requested</Label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.375rem" }}>
                    {job.services.map((s) => <span key={s} style={badge("default")}>{SERVICE_LABELS[s] || s}</span>)}
                  </div>
                </div>
              )}

              <InfoGrid rows={[
                ["Location", `${job.city}${job.area ? `, ${job.area}` : ""} · ${job.radius} km${job.allowFurther ? " (flexible)" : ""}`],
                ["Date", job.date ? formatDate(job.date) : formatDateRange(job.dateRange)],
                ["Duration", job.duration || "Not set"],
                ["Budget", job.budgetUnknown ? "Unspecified" : job.budgetMin && job.budgetMax ? `€${job.budgetMin.toLocaleString()} – €${job.budgetMax.toLocaleString()}` : "Not set"],
                ["Difficulty", DIFFICULTY_LABELS[job.difficulty] || job.difficulty],
              ]} />

              {/* Description */}
              <div>
                <Label>Description</Label>
                <p style={{ fontSize: "13px", color: colors.textSecondary, lineHeight: "1.65", marginTop: "0.375rem", whiteSpace: "pre-wrap" }}>{job.description}</p>
              </div>

              {/* Reference links */}
              {job.referenceLinks?.length > 0 && (
                <div>
                  <Label>References</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.375rem" }}>
                    {job.referenceLinks.map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "13px", color: colors.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p style={{ fontSize: "11px", color: colors.textMuted, borderTop: `1px solid ${colors.border}`, paddingTop: "0.75rem" }}>
                Exact address is revealed only after bid acceptance.
              </p>
            </div>
          </div>

          {/* Right: Bid form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {error && (
              <div style={{ backgroundColor: "#FEE2E2", color: "#991B1B", padding: "0.875rem 1rem", borderRadius: radius.sm, fontSize: "14px" }}>{error}</div>
            )}
            {success && (
              <div style={{ backgroundColor: colors.successBg, color: colors.successText, padding: "0.875rem 1rem", borderRadius: radius.sm, fontSize: "14px" }}>
                Bid submitted! Redirecting…
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* Confirmation */}
              <div style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: radius.sm, padding: "1rem" }}>
                <label style={{ display: "flex", gap: "0.75rem", cursor: "pointer", alignItems: "flex-start" }}>
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    style={{ marginTop: "2px", width: "16px", height: "16px", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: "13px", color: "#92400E", fontWeight: "500" }}>
                    I confirm I can deliver all requested services for this project.
                  </span>
                </label>
              </div>

              {/* Price */}
              <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: "1.25rem", boxShadow: shadow.sm }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "13px", fontWeight: "600", color: colors.text }}>
                  Your Price (€) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 750"
                  min="0"
                  step="0.01"
                  required
                  style={{ ...input }}
                  onFocus={(e) => e.target.style.borderColor = colors.primary}
                  onBlur={(e) => e.target.style.borderColor = colors.border}
                />
                {!job.budgetUnknown && job.budgetMin && job.budgetMax && (
                  <p style={{ fontSize: "12px", color: colors.textMuted, marginTop: "0.375rem" }}>
                    Client budget: €{job.budgetMin.toLocaleString()} – €{job.budgetMax.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Proposal */}
              <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: "1.25rem", boxShadow: shadow.sm }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "13px", fontWeight: "600", color: colors.text }}>
                  Proposal *
                </label>
                <textarea
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  placeholder="Describe how you would approach this project, your experience, availability…"
                  required
                  rows={7}
                  style={{ ...input, resize: "vertical", lineHeight: "1.6" }}
                  onFocus={(e) => e.target.style.borderColor = colors.primary}
                  onBlur={(e) => e.target.style.borderColor = colors.border}
                />
              </div>

              <div style={{ display: "flex", gap: "0.625rem" }}>
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  style={{
                    ...btn.primary,
                    flex: 1,
                    opacity: (!canSubmit || loading) ? 0.6 : 1,
                    cursor: (!canSubmit || loading) ? "not-allowed" : "pointer",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "0.75rem",
                  }}
                  onMouseEnter={(e) => { if (canSubmit && !loading) e.currentTarget.style.backgroundColor = colors.primaryHover; }}
                  onMouseLeave={(e) => { if (canSubmit && !loading) e.currentTarget.style.backgroundColor = colors.primary; }}
                >
                  {loading ? "Submitting…" : "Submit Bid"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/jobs")}
                  style={{ ...btn.ghost }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const Label = ({ children }) => (
  <p style={{ fontSize: "11px", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>{children}</p>
);

const InfoGrid = ({ rows }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem 1rem" }}>
    {rows.map(([label, value]) => (
      <div key={label}>
        <Label>{label}</Label>
        <p style={{ fontSize: "13px", color: colors.text, marginTop: "0.25rem" }}>{value}</p>
      </div>
    ))}
  </div>
);

export default MakeBid;
