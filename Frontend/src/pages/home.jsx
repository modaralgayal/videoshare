import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connectToBackend, getUser } from "../controllers/user";

export const Home = () => {
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      // If not authenticated, redirect to sign in
      navigate("/signin");
      return;
    }

    connectToBackend()
      .then((res) => {
        console.log(res);
        setAnswer(res);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [navigate]);

  // Show loading or redirect if no user
  if (!user) {
    return null;
  }

  const isPhotographer = user.userType === "photographer";
  const isCustomer = user.userType === "customer";

  return (
    <>
      <div style={{ padding: "20px" }}>
        <h1 style={{ color: "#0F172A" }}>Welcome, {user.name || user.email}!</h1>

        {error && <div style={{ color: "#721c24", backgroundColor: "#f8d7da", padding: "10px", borderRadius: "5px", marginBottom: "1rem" }}>{error}</div>}
        {isPhotographer && (
          <div style={{ backgroundColor: "#FFFFFF", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginTop: "1rem" }}>
            <h2 style={{ color: "#0F172A" }}>Photographer Dashboard</h2>
            <p style={{ color: "#475569" }}>Welcome to your photographer dashboard! Here you can:</p>
            <ul>
              <li>View and manage your job applications</li>
              <li>Browse available jobs</li>
              <li>Update your portfolio</li>
              <li>Manage your profile settings</li>
            </ul>
            <div style={{ marginTop: "20px" }}>
              <button 
                onClick={() => navigate("/jobs")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1E3A8A",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                  fontSize: "16px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1D4ED8"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1E3A8A"}
              >
                Browse Available Jobs
              </button>
              <button 
                onClick={() => navigate("/my-bids")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1E3A8A",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                  fontSize: "16px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1D4ED8"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1E3A8A"}
              >
                My Bids
              </button>
              <button 
                onClick={() => navigate("/portfolio")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1E3A8A",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1D4ED8"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1E3A8A"}
              >
                Portfolio
              </button>
            </div>
          </div>
        )}

        {isCustomer && (
          <div style={{ backgroundColor: "#FFFFFF", padding: "2rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginTop: "1rem" }}>
            <h2 style={{ color: "#0F172A" }}>Customer Dashboard</h2>
            <p style={{ color: "#475569" }}>Welcome to your customer dashboard! Here you can:</p>
            <ul>
              <li>Post new job listings</li>
              <li>View your posted jobs</li>
              <li>Manage applications from photographers</li>
              <li>Review photographer profiles</li>
            </ul>
            <div style={{ marginTop: "20px" }}>
              <button 
                onClick={() => navigate("/jobs")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1E3A8A",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                  fontSize: "16px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1D4ED8"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1E3A8A"}
              >
                View My Jobs
              </button>
              <button 
                onClick={() => navigate("/post-job")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#F59E0B",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                  fontSize: "16px",
                  fontWeight: "600"
                }}
              >
                Post New Job
              </button>
              <button 
                onClick={() => navigate("/view-bids")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1E3A8A",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1D4ED8"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1E3A8A"}
              >
                View Bids
              </button>
            </div>
          </div>
        )}

        {!isPhotographer && !isCustomer && (
          <div>
            <h2>Welcome!</h2>
            <p>Your account type is not set. Please contact support.</p>
          </div>
        )}

        {answer && (
          <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "5px" }}>
            <p style={{ color: "#475569" }}>Backend connection: {answer}</p>
          </div>
        )}
      </div>
    </>
  );
};
