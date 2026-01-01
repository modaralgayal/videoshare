import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUser, isAuthenticated } from "../controllers/user";
import { fetchPhotographerPortfolio } from "../controllers/portfolio";

export const ViewPhotographerPortfolio = () => {
  const navigate = useNavigate();
  const { photographerId } = useParams();
  const [user] = useState(() => getUser());

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (!isAuthenticated() || !user || user.userType !== "customer") {
      navigate("/signin");
    }
  }, [navigate, user]);

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!photographerId || !user || user.userType !== "customer") {
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        // Fetch portfolio from backend
        const portfolioData = await fetchPhotographerPortfolio(photographerId);
        setPortfolio(portfolioData);
      } catch (err) {
        setError(err.message || "Failed to load photographer portfolio.");
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [photographerId, user]);

  if (!user || user.userType !== "customer") {
    return null;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1rem" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "2rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#1E3A8A",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "14px",
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1D4ED8"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1E3A8A"}
      >
        ← Back
      </button>

      <h1 style={{ color: "#0F172A", marginBottom: "2rem" }}>Photographer Portfolio</h1>

      {loading && <p style={{ color: "#475569" }}>Loading portfolio...</p>}

      {error && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "1rem",
            borderRadius: "5px",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && portfolio && (
        <>
          {/* Portfolio Description Section */}
          {portfolio.description && (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "2rem",
                marginBottom: "2rem",
              }}
            >
              <h2 style={{ color: "#0F172A", marginTop: 0, marginBottom: "1rem" }}>
                About This Photographer
              </h2>
              <p
                style={{
                  color: "#475569",
                  fontSize: "16px",
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  margin: 0,
                }}
              >
                {portfolio.description}
              </p>
            </div>
          )}

          {/* Portfolio Items */}
          {portfolio.items && portfolio.items.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
                marginTop: portfolio.description ? "0" : "2rem",
              }}
            >
              {portfolio.items.map((item) => {
                const media = item.media?.[0];
                if (!media) return null;

                const isImage = media.type === "image";
                const isVideo = media.type === "video";

                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                    }}
                    onClick={(e) => {
                      // Open media in modal (similar to Portfolio.jsx)
                      const modal = document.createElement('div');
                      Object.assign(modal.style, {
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: '10000',
                        cursor: 'pointer',
                        padding: '2rem',
                        boxSizing: 'border-box',
                      });

                      const closeBtn = document.createElement('button');
                      closeBtn.innerHTML = '✕';
                      Object.assign(closeBtn.style, {
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: '10001',
                        transition: 'background-color 0.2s',
                      });
                      closeBtn.onmouseenter = () => {
                        closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                      };
                      closeBtn.onmouseleave = () => {
                        closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                      };

                      const closeModal = () => {
                        if (document.body.contains(modal)) {
                          document.body.removeChild(modal);
                          document.body.style.overflow = '';
                        }
                      };

                      closeBtn.onclick = (e) => {
                        e.stopPropagation();
                        closeModal();
                      };

                      modal.appendChild(closeBtn);

                      if (isImage) {
                        const imgElement = document.createElement('img');
                        imgElement.src = media.url;
                        imgElement.alt = media.filename || 'Portfolio image';
                        Object.assign(imgElement.style, {
                          maxWidth: '90%',
                          maxHeight: '90%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          cursor: 'default',
                        });
                        imgElement.onclick = (e) => e.stopPropagation();
                        modal.appendChild(imgElement);
                      } else if (isVideo) {
                        const videoElement = document.createElement('video');
                        videoElement.src = media.url;
                        videoElement.controls = true;
                        videoElement.autoplay = true;
                        Object.assign(videoElement.style, {
                          maxWidth: '90%',
                          maxHeight: '90%',
                          width: 'auto',
                          height: 'auto',
                          cursor: 'default',
                        });
                        videoElement.onclick = (e) => e.stopPropagation();
                        modal.appendChild(videoElement);
                      }

                      modal.onclick = (e) => {
                        if (e.target === modal) {
                          closeModal();
                        }
                      };

                      const handleEscape = (e) => {
                        if (e.key === 'Escape') {
                          closeModal();
                          document.removeEventListener('keydown', handleEscape);
                        }
                      };
                      document.addEventListener('keydown', handleEscape);

                      document.body.style.overflow = 'hidden';
                      document.body.appendChild(modal);
                    }}
                  >
                    {isImage ? (
                      <div
                        style={{
                          width: "100%",
                          height: "300px",
                          backgroundColor: "#F8FAFC",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={media.url}
                          alt={media.filename || "Portfolio image"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #475569;">Failed to load image</div>';
                          }}
                        />
                      </div>
                    ) : isVideo ? (
                      <div
                        style={{
                          width: "100%",
                          height: "300px",
                          backgroundColor: "#F8FAFC",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <video
                          src={media.url}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          muted
                          preload="metadata"
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                            pointerEvents: "none",
                          }}
                        >
                          ▶
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : !portfolio.description ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
              }}
            >
              <p style={{ color: "#475569" }}>
                This photographer hasn't set up their portfolio yet.
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default ViewPhotographerPortfolio;
