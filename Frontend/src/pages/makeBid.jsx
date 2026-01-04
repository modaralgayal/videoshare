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
  const [canCoverAllServices, setCanCoverAllServices] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Validation
    if (!canCoverAllServices) {
      setError("You must confirm that you can cover all requested services");
      setLoading(false);
      return;
    }

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
    <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ color: "#0F172A", marginBottom: "1.5rem" }}>Make a Bid</h1>

      {/* Comprehensive Job Information */}
      <div
        style={{
          padding: "2rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#0F172A", marginBottom: "1.5rem" }}>Job Details</h2>

        {/* Services */}
        {job.services && job.services.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ color: "#0F172A", fontSize: "16px", marginBottom: "0.5rem" }}>Requested Services</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {job.services.map((service) => (
                <span
                  key={service}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#EFF6FF",
                    color: "#1E3A8A",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {getServiceLabel(service)}
                </span>
              ))}
            </div>
            <p style={{ color: "#64748B", fontSize: "13px", marginTop: "0.5rem", fontStyle: "italic" }}>
              This job request is looking for one photographer who can handle all selected services.
            </p>
          </div>
        )}

        {/* Location */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ color: "#0F172A", fontSize: "16px", marginBottom: "0.5rem" }}>Location</h3>
          <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
            <strong>City:</strong> {job.city}
            {job.area && `, ${job.area}`}
          </p>
          <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
            <strong>Radius:</strong> {job.radius} km
            {job.allowFurther && " • Can offer from further away"}
          </p>
          <p style={{ color: "#64748B", fontSize: "12px", marginTop: "0.5rem", fontStyle: "italic" }}>
            Exact address will be provided after bid acceptance.
          </p>
        </div>

        {/* Date & Duration */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ color: "#0F172A", fontSize: "16px", marginBottom: "0.5rem" }}>Timing</h3>
          <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
            <strong>Date:</strong>{" "}
            {job.date
              ? formatDate(job.date)
              : job.dateRange
              ? formatDateRange(job.dateRange)
              : "Not set"}
            {job.dateNotLocked && " (Not locked)"}
          </p>
          <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
            <strong>Duration:</strong> {job.duration || "Not set"}
          </p>
        </div>

        {/* Budget */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ color: "#0F172A", fontSize: "16px", marginBottom: "0.5rem" }}>Budget</h3>
          <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
            {job.budgetUnknown
              ? "Budget: I don't know"
              : job.budgetMin && job.budgetMax
              ? `Budget Range: €${job.budgetMin.toLocaleString()} - €${job.budgetMax.toLocaleString()}`
              : "Budget: Not set"}
          </p>
        </div>

        {/* Difficulty & Priority */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ color: "#0F172A", fontSize: "16px", marginBottom: "0.5rem" }}>Project Details</h3>
          <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
            <strong>Difficulty:</strong> {job.difficulty ? getDifficultyLabel(job.difficulty) : "Not set"}
            {job.difficultyDetails && ` - ${job.difficultyDetails}`}
          </p>
          {job.priority && job.priority.length > 0 && (
            <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
              <strong>Priority:</strong> {job.priority.join(", ")}
            </p>
          )}
          {job.preferredProfile && (
            <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
              <strong>Preferred Profile:</strong>{" "}
              {job.preferredProfile === "solo"
                ? "Solo"
                : job.preferredProfile === "2-3"
                ? "2-3 people"
                : job.preferredProfile === "tuotantoyhtiö"
                ? "Production Company"
                : "No preference"}
            </p>
          )}
        </div>

        {/* Service-specific details */}
        {job.services && job.services.includes("valokuvat") && job.photoSubjects && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#F8FAFC", borderRadius: "5px" }}>
            <h4 style={{ color: "#0F172A", fontSize: "14px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
              Photos Details:
            </h4>
            <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
              Subjects: {Array.isArray(job.photoSubjects) ? job.photoSubjects.join(", ") : job.photoSubjects}
            </p>
            {job.photoCount && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Estimated Count: {job.photoCount}
              </p>
            )}
            {job.photoEditing && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Editing Level: {job.photoEditing}
              </p>
            )}
            {job.photoUsage && job.photoUsage.length > 0 && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Usage: {job.photoUsage.join(", ")}
              </p>
            )}
            {job.photoDetails && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0", whiteSpace: "pre-wrap" }}>
                {job.photoDetails}
              </p>
            )}
          </div>
        )}

        {job.services && job.services.includes("videotuotanto") && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#F8FAFC", borderRadius: "5px" }}>
            <h4 style={{ color: "#0F172A", fontSize: "14px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
              Video Production Details:
            </h4>
            {job.videoFormat && Array.isArray(job.videoFormat) && job.videoFormat.length > 0 && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Format: {job.videoFormat.join(", ")}
              </p>
            )}
            {job.videoLength && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Target Length: {job.videoLength}
              </p>
            )}
            {job.videoCount && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Number of Videos: {job.videoCount}
              </p>
            )}
            {job.videoNeeds && job.videoNeeds.length > 0 && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Needs: {job.videoNeeds.join(", ")}
              </p>
            )}
            {job.videoUsage && job.videoUsage.length > 0 && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Usage: {job.videoUsage.join(", ")}
              </p>
            )}
            {job.videoDetails && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0", whiteSpace: "pre-wrap" }}>
                {job.videoDetails}
              </p>
            )}
          </div>
        )}

        {(job.services && (job.services.includes("dronekuvat") || job.services.includes("dronevideo"))) && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#F8FAFC", borderRadius: "5px" }}>
            <h4 style={{ color: "#0F172A", fontSize: "14px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
              Drone Details:
            </h4>
            {job.droneSubject && Array.isArray(job.droneSubject) && job.droneSubject.length > 0 && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Subject: {job.droneSubject.join(", ")}
              </p>
            )}
            {job.droneRestriction && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Restricted Environment: {job.droneRestriction === "en_tiedä" ? "I don't know" : job.droneRestriction === "kyllä" ? "Yes" : "No"}
              </p>
            )}
            {job.droneDetails && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0", whiteSpace: "pre-wrap" }}>
                {job.droneDetails}
              </p>
            )}
          </div>
        )}

        {job.services && job.services.includes("lyhytvideot") && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#F8FAFC", borderRadius: "5px" }}>
            <h4 style={{ color: "#0F172A", fontSize: "14px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
              Short Videos Details:
            </h4>
            {job.shortVideoChannels && job.shortVideoChannels.length > 0 && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Channels: {job.shortVideoChannels.join(", ")}
              </p>
            )}
            {job.shortVideoWhoFilms && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Who Films: {job.shortVideoWhoFilms === "tekijä" ? "Photographer" : job.shortVideoWhoFilms === "asiakas" ? "Customer films, photographer edits" : "Hybrid"}
              </p>
            )}
            {job.shortVideoFrequency && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Frequency: {job.shortVideoFrequency === "kertaluonteinen" ? "One-time" : "Regular"}
              </p>
            )}
            {job.shortVideoCount && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Video Count: {job.shortVideoCount}
              </p>
            )}
            {job.shortVideoContractMonths && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Contract Period: {job.shortVideoContractMonths} months
              </p>
            )}
            {job.shortVideoStyle && job.shortVideoStyle.length > 0 && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Style: {job.shortVideoStyle.join(", ")}
              </p>
            )}
            {job.shortVideoDetails && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0", whiteSpace: "pre-wrap" }}>
                {job.shortVideoDetails}
              </p>
            )}
          </div>
        )}

        {job.services && job.services.includes("editointi") && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#F8FAFC", borderRadius: "5px" }}>
            <h4 style={{ color: "#0F172A", fontSize: "14px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
              Editing Details:
            </h4>
            {job.editingSource && job.editingSource.length > 0 && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Material Source: {job.editingSource.join(", ")}
              </p>
            )}
            {job.editingFormat && job.editingFormat.length > 0 && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0" }}>
                Delivery Format: {job.editingFormat.join(", ")}
              </p>
            )}
            {job.editingDetails && (
              <p style={{ color: "#475569", fontSize: "13px", margin: "0.25rem 0", whiteSpace: "pre-wrap" }}>
                {job.editingDetails}
              </p>
            )}
          </div>
        )}

        {/* Description */}
        <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#F8FAFC", borderRadius: "5px" }}>
          <h3 style={{ color: "#0F172A", fontSize: "16px", marginBottom: "0.5rem" }}>Project Description</h3>
          <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap", margin: 0 }}>
            {job.description}
          </p>
        </div>

        {/* Reference Links */}
        {job.referenceLinks && job.referenceLinks.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ color: "#0F172A", fontSize: "16px", marginBottom: "0.5rem" }}>Reference Links</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {job.referenceLinks.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#1E3A8A",
                    fontSize: "14px",
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

        {/* Status */}
        <div style={{ paddingTop: "1rem", borderTop: "1px solid #E2E8F0" }}>
          <p style={{ color: "#475569", fontSize: "14px", margin: "0.25rem 0" }}>
            <strong>Status:</strong>{" "}
            <span
              style={{
                padding: "0.25rem 0.75rem",
                backgroundColor: job.status === "open" ? "#D1FAE5" : "#DBEAFE",
                color: job.status === "open" ? "#065F46" : "#1E40AF",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              {job.status === "open" ? "Open" : job.status}
            </span>
          </p>
        </div>
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
        {/* Service Coverage Confirmation */}
        <div style={{ padding: "1rem", backgroundColor: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "5px" }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={canCoverAllServices}
              onChange={(e) => setCanCoverAllServices(e.target.checked)}
              style={{ marginTop: "0.25rem", width: "18px", height: "18px" }}
              required
            />
            <span style={{ color: "#92400E", fontSize: "14px", fontWeight: "500" }}>
              Vahvistan, että pystyn toteuttamaan kaikki pyydetyt osa-alueet. (I confirm that I can cover all requested services.) *
            </span>
          </label>
        </div>

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
          {!job.budgetUnknown && job.budgetMin && job.budgetMax && (
            <small
              style={{ color: "#475569", marginTop: "0.25rem", display: "block" }}
            >
              Budget range: €{job.budgetMin.toLocaleString()} – €{job.budgetMax.toLocaleString()}
            </small>
          )}
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
  );
};
