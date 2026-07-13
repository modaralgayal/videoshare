import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { googleSignIn, authenticateWithBackend, isAuthenticated } from "../controllers/user";
import { colors, shadow, radius, btn, input } from "../styles/theme";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const navigate = useNavigate();

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
    setShowUserTypeSelection(true);
  };

  const handleUserTypeSelection = async (selectedType) => {
    try {
      setSigningIn(true);
      setUserType(selectedType);

      const { idToken } = await googleSignIn();
      const data = await authenticateWithBackend(idToken, selectedType);

      console.log("Authentication successful:", data.user);

      setShowUserTypeSelection(false);
      setUserType("");
      setSigningIn(false);
      navigate("/");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert(error.message || "Authentication failed");
      setShowUserTypeSelection(false);
      setUserType("");
      setSigningIn(false);
    }
  };

  return (
    <div style={{ minHeight: "100%", backgroundColor: colors.bgPage, width: "100%" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #2563EB 100%)",
          color: "white",
          padding: "clamp(3.5rem, 6vw, 5rem) 2rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px",
          borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-120px", left: "-60px", width: "400px", height: "400px",
          borderRadius: "50%", background: "rgba(255,255,255,0.02)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "50%", right: "15%", width: "8px", height: "8px",
          borderRadius: "50%", background: "rgba(255,255,255,0.15)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "30%", left: "10%", width: "5px", height: "5px",
          borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            backgroundColor: "rgba(255,255,255,0.1)", padding: "0.375rem 1rem",
            borderRadius: radius.full, fontSize: "13px", fontWeight: "500",
            marginBottom: "1.5rem", backdropFilter: "blur(4px)",
          }}>
            <span style={{ fontSize: "16px" }}>📸</span>
            <span>Find your perfect photographer match</span>
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              fontWeight: "700",
              marginBottom: "1rem",
              lineHeight: "1.15",
              letterSpacing: "-0.02em",
            }}
          >
            Connect with Professional <br />Photographers
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              marginBottom: "0",
              opacity: 0.9,
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            Find the perfect photographer for your event or browse exciting job opportunities as a professional photographer.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "clamp(2.5rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "clamp(2rem, 5vw, 4rem)",
          alignItems: "start",
          flex: 1,
        }}
      >
        {/* Left Side - How It Works */}
        <div>
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: colors.text,
              marginBottom: "0.5rem",
              letterSpacing: "-0.01em",
            }}
          >
            How It Works
          </h2>
          <p style={{ color: colors.textMuted, fontSize: "15px", marginBottom: "2.5rem", lineHeight: "1.6" }}>
            Whether you're looking for a photographer or offering your services, we make the connection seamless.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* For Customers */}
            <div style={{
              backgroundColor: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.lg,
              padding: "1.75rem",
              transition: "box-shadow 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = shadow.md }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = shadow.sm }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: radius.md,
                  backgroundColor: "#EFF6FF", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "18px", flexShrink: 0,
                }}>
                  👤
                </div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: colors.primary, margin: 0 }}>
                    For Customers
                  </h3>
                  <p style={{ fontSize: "13px", color: colors.textMuted, margin: 0 }}>
                    Find and hire the right photographer
                  </p>
                </div>
              </div>
              <div style={{ color: colors.textSecondary, lineHeight: "1.8", fontSize: "14px" }}>
                <p style={{ marginBottom: "0.75rem" }}>
                  Post your photography needs, receive competitive bids from professional photographers, compare portfolios, and manage your projects — all in one place.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {["Describe your project", "Receive bids from photographers", "Compare portfolios and hire", "Manage everything in one place"].map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                      <span style={{
                        width: "20px", height: "20px", borderRadius: "50%",
                        backgroundColor: "#DBEAFE", color: colors.primary,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: "700", flexShrink: 0, marginTop: "3px",
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ color: colors.textSecondary, fontSize: "14px" }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* For Photographers */}
            <div style={{
              backgroundColor: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.lg,
              padding: "1.75rem",
              transition: "box-shadow 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = shadow.md }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = shadow.sm }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: radius.md,
                  backgroundColor: "#FEF3C7", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "18px", flexShrink: 0,
                }}>
                  📷
                </div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "600", color: colors.primary, margin: 0 }}>
                    For Photographers
                  </h3>
                  <p style={{ fontSize: "13px", color: colors.textMuted, margin: 0 }}>
                    Grow your photography business
                  </p>
                </div>
              </div>
              <div style={{ color: colors.textSecondary, lineHeight: "1.8", fontSize: "14px" }}>
                <p style={{ marginBottom: "0.75rem" }}>
                  Browse available jobs, showcase your portfolio, submit competitive bids, and connect with clients who need your expertise.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {["Create your photographer profile", "Browse available jobs", "Submit your bid", "Get hired and grow"].map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                      <span style={{
                        width: "20px", height: "20px", borderRadius: "50%",
                        backgroundColor: "#FEF3C7", color: "#92400E",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: "700", flexShrink: 0, marginTop: "3px",
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ color: colors.textSecondary, fontSize: "14px" }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Card */}
        <div style={{ position: "sticky", top: "calc(73px + 2rem)" }}>
          <div
            style={{
              backgroundColor: colors.bgCard,
              padding: "2.5rem",
              borderRadius: radius.lg,
              boxShadow: shadow.lg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: radius.md,
                backgroundColor: colors.primary, display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 1rem", fontSize: "24px",
              }}>
                🔐
              </div>
              <h2 style={{ color: colors.text, fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.375rem" }}>
                {showUserTypeSelection ? "Choose Account Type" : "Get Started"}
              </h2>
              <p style={{ color: colors.textMuted, fontSize: "14px", margin: 0 }}>
                {showUserTypeSelection
                  ? "Select how you want to use the platform"
                  : "Sign in to access your account"}
              </p>
            </div>

            {!showUserTypeSelection ? (
              <>
                <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: colors.text, fontWeight: "600", fontSize: "13px", letterSpacing: "0.02em" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={input}
                      onFocus={(e) => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = "0 0 0 3px rgba(30,58,138,0.1)" }}
                      onBlur={(e) => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = "none" }}
                    />
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: colors.text, fontWeight: "600", fontSize: "13px", letterSpacing: "0.02em" }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      style={input}
                      onFocus={(e) => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = "0 0 0 3px rgba(30,58,138,0.1)" }}
                      onBlur={(e) => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = "none" }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      ...btn.primary,
                      width: "100%",
                      padding: "0.75rem",
                      fontSize: "15px",
                      fontWeight: "600",
                      borderRadius: radius.sm,
                      letterSpacing: "0.01em",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.primaryHover }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.primary }}
                  >
                    Sign In
                  </button>
                </form>

                <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem", gap: "1rem" }}>
                  <div style={{ flex: 1, height: "1px", backgroundColor: colors.border }} />
                  <span style={{ color: colors.textMuted, fontSize: "12px", fontWeight: "500", letterSpacing: "0.04em", textTransform: "uppercase" }}>or continue with</span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: colors.border }} />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    fontSize: "15px",
                    backgroundColor: colors.bgCard,
                    color: colors.text,
                    border: `1.5px solid ${colors.border}`,
                    borderRadius: radius.sm,
                    cursor: "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.625rem",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#D1D5DB";
                    e.currentTarget.style.boxShadow = shadow.sm;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
              </>
            ) : (
              <div>
                {signingIn ? (
                  <div style={{ textAlign: "center", padding: "2rem 0" }}>
                    <div style={{
                      width: "48px", height: "48px", border: "3px solid #E2E8F0",
                      borderTopColor: colors.primary, borderRadius: "50%",
                      margin: "0 auto 1rem", animation: "spin 0.8s linear infinite",
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                    <p style={{ color: colors.textSecondary, fontSize: "14px", margin: 0 }}>
                      Connecting your account...
                    </p>
                  </div>
                ) : (
                  <>
                    <p style={{ color: colors.textMuted, fontSize: "14px", marginBottom: "1.5rem", textAlign: "center", lineHeight: "1.6" }}>
                      You'll be signed in with Google. Choose the account type that best describes you:
                    </p>

                    <button
                      type="button"
                      onClick={() => handleUserTypeSelection("photographer")}
                      style={{
                        width: "100%",
                        marginBottom: "0.75rem",
                        padding: "1.25rem",
                        fontSize: "15px",
                        backgroundColor: colors.bgCard,
                        color: colors.text,
                        border: `1.5px solid ${colors.border}`,
                        borderRadius: radius.md,
                        cursor: "pointer",
                        fontWeight: "600",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.boxShadow = shadow.sm }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = "none" }}
                    >
                      <div style={{
                        width: "44px", height: "44px", borderRadius: radius.md,
                        backgroundColor: "#EFF6FF", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "20px", flexShrink: 0,
                      }}>
                        📷
                      </div>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: "600", color: colors.text }}>I'm a Photographer</div>
                        <div style={{ fontSize: "13px", color: colors.textMuted, fontWeight: "400", marginTop: "2px" }}>
                          Offer your services and find clients
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUserTypeSelection("customer")}
                      style={{
                        width: "100%",
                        marginBottom: "1.25rem",
                        padding: "1.25rem",
                        fontSize: "15px",
                        backgroundColor: colors.bgCard,
                        color: colors.text,
                        border: `1.5px solid ${colors.border}`,
                        borderRadius: radius.md,
                        cursor: "pointer",
                        fontWeight: "600",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.primary; e.currentTarget.style.boxShadow = shadow.sm }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = "none" }}
                    >
                      <div style={{
                        width: "44px", height: "44px", borderRadius: radius.md,
                        backgroundColor: "#FEF3C7", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "20px", flexShrink: 0,
                      }}>
                        👤
                      </div>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: "600", color: colors.text }}>I'm a Customer</div>
                        <div style={{ fontSize: "13px", color: colors.textMuted, fontWeight: "400", marginTop: "2px" }}>
                          Find and hire a photographer
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUserTypeSelection(false)}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        fontSize: "14px",
                        backgroundColor: "transparent",
                        color: colors.textMuted,
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.sm,
                        cursor: "pointer",
                        fontWeight: "500",
                        transition: "border-color 0.15s, color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = colors.textMuted;
                        e.currentTarget.style.color = colors.textSecondary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = colors.border;
                        e.currentTarget.style.color = colors.textMuted;
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Trust indicator */}
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <p style={{ color: colors.textMuted, fontSize: "12px", margin: 0 }}>
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SignIn;