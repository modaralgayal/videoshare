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
        <h1>Welcome, {user.name || user.email}!</h1>

        {error && <div style={{ color: "red", padding: "10px" }}>{error}</div>}
        {isPhotographer && (
          <div>
            <h2>Photographer Dashboard</h2>
            <p>Welcome to your photographer dashboard! Here you can:</p>
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
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                  fontSize: "16px"
                }}
              >
                Browse Available Jobs
              </button>
            </div>
          </div>
        )}

        {isCustomer && (
          <div>
            <h2>Customer Dashboard</h2>
            <p>Welcome to your customer dashboard! Here you can:</p>
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
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                  fontSize: "16px"
                }}
              >
                View My Jobs
              </button>
              <button 
                onClick={() => navigate("/post-job")}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Post New Job
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
          <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "5px" }}>
            <p>Backend connection: {answer}</p>
          </div>
        )}
      </div>
    </>
  );
};
