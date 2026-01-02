import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUser, isAuthenticated } from "../controllers/user";
import { fetchPhotographerProfileForCustomer } from "../controllers/portfolio";

export const ViewPhotographerProfile = () => {
  const navigate = useNavigate();
  const { photographerId } = useParams();
  const [user] = useState(() => getUser());

  const [profile, setProfile] = useState(null);
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
    const loadProfile = async () => {
      if (!photographerId || !user || user.userType !== "customer") {
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        const data = await fetchPhotographerProfileForCustomer(photographerId);
        setProfile(data.profile);
        setPortfolio(data.portfolio);
      } catch (err) {
        setError(err.message || "Failed to load photographer profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [photographerId, user]);

  if (!user || user.userType !== "customer") {
    return null;
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "2rem auto", padding: "0 2rem" }}>
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

      {loading && <p style={{ color: "#475569" }}>Loading photographer profile...</p>}

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

      {!loading && !error && profile && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "minmax(0, 1fr) 350px", 
          gap: "2rem",
        }}>
          {/* Left Column - Main Content */}
          <div>
            {/* Title */}
            <h1 style={{ color: "#0F172A", fontSize: "32px", marginBottom: "2rem", fontWeight: "600" }}>
              {profile.title || profile.name || "Photographer Profile"}
            </h1>

            {/* Portfolio Media Grid */}
            {portfolio && portfolio.items && portfolio.items.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "0.5rem",
                  marginBottom: "2rem",
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
                        position: "relative",
                        aspectRatio: "1",
                        overflow: "hidden",
                        backgroundColor: "#F8FAFC",
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        // Open media in modal
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
                        });

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
                          }}
                        />
                      ) : isVideo ? (
                        <>
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
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tabs Section */}
            <div style={{ marginTop: "2rem" }}>
              {/* Tab Headers */}
              <div style={{ display: "flex", gap: "1rem", borderBottom: "2px solid #E2E8F0", marginBottom: "1.5rem" }}>
                <button
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "2px solid #1E3A8A",
                    color: "#1E3A8A",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "-2px",
                  }}
                >
                  About
                </button>
              </div>

              {/* Tab Content */}
              <div>
                {/* About Section */}
                <div>
                  {profile.shortDescription && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p
                        style={{
                          color: "#475569",
                          fontSize: "16px",
                          lineHeight: "1.8",
                          whiteSpace: "pre-wrap",
                          margin: 0,
                        }}
                      >
                        {profile.shortDescription}
                      </p>
                    </div>
                  )}

                  {profile.longDescription && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p
                        style={{
                          color: "#475569",
                          fontSize: "16px",
                          lineHeight: "1.8",
                          whiteSpace: "pre-wrap",
                          margin: 0,
                        }}
                      >
                        {profile.longDescription}
                      </p>
                    </div>
                  )}

                  {portfolio && portfolio.description && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p
                        style={{
                          color: "#475569",
                          fontSize: "16px",
                          lineHeight: "1.8",
                          whiteSpace: "pre-wrap",
                          margin: 0,
                        }}
                      >
                        {portfolio.description}
                      </p>
                    </div>
                  )}

                  {/* Roles */}
                  {profile.roles && profile.roles.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ color: "#0F172A", fontSize: "16px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
                        Roles:
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {profile.roles.map((role) => (
                          <span
                            key={role}
                            style={{
                              padding: "0.5rem 0.75rem",
                              backgroundColor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              borderRadius: "4px",
                              fontSize: "14px",
                              color: "#475569",
                            }}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Specializations */}
                  {profile.specializations && profile.specializations.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ color: "#0F172A", fontSize: "16px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
                        Specializations:
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {profile.specializations.map((spec) => (
                          <span
                            key={spec}
                            style={{
                              padding: "0.5rem 0.75rem",
                              backgroundColor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              borderRadius: "4px",
                              fontSize: "14px",
                              color: "#475569",
                            }}
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Style Tags */}
                  {profile.styleTags && profile.styleTags.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ color: "#0F172A", fontSize: "16px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
                        Style:
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {profile.styleTags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: "0.5rem 0.75rem",
                              backgroundColor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              borderRadius: "4px",
                              fontSize: "14px",
                              color: "#475569",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  {profile.categories && profile.categories.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ color: "#0F172A", fontSize: "16px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
                        Categories:
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {profile.categories.map((category) => (
                          <span
                            key={category}
                            style={{
                              padding: "0.5rem 0.75rem",
                              backgroundColor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              borderRadius: "4px",
                              fontSize: "14px",
                              color: "#475569",
                            }}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Profile Picture */}
            {profile.profilePicture && (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    backgroundColor: "#F8FAFC",
                    margin: "0 auto 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: "2px solid #E2E8F0",
                  }}
                >
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <h3 style={{ color: "#0F172A", margin: "0 0 0.5rem 0", fontSize: "18px" }}>
                  {profile.contactName || profile.name || "Photographer"}
                </h3>
              </div>
            )}

            {/* Business Information */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              {profile.hometown && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Location:</strong> {profile.hometown}
                </p>
              )}
              {profile.serviceAreas && profile.serviceAreas.length > 0 && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Service Areas:</strong> {profile.serviceAreas.join(", ")}
                </p>
              )}
              {profile.operatorType && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Type:</strong> {
                    profile.operatorType === "yksinyrittaja" ? "Solo" :
                    profile.operatorType === "tiimi" ? "Team" :
                    profile.operatorType === "tuotantoyhtio" ? "Production Company" :
                    profile.operatorType
                  }
                </p>
              )}
              {profile.teamSize && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Team Size:</strong> {profile.teamSize} {profile.teamSize === 1 ? "person" : "people"}
                </p>
              )}
              {profile.phoneNumber && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Phone:</strong> {profile.phoneNumber}
                </p>
              )}
              {profile.companyName && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Company:</strong> {profile.companyName}
                </p>
              )}
              {profile.businessId && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Business ID:</strong> {profile.businessId}
                </p>
              )}
              {profile.vatObliged && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>VAT Obliged:</strong> ✓ Yes
                </p>
              )}
              {profile.maxTravelDistance && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Max Travel:</strong> {profile.maxTravelDistance} km
                </p>
              )}
              {profile.servesAllFinland && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Coverage:</strong> All of Finland
                </p>
              )}
              {profile.servesAbroad && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>International:</strong> ✓ Available
                </p>
              )}
            </div>

            {/* Services */}
            {profile.mainServices && profile.mainServices.length > 0 && (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <h3 style={{ color: "#0F172A", margin: "0 0 1rem 0", fontSize: "18px" }}>Services</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {profile.mainServices.map((service) => (
                    <span
                      key={service}
                      style={{
                        padding: "0.5rem 0.75rem",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "4px",
                        fontSize: "13px",
                        color: "#475569",
                      }}
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Information */}
            {(profile.minStartingPrice || profile.dayHourPrice) && (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  padding: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <h3 style={{ color: "#0F172A", margin: "0 0 1rem 0", fontSize: "18px" }}>Pricing</h3>
                {profile.minStartingPrice && (
                  <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                    <strong>Starting from:</strong> €{profile.minStartingPrice.toLocaleString()}
                  </p>
                )}
                {profile.dayHourPrice && (
                  <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                    <strong>Day/Hour:</strong> €{profile.dayHourPrice.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Social Media Links */}
            {(profile.website || profile.instagram || profile.youtube || profile.vimeo || profile.tiktok) && (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  padding: "1.5rem",
                }}
              >
                <h3 style={{ color: "#0F172A", margin: "0 0 1rem 0", fontSize: "18px" }}>Links</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {profile.website && (
                    <a
                      href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#1E3A8A",
                        fontSize: "14px",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                    >
                      🌐 Website
                    </a>
                  )}
                  {profile.instagram && (
                    <a
                      href={profile.instagram.startsWith("http") ? profile.instagram : `https://instagram.com/${profile.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#1E3A8A",
                        fontSize: "14px",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                    >
                      📷 Instagram
                    </a>
                  )}
                  {profile.youtube && (
                    <a
                      href={profile.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#1E3A8A",
                        fontSize: "14px",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                    >
                      ▶️ YouTube
                    </a>
                  )}
                  {profile.vimeo && (
                    <a
                      href={profile.vimeo}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#1E3A8A",
                        fontSize: "14px",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                    >
                      🎬 Vimeo
                    </a>
                  )}
                  {profile.tiktok && (
                    <a
                      href={profile.tiktok.startsWith("http") ? profile.tiktok : `https://tiktok.com/@${profile.tiktok.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#1E3A8A",
                        fontSize: "14px",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                    >
                      🎵 TikTok
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPhotographerProfile;


