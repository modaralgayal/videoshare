import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../controllers/user";
import { colors, shadow, radius, card } from "../styles/theme";

const ActionCard = ({ title, description, cta, onClick, accent }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...card,
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? shadow.md : shadow.sm,
        borderTop: `3px solid ${accent || colors.primary}`,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <h3 style={{ fontSize: "16px", color: colors.text }}>{title}</h3>
      <p style={{ fontSize: "13px", color: colors.textSecondary, lineHeight: "1.6", flex: 1 }}>{description}</p>
      <span
        style={{
          marginTop: "0.75rem",
          fontSize: "13px",
          fontWeight: "600",
          color: accent || colors.primary,
        }}
      >
        {cta} →
      </span>
    </div>
  );
};

export const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      navigate("/signin");
    }
  }, [navigate]);

  if (!user) return null;

  const isPhotographer = user.userType === "photographer";
  const isCustomer = user.userType === "customer";
  const firstName = user.name?.split(" ")[0] || user.email;

  return (
    <div style={{ backgroundColor: colors.bgPage, minHeight: "100%", padding: "2.5rem 1.5rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Welcome header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "26px", color: colors.text, fontWeight: "700", marginBottom: "0.375rem" }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: "15px" }}>
            {isPhotographer
              ? "Find new projects and manage your bids."
              : "Post jobs and find the right photographer for your project."}
          </p>
        </div>

        {/* Action cards */}
        {isPhotographer && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            <ActionCard
              title="Browse Jobs"
              description="Explore available photography and videography projects posted by customers."
              cta="View jobs"
              onClick={() => navigate("/jobs")}
              accent={colors.primary}
            />
            <ActionCard
              title="My Bids"
              description="Track the status of all your submitted bids and see customer responses."
              cta="View bids"
              onClick={() => navigate("/my-bids")}
              accent="#7C3AED"
            />
            <ActionCard
              title="Portfolio"
              description="Showcase your best work. Upload photos and videos to attract more clients."
              cta="Manage portfolio"
              onClick={() => navigate("/portfolio")}
              accent={colors.accent}
            />
            <ActionCard
              title="Profile"
              description="Keep your profile up to date — services, pricing, equipment, and availability."
              cta="Edit profile"
              onClick={() => navigate("/photographer-profile")}
              accent="#059669"
            />
          </div>
        )}

        {isCustomer && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            <ActionCard
              title="Post a Job"
              description="Describe your photography needs and receive competitive bids from professionals."
              cta="Post now"
              onClick={() => navigate("/post-job")}
              accent={colors.accent}
            />
            <ActionCard
              title="My Jobs"
              description="View all your active job postings and manage your requests."
              cta="View jobs"
              onClick={() => navigate("/jobs")}
              accent={colors.primary}
            />
            <ActionCard
              title="Bids Received"
              description="Review bids from photographers, compare proposals and accept the best offer."
              cta="View bids"
              onClick={() => navigate("/view-bids")}
              accent="#7C3AED"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
