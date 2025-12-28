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
    <div style={{ maxWidth: "500px", margin: "4rem auto", padding: "2rem", backgroundColor: "#FFFFFF", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #E2E8F0" }}>
      <h1 style={{ color: "#0F172A", marginBottom: "2rem" }}>Sign In</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#0F172A", fontWeight: "600" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", color: "#0F172A", fontWeight: "600" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        </div>

        <button 
          type="submit"
          style={{
            width: "100%",
            padding: "0.75rem",
            fontSize: "16px",
            backgroundColor: "#1E3A8A",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "600",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1D4ED8"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1E3A8A"}
        >
          Sign In
        </button>
      </form>

      {!showUserTypeSelection ? (
        <button 
          type="button" 
          onClick={handleGoogleSignIn}
          style={{
            width: "100%",
            padding: "0.75rem",
            fontSize: "16px",
            backgroundColor: "#F59E0B",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Sign in with Google
        </button>
      ) : (
        <div>
          <h2 style={{ color: "#0F172A", marginBottom: "1.5rem" }}>Choose your account type:</h2>
          <button
            type="button"
            onClick={() => handleUserTypeSelection("photographer")}
            style={{
              width: "100%",
              margin: "0.5rem 0",
              padding: "0.75rem",
              fontSize: "16px",
              backgroundColor: "#1E3A8A",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "600",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1D4ED8"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1E3A8A"}
          >
            I'm a Photographer
          </button>
          <button
            type="button"
            onClick={() => handleUserTypeSelection("customer")}
            style={{
              width: "100%",
              margin: "0.5rem 0",
              padding: "0.75rem",
              fontSize: "16px",
              backgroundColor: "#1E3A8A",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "600",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1D4ED8"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1E3A8A"}
          >
            I'm a Customer
          </button>
          <button
            type="button"
            onClick={() => setShowUserTypeSelection(false)}
            style={{
              width: "100%",
              margin: "0.5rem 0",
              padding: "0.75rem",
              fontSize: "14px",
              backgroundColor: "transparent",
              color: "#475569",
              border: "1px solid #E2E8F0",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default SignIn;
