import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser, logout, isAuthenticated } from "../controllers/user";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import logo from "../assets/kuvauspalvelut-logo.png";
import { colors } from "../styles/theme";
import "./Navbar.css";

const NavLink = ({ label, to, current, onClick }) => {
  const navigate = useNavigate();
  const active = current === to;
  return (
    <button
      onClick={() => {
        navigate(to);
        if (onClick) onClick();
      }}
      className="nav-link"
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
        textAlign: "left"
      }}
    >
      {label}
    </button>
  );
};

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);
  };

  const navLinks = (
    <>
      {isCustomer && (
        <>
          <NavLink label="Dashboard" to="/" current={location.pathname} onClick={() => setIsOpen(false)} />
          <NavLink label="My Jobs" to="/jobs" current={location.pathname} onClick={() => setIsOpen(false)} />
          <NavLink label="Bids Received" to="/view-bids" current={location.pathname} onClick={() => setIsOpen(false)} />
        </>
      )}
      {isPhotographer && (
        <>
          <NavLink label="Dashboard" to="/" current={location.pathname} onClick={() => setIsOpen(false)} />
          <NavLink label="Browse Jobs" to="/jobs" current={location.pathname} onClick={() => setIsOpen(false)} />
          <NavLink label="My Bids" to="/my-bids" current={location.pathname} onClick={() => setIsOpen(false)} />
          <NavLink label="Portfolio" to="/portfolio" current={location.pathname} onClick={() => setIsOpen(false)} />
          <NavLink label="Profile" to="/photographer-profile" current={location.pathname} onClick={() => setIsOpen(false)} />
        </>
      )}
    </>
  );

  return (
    <nav className="navbar">
      <button
        onClick={() => { navigate("/"); setIsOpen(false); }}
        style={{
          background: "white",
          border: "none",
          borderRadius: "8px",
          padding: "4px 8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <img src={logo} alt="Kuvauspalvelut" style={{ height: "36px", objectFit: "contain" }} />
      </button>

      <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      <div className="nav-links">
        {navLinks}
      </div>

      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        {navLinks}
        {authenticated && (
           <button onClick={handleLogout} style={{ color: "white", background: "none", border: "none", padding: "0.5rem", textAlign: "left" }}>Logout</button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }} className="desktop-only">
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
                }}
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
                }}
              >
                {user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "6px",
                padding: "0.375rem 0.75rem",
                color: "white",
                cursor: "pointer",
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
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
