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
    <>
      <h1>Sign In</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Sign In</button>
      </form>

      {!showUserTypeSelection ? (
        <button type="button" onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>
      ) : (
        <div>
          <h2>Choose your account type:</h2>
          <button
            type="button"
            onClick={() => handleUserTypeSelection("photographer")}
            style={{
              margin: "10px",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            I'm a Photographer
          </button>
          <button
            type="button"
            onClick={() => handleUserTypeSelection("customer")}
            style={{
              margin: "10px",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            I'm a Customer
          </button>
          <button
            type="button"
            onClick={() => setShowUserTypeSelection(false)}
            style={{
              margin: "10px",
              padding: "10px 20px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
};

export default SignIn;
