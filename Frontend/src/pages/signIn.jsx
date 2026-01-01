import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { googleSignIn, authenticateWithBackend, isAuthenticated } from "../controllers/user";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState(""); // "photographer" or "customer"
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  const handleGoogleSignIn = async () => {
    try {
      // First, show user type selection
      setShowUserTypeSelection(true);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUserTypeSelection = async (selectedType) => {
    try {
      setUserType(selectedType);
      
      // Now proceed with Google sign-in
      const { user, idToken } = await googleSignIn();

      // Authenticate with backend and get JWT token
      const data = await authenticateWithBackend(idToken, selectedType);

      console.log("Authentication successful:", data.user);
      
      // Reset state
      setShowUserTypeSelection(false);
      setUserType("");

      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert(error.message || "Authentication failed");
      setShowUserTypeSelection(false);
      setUserType("");
    }
  };

  return (
    <div style={{ 
      minHeight: "100%", 
      backgroundColor: "#F8FAFC",
      margin: 0,
      padding: 0,
      width: "100%",
      maxWidth: "100%",
      display: "flex",
      flexDirection: "column",
      flex: 1,
      marginTop: "73px",
    }}>
      {/* Hero Section */}
      <section
        style={{
          background: "#1E3A8A",
          color: "white",
          padding: "clamp(3rem, 5vw, 4rem) 2rem",
          textAlign: "center",
          width: "100%",
          margin: 0,
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: "700",
            marginBottom: "1rem",
            lineHeight: "1.2",
            maxWidth: "900px",
            margin: "0 auto 1rem",
          }}
        >
          Connect with Professional Photographers
        </h1>
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            marginBottom: "2rem",
            opacity: 0.95,
            maxWidth: "700px",
            margin: "0 auto 2rem",
          }}
        >
          Find the perfect photographer for your event or browse exciting job opportunities as a professional photographer.
        </p>
      </section>

      {/* Main Content */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "clamp(2rem, 4vw, 4rem)",
          alignItems: "start",
          flex: 1,
        }}
      >
        {/* Left Side - How It Works */}
        <div>
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              color: "#0F172A",
              marginBottom: "2rem",
            }}
          >
            How It Works
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            <div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#1E3A8A",
                  marginBottom: "1rem",
                }}
              >
                For Customers
              </h3>
              <div
                style={{
                  color: "#475569",
                  lineHeight: "1.8",
                  fontSize: "16px",
                }}
              >
                <p style={{ marginBottom: "1rem" }}>
                  [Placeholder text: Describe how customers can post their photography needs, 
                  receive bids from professional photographers, compare portfolios, and manage their projects. 
                  This content will be customized later.]
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  [Additional placeholder: Explain the bidding process, how to review photographer profiles, 
                  and the benefits of using the platform for finding the perfect photographer for your event or project.]
                </p>
              </div>
            </div>
            <div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#1E3A8A",
                  marginBottom: "1rem",
                }}
              >
                For Photographers
              </h3>
              <div
                style={{
                  color: "#475569",
                  lineHeight: "1.8",
                  fontSize: "16px",
                }}
              >
                <p style={{ marginBottom: "1rem" }}>
                  [Placeholder text: Describe how photographers can browse available jobs, 
                  showcase their portfolio with images and videos, submit competitive bids, 
                  and grow their photography business through the platform.]
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  [Additional placeholder: Explain the portfolio features, bidding process, 
                  and how photographers can connect with potential clients and build their reputation.]
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "2.5rem",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            border: "1px solid #E2E8F0",
          }}
        >
          <h2
            style={{
              color: "#0F172A",
              marginBottom: "1.5rem",
              fontSize: "1.75rem",
              fontWeight: "600",
            }}
          >
            Get Started
          </h2>

          {!showUserTypeSelection ? (
            <>
              <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#0F172A",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      fontSize: "16px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      boxSizing: "border-box",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#1E3A8A")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#0F172A",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      fontSize: "16px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      boxSizing: "border-box",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#1E3A8A")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "0.875rem",
                    fontSize: "16px",
                    backgroundColor: "#1E3A8A",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1D4ED8")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1E3A8A")}
                >
                  Sign In
                </button>
              </form>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    backgroundColor: "#E2E8F0",
                  }}
                />
                <span style={{ color: "#94A3B8", fontSize: "14px" }}>or</span>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    backgroundColor: "#E2E8F0",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                style={{
                  width: "100%",
                  padding: "0.875rem",
                  fontSize: "16px",
                  backgroundColor: "#F59E0B",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D97706")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F59E0B")}
              >
                Sign in with Google
              </button>
            </>
          ) : (
            <div>
              <h3
                style={{
                  color: "#0F172A",
                  marginBottom: "1.5rem",
                  fontSize: "1.25rem",
                  fontWeight: "600",
                }}
              >
                Choose your account type:
              </h3>
              <button
                type="button"
                onClick={() => handleUserTypeSelection("photographer")}
                style={{
                  width: "100%",
                  margin: "0.75rem 0",
                  padding: "0.875rem",
                  fontSize: "16px",
                  backgroundColor: "#1E3A8A",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1D4ED8")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1E3A8A")}
              >
                I'm a Photographer
              </button>
              <button
                type="button"
                onClick={() => handleUserTypeSelection("customer")}
                style={{
                  width: "100%",
                  margin: "0.75rem 0",
                  padding: "0.875rem",
                  fontSize: "16px",
                  backgroundColor: "#1E3A8A",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1D4ED8")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1E3A8A")}
              >
                I'm a Customer
              </button>
              <button
                type="button"
                onClick={() => setShowUserTypeSelection(false)}
                style={{
                  width: "100%",
                  margin: "0.75rem 0",
                  padding: "0.875rem",
                  fontSize: "14px",
                  backgroundColor: "transparent",
                  color: "#475569",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#94A3B8";
                  e.currentTarget.style.color = "#0F172A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.color = "#475569";
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SignIn;
