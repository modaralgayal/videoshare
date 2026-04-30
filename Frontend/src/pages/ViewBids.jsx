import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBidsForCustomer, updateBidStatus } from "../controllers/jobs";
import { getUser, isAuthenticated } from "../controllers/user";
import { colors, shadow, radius, badge, btn } from "../styles/theme";

const statusVariant = (s) => s === "accepted" ? "success" : s === "rejected" ? "error" : "warning";
const statusLabel = (s) => s === "accepted" ? "Accepted" : s === "rejected" ? "Rejected" : "Pending";

export const ViewBids = () => {
  const navigate = useNavigate();
  const [user] = useState(() => getUser());
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (!isAuthenticated() || !user || user.userType !== "customer") navigate("/signin");
  }, [navigate, user]);

  const loadBids = useCallback(async () => {
    if (!user || user.userType !== "customer") { setLoading(false); return; }
    try {
      setLoading(true);
      setError("");
      setBids(await fetchBidsForCustomer());
    } catch (err) {
      setError(err.message || "Failed to load bids.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadBids(); }, [loadBids]);

  const handleStatusUpdate = async (bidId, status) => {
    setUpdating((p) => ({ ...p, [bidId]: status }));
    try {
      await updateBidStatus(bidId, status);
      await loadBids();
    } catch (err) {
      setError(err.message || `Failed to ${status} bid.`);
    } finally {
      setUpdating((p) => ({ ...p, [bidId]: null }));
    }
  };

  if (!user || user.userType !== "customer") return null;

  return (
    <div style={{ backgroundColor: colors.bgPage, minHeight: "100%", padding: "2.5rem 1.5rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "24px", color: colors.text, marginBottom: "0.25rem" }}>Bids Received</h1>
          {!loading && (
            <p style={{ fontSize: "13px", color: colors.textMuted }}>
              {bids.length} {bids.length === 1 ? "bid" : "bids"} received
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
            {[1, 2].map((i) => <div key={i} style={{ height: "220px", backgroundColor: colors.bgCard, borderRadius: radius.lg, border: `1px solid ${colors.border}` }} />)}
          </div>
        )}

        {!loading && bids.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: colors.bgCard, borderRadius: radius.lg, border: `1px solid ${colors.border}` }}>
            <p style={{ color: colors.textMuted, fontSize: "15px", marginBottom: "1.5rem" }}>No bids received yet. Post a job to start receiving bids.</p>
            <button
              onClick={() => navigate("/post-job")}
              style={btn.accent}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accentHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.accent}
            >
              Post a Job
            </button>
          </div>
        )}

        {!loading && bids.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {bids.map((bid) => {
              const id = bid.id || bid.bidId;
              const isUpdating = !!updating[id];
              return (
                <div
                  key={id}
                  style={{
                    backgroundColor: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.lg,
                    overflow: "hidden",
                    boxShadow: shadow.sm,
                  }}
                >
                  {/* Job context bar */}
                  {bid.job && (
                    <div style={{ backgroundColor: "#F8FAFC", borderBottom: `1px solid ${colors.border}`, padding: "0.875rem 1.5rem" }}>
                      <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "0.25rem", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.04em" }}>Job</p>
                      <p style={{ fontSize: "14px", color: colors.text, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {bid.job.description}
                      </p>
                    </div>
                  )}

                  <div style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", gap: "1rem" }}>
                      {/* Photographer info */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                          width: "40px", height: "40px", borderRadius: "50%",
                          backgroundColor: "#EFF6FF",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "14px", fontWeight: "600", color: colors.primary, flexShrink: 0,
                        }}>
                          {bid.photographer?.name?.[0] || "P"}
                        </div>
                        <div>
                          <p style={{ fontSize: "14px", fontWeight: "600", color: colors.text }}>{bid.photographer?.name || "Photographer"}</p>
                          <button
                            onClick={() => navigate(`/photographer/${bid.videographerId}/profile`)}
                            style={{ background: "none", border: "none", padding: 0, fontSize: "12px", color: colors.primary, cursor: "pointer" }}
                          >
                            View profile →
                          </button>
                        </div>
                      </div>

                      {/* Price + status */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: "22px", fontWeight: "700", color: colors.text }}>€{bid.price}</p>
                        <span style={badge(statusVariant(bid.status))}>{statusLabel(bid.status)}</span>
                      </div>
                    </div>

                    {/* Proposal */}
                    <div style={{ backgroundColor: "#F8FAFC", borderRadius: radius.sm, padding: "1rem", marginBottom: "1.25rem" }}>
                      <p style={{ fontSize: "12px", fontWeight: "600", color: colors.textMuted, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Proposal</p>
                      <p style={{ fontSize: "14px", color: colors.textSecondary, lineHeight: "1.65", whiteSpace: "pre-wrap" }}>{bid.proposal}</p>
                    </div>

                    {/* Actions */}
                    {bid.status === "pending" && (
                      <div style={{ display: "flex", gap: "0.625rem" }}>
                        <button
                          onClick={() => handleStatusUpdate(id, "accepted")}
                          disabled={isUpdating}
                          style={{ ...btn.accent, opacity: isUpdating ? 0.7 : 1 }}
                          onMouseEnter={(e) => { if (!isUpdating) e.currentTarget.style.backgroundColor = colors.accentHover; }}
                          onMouseLeave={(e) => { if (!isUpdating) e.currentTarget.style.backgroundColor = colors.accent; }}
                        >
                          {updating[id] === "accepted" ? "Accepting…" : "Accept Bid"}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(id, "rejected")}
                          disabled={isUpdating}
                          style={{ ...btn.ghost, opacity: isUpdating ? 0.7 : 1 }}
                        >
                          {updating[id] === "rejected" ? "Rejecting…" : "Reject"}
                        </button>
                      </div>
                    )}

                    {bid.status !== "pending" && (
                      <p style={{ fontSize: "13px", color: colors.textMuted, fontStyle: "italic" }}>
                        {bid.status === "accepted" ? "You accepted this bid." : "You rejected this bid."}
                      </p>
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

export default ViewBids;
