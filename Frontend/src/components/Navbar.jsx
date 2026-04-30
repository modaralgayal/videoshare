import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser, logout, isAuthenticated } from "../controllers/user";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import logo from "../assets/kuvauspalvelut-logo.png";
import { colors, shadow } from "../styles/theme";

const NavLink = ({ label, to, current }) => {
  const navigate = useNavigate();
  const active = current === to;
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        background: "none",
        border: "none",
        padding: "0.375rem 0.625rem",
        fontSize: "14px",
        fontWeight: active ? "600" : "500",
        color: active ? "white" : "rgba(255,255,255,0.75)",
        cursor: "pointer",
        borderRadius: "6px",
        transition: "color 0.15s, background-color 0.15s",
        backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = "white";
        if (!active) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.75)";
        if (!active) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {label}
    </button>
  );
};

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const authenticated = isAuthenticated();
  const isPhotographer = authenticated && user?.userType === "photographer";
  const isCustomer = authenticated && user?.userType === "customer";

  const handleLogout = async () => {
    try { await signOut(auth); } catch (_) {}
    logout();
    navigate("/signin");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.primary,
        color: "white",
        padding: "0 1.5rem",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        zIndex: 1000,
        gap: "1rem",
      }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate("/")}
        style={{
          background: "white",
          border: "none",
          borderRadius: "8px",
          padding: "4px 8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
      >
        <img src={logo} alt="Kuvauspalvelut" style={{ height: "36px", objectFit: "contain" }} />
      </button>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flex: 1 }}>
        {isCustomer && (
          <>
            <NavLink label="Dashboard" to="/" current={location.pathname} />
            <NavLink label="My Jobs" to="/jobs" current={location.pathname} />
            <NavLink label="Bids Received" to="/view-bids" current={location.pathname} />
          </>
        )}
        {isPhotographer && (
          <>
            <NavLink label="Dashboard" to="/" current={location.pathname} />
            <NavLink label="Browse Jobs" to="/jobs" current={location.pathname} />
            <NavLink label="My Bids" to="/my-bids" current={location.pathname} />
            <NavLink label="Portfolio" to="/portfolio" current={location.pathname} />
            <NavLink label="Profile" to="/photographer-profile" current={location.pathname} />
          </>
        )}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
        {authenticated && user ? (
          <>
            {isCustomer && (
              <button
                onClick={() => navigate("/post-job")}
                style={{
                  backgroundColor: colors.accent,
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accentHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.accent}
              >
                + Post Job
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name || user.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "6px",
                padding: "0.375rem 0.75rem",
                fontSize: "13px",
                color: "rgba(255,255,255,0.8)",
                cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                e.currentTarget.style.color = "rgba(255,255,255,0.8)";
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/signin")}
            style={{
              backgroundColor: colors.accent,
              color: "white",
              border: "none",
              padding: "0.5rem 1.25rem",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accentHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.accent}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
