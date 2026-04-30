import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBidsForPhotographer } from "../controllers/jobs";
import { getUser, isAuthenticated } from "../controllers/user";
import { colors, shadow, radius, badge, btn } from "../styles/theme";

const statusVariant = (s) => s === "accepted" ? "success" : s === "rejected" ? "error" : "warning";
const statusLabel = (s) => s === "accepted" ? "Accepted" : s === "rejected" ? "Rejected" : "Pending";

export const MyBids = () => {
  const navigate = useNavigate();
  const [user] = useState(() => getUser());
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated() || !user || user.userType !== "photographer") navigate("/signin");
  }, [navigate, user]);

  useEffect(() => {
    if (!user || user.userType !== "photographer") { setLoading(false); return; }
    (async () => {
      try {
        setLoading(true);
        setBids(await fetchBidsForPhotographer());
      } catch (err) {
        setError(err.message || "Failed to load bids.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.uid]);

  if (!user || user.userType !== "photographer") return null;

  return (
    <div style={{ backgroundColor: colors.bgPage, minHeight: "100%", padding: "2.5rem 1.5rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "24px", color: colors.text, marginBottom: "0.25rem" }}>My Bids</h1>
          {!loading && (
            <p style={{ fontSize: "13px", color: colors.textMuted }}>
              {bids.length} {bids.length === 1 ? "bid" : "bids"} submitted
            </p>
          )}
        </div>

        {error && (
          <div style={{ backgroundColor: "#FEE2E2", color: "#991B1B", padding: "0.875rem 1rem", borderRadius: radius.sm, marginBottom: "1.5rem", fontSize: "14px" }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[1, 2].map((i) => <div key={i} style={{ height: "200px", backgroundColor: colors.bgCard, borderRadius: radius.lg, border: `1px solid ${colors.border}` }} />)}
          </div>
        )}

        {!loading && bids.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: colors.bgCard, borderRadius: radius.lg, border: `1px solid ${colors.border}` }}>
            <p style={{ color: colors.textMuted, fontSize: "15px", marginBottom: "1.5rem" }}>You haven't submitted any bids yet.</p>
            <button
              onClick={() => navigate("/jobs")}
              style={btn.primary}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
            >
              Browse Jobs
            </button>
          </div>
        )}

        {!loading && bids.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {bids.map((bid) => {
              const id = bid.id || bid.bidId;
              return (
                <div
                  key={id}
                  style={{
                    backgroundColor: colors.bgCard,
                    border: `1px solid ${bid.status === "accepted" ? "#6EE7B7" : colors.border}`,
                    borderRadius: radius.lg,
                    overflow: "hidden",
                    boxShadow: shadow.sm,
                  }}
                >
                  {/* Job context */}
                  {bid.job && (
                    <div style={{ backgroundColor: "#F8FAFC", borderBottom: `1px solid ${colors.border}`, padding: "0.875rem 1.5rem" }}>
                      <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "0.25rem", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.04em" }}>Job</p>
                      <p style={{ fontSize: "14px", color: colors.text, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {bid.job.description}
                      </p>
                      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                        {bid.job.city && <span style={{ fontSize: "12px", color: colors.textMuted }}>📍 {bid.job.city}</span>}
                        {bid.job.services?.length > 0 && <span style={{ fontSize: "12px", color: colors.textMuted }}>{bid.job.services.slice(0, 2).join(", ")}</span>}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <div>
                        <p style={{ fontSize: "12px", fontWeight: "600", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.25rem" }}>Your bid</p>
                        <p style={{ fontSize: "26px", fontWeight: "700", color: colors.text }}>€{bid.price}</p>
                      </div>
                      <span style={badge(statusVariant(bid.status))}>{statusLabel(bid.status)}</span>
                    </div>

                    {/* Proposal */}
                    <div style={{ backgroundColor: "#F8FAFC", borderRadius: radius.sm, padding: "1rem", marginBottom: "1rem" }}>
                      <p style={{ fontSize: "12px", fontWeight: "600", color: colors.textMuted, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Your proposal</p>
                      <p style={{ fontSize: "14px", color: colors.textSecondary, lineHeight: "1.65", whiteSpace: "pre-wrap" }}>{bid.proposal}</p>
                    </div>

                    {/* Customer contact on acceptance */}
                    {bid.status === "accepted" && bid.customerContact && (bid.customerContact.email || bid.customerContact.phone) && (
                      <div style={{ backgroundColor: colors.successBg, border: `1px solid #6EE7B7`, borderRadius: radius.sm, padding: "1rem" }}>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: colors.successText, marginBottom: "0.5rem" }}>
                          Customer Contact Details
                        </p>
                        {bid.customerContact.email && (
                          <p style={{ fontSize: "14px", color: colors.successText, marginBottom: "0.25rem" }}>
                            ✉ {bid.customerContact.email}
                          </p>
                        )}
                        {bid.customerContact.phone && (
                          <p style={{ fontSize: "14px", color: colors.successText }}>
                            📞 {bid.customerContact.phone}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBids;
