import { useNavigate } from "react-router-dom";
import { getUser, logout, isAuthenticated } from "../controllers/user";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import logo from "../assets/kuvauspalvelut-logo.png";

export const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();
  const authenticated = isAuthenticated();

  const isPhotographer = authenticated && user?.userType === "photographer";
  const isCustomer = authenticated && user?.userType === "customer";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      logout();
      navigate("/signin");
    }
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#1E3A8A", // Primary
        color: "white",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          style={{
            display: "inline-block",
            padding: "0.5rem",
            backgroundColor: "white",
            borderRadius: "8px",
            textDecoration: "none",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <img
            src={logo}
            alt="Kuvauspalvelut"
            style={{
              height: "40px",
              cursor: "pointer",
              objectFit: "contain",
              display: "block",
            }}
          />
        </a>

        {isCustomer && (
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "1px solid white",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/post-job")}
              style={{
                backgroundColor: "#F59E0B", // Accent/CTA
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F59E0B"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#F59E0B"}
            >
              Post Job
            </button>
            <button
              onClick={() => navigate("/jobs")}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "1px solid white",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              My Jobs
            </button>
            <button
              onClick={() => navigate("/view-bids")}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "1px solid white",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              View Bids
            </button>
          </div>
        )}

        {isPhotographer && (
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "1px solid white",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/jobs")}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "1px solid white",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Browse Jobs
            </button>
            <button
              onClick={() => navigate("/my-bids")}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "1px solid white",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              My Bids
            </button>
            <button
              onClick={() => navigate("/portfolio")}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "1px solid white",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Portfolio
            </button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {authenticated && user && (
          <>
            <span style={{ fontSize: "14px" }}>
              {user.name || user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "transparent",
                color: "white",
                border: "1px solid white",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;


