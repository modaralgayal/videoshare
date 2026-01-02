import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, isAuthenticated } from "../controllers/user";
import { savePortfolio, fetchPhotographerPortfolio, getProfilePicture, updateProfilePicture, fetchPhotographerProfile } from "../controllers/portfolio";
import { uploadFile } from "../utils/upload";

export const Portfolio = () => {
  const navigate = useNavigate();
  const [user] = useState(() => getUser());

  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");
  const [activeTab, setActiveTab] = useState("basic"); // "basic", "delivery", "reviews"
  const [profilePicture, setProfilePicture] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const profilePictureInputRef = useRef(null);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);

  // Redirect if not authenticated or not a photographer
  useEffect(() => {
    if (!isAuthenticated() || !user || user.userType !== "photographer") {
      navigate("/signin");
    }
  }, [navigate, user]);

  // Load portfolio data from backend
  useEffect(() => {
    const loadPortfolio = async () => {
      if (user && user.userType === "photographer" && user.uid) {
        setLoading(true);
        try {
          const portfolioData = await fetchPhotographerPortfolio(user.uid);
          setDescription(portfolioData.description || "");
          // Extract media from portfolio items or use items directly
          const items = portfolioData.items || [];
          setPortfolioItems(items);
        } catch (err) {
          console.error("Error loading portfolio:", err);
          // If error, start with empty portfolio
          setDescription("");
          setPortfolioItems([]);
        } finally {
          setLoading(false);
        }
      }
    };

    const loadProfilePicture = async () => {
      if (user && user.userType === "photographer") {
        try {
          const pictureUrl = await getProfilePicture();
          setProfilePicture(pictureUrl || "");
        } catch (err) {
          console.error("Error loading profile picture:", err);
          setProfilePicture("");
        }
      }
    };

    const loadProfile = async () => {
      if (user && user.userType === "photographer") {
        try {
          setLoadingProfile(true);
          const profile = await fetchPhotographerProfile();
          setProfileData(profile);
        } catch (err) {
          console.error("Error loading profile:", err);
          setProfileData(null);
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    loadPortfolio();
    loadProfilePicture();
    loadProfile();
  }, [user]);

  // Handle file selection and upload
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (images and videos)
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const allowedVideoTypes = ["video/mp4", "video/mov", "video/webm", "video/quicktime"];
    const isImage = allowedImageTypes.includes(file.type);
    const isVideo = allowedVideoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      setUploadError("Invalid file type. Please upload images (JPEG, PNG, WebP) or videos (MP4, MOV, WebM).");
      return;
    }

    // Validate file size based on type
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 500 * 1024 * 1024; // 500MB
    const maxSize = isImage ? maxImageSize : maxVideoSize;
    const maxSizeMB = isImage ? 10 : 500;

    if (file.size > maxSize) {
      setUploadError(`File size exceeds ${maxSizeMB}MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    setUploadError("");
    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to B2
      const mediaItem = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      // Add media to portfolio items
      const newItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        media: [mediaItem],
        uploadedAt: new Date().toISOString(),
      };

      const updatedItems = [...portfolioItems, newItem];

      // Save updated portfolio to backend
      await savePortfolio(description, updatedItems);
      setPortfolioItems(updatedItems);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setUploadError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle delete image
  const handleDeleteImage = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      const updatedItems = portfolioItems.filter((item) => item.id !== itemId);
      await savePortfolio(description, updatedItems);
      setPortfolioItems(updatedItems);
    } catch (err) {
      console.error("Error deleting image:", err);
      alert("Failed to delete image. Please try again.");
    }
  };

  // Handle profile picture upload
  const handleProfilePictureSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (images only)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload JPEG, PNG, or WebP images only.");
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      alert(`File size exceeds 2MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    setUploadingProfilePicture(true);

    try {
      // Upload file to B2
      const mediaItem = await uploadFile(file, (progress) => {
        // Can add progress indicator if needed
      });

      // Update profile picture with the URL
      await updateProfilePicture(mediaItem.url);
      setProfilePicture(mediaItem.url);
      
      // Reset file input
      if (profilePictureInputRef.current) {
        profilePictureInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      alert(err.message || "Failed to upload profile picture. Please try again.");
    } finally {
      setUploadingProfilePicture(false);
    }
  };

  const handleSaveDescription = async () => {
    if (description.length > 1000) {
      setDescriptionError("Description must be 1000 characters or less");
      return;
    }

    try {
      // Save to backend
      await savePortfolio(description, portfolioItems);
      
      setIsEditingDescription(false);
      setDescriptionError("");
    } catch (err) {
      setDescriptionError(err.message || "Failed to save description. Please try again.");
    }
  };

  const handleCancelEdit = async () => {
    try {
      // Reload original description from backend
      if (user?.uid) {
        const portfolioData = await fetchPhotographerPortfolio(user.uid);
        setDescription(portfolioData.description || "");
      }
    } catch (err) {
      console.error("Error loading portfolio:", err);
    }
    setIsEditingDescription(false);
    setDescriptionError("");
  };

  if (!user || user.userType !== "photographer") {
    return null;
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "2rem auto", padding: "0 2rem" }}>
      {/* Upload Error */}
      {uploadError && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#FEE2E2",
            border: "1px solid #FCA5A5",
            borderRadius: "5px",
            marginBottom: "1rem",
            color: "#991B1B",
          }}
        >
          {uploadError}
        </div>
      )}

      {/* Two Column Layout */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "minmax(0, 1fr) 350px", 
        gap: "2rem",
      }}>
        {/* Left Column - Main Content */}
        <div>
          {/* Title */}
          <h1 style={{ color: "#0F172A", fontSize: "32px", marginBottom: "2rem", fontWeight: "600" }}>
            {user?.name || "My Portfolio"}
          </h1>

          {/* Upload Button (for photographers) */}
          <div style={{ marginBottom: "2rem" }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/mov,video/webm,video/quicktime"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: uploading ? "#94A3B8" : "#F59E0B",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: uploading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
                opacity: uploading ? 0.7 : 1,
              }}
            >
              {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : "+ Upload Media"}
            </button>
          </div>

          {/* Portfolio Media Grid - Images and Videos */}
          {loading && <p style={{ color: "#475569", marginBottom: "2rem" }}>Loading portfolio...</p>}

          {!loading && portfolioItems.length === 0 && (
            <div
              style={{
                padding: "4rem 2rem",
                textAlign: "center",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                marginBottom: "2rem",
              }}
            >
              <p style={{ color: "#475569", fontSize: "18px", marginBottom: "1rem" }}>
                Your portfolio is empty.
              </p>
              <p style={{ color: "#475569", marginBottom: "2rem" }}>
                Start building your portfolio by uploading your best work.
              </p>
            </div>
          )}

          {!loading && portfolioItems.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "0.5rem",
                marginBottom: "2rem",
              }}
            >
              {portfolioItems.map((item) => {
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
                    onMouseEnter={(e) => {
                      const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                      if (deleteBtn) deleteBtn.style.display = "flex";
                      const playIcon = e.currentTarget.querySelector('.play-icon');
                      if (playIcon && isVideo) playIcon.style.display = "flex";
                    }}
                    onMouseLeave={(e) => {
                      const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                      if (deleteBtn) deleteBtn.style.display = "none";
                      const playIcon = e.currentTarget.querySelector('.play-icon');
                      if (playIcon) playIcon.style.display = "none";
                    }}
                    onClick={(e) => {
                      // Don't open if clicking delete button
                      if (e.target.closest('.delete-btn')) return;
                      
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

                      // Close button
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
                        // Open image in modal
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
                        // Open video in modal
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

                      // Close on background click
                      modal.onclick = (e) => {
                        if (e.target === modal) {
                          closeModal();
                        }
                      };

                      // Close on Escape key
                      const handleEscape = (e) => {
                        if (e.key === 'Escape') {
                          closeModal();
                          document.removeEventListener('keydown', handleEscape);
                        }
                      };
                      document.addEventListener('keydown', handleEscape);

                      // Prevent body scroll
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
                        {/* Play icon overlay */}
                        <div
                          className="play-icon"
                          style={{
                            display: "none",
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            color: "white",
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
                    {/* Delete button overlay */}
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteImage(item.id)}
                      style={{
                        display: "none",
                        position: "absolute",
                        top: "0.5rem",
                        right: "0.5rem",
                        padding: "0.5rem",
                        backgroundColor: "rgba(220, 38, 38, 0.9)",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Delete media"
                    >
                      ✕
                    </button>
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
                onClick={() => setActiveTab("basic")}
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: activeTab === "basic" ? "2px solid #1E3A8A" : "2px solid transparent",
                  color: activeTab === "basic" ? "#1E3A8A" : "#475569",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: activeTab === "basic" ? "600" : "400",
                  marginBottom: "-2px",
                }}
              >
                Perustiedot
              </button>
              <button
                onClick={() => setActiveTab("delivery")}
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: activeTab === "delivery" ? "2px solid #1E3A8A" : "2px solid transparent",
                  color: activeTab === "delivery" ? "#1E3A8A" : "#475569",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: activeTab === "delivery" ? "600" : "400",
                  marginBottom: "-2px",
                }}
              >
                Toimitus & matkakulut
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: activeTab === "reviews" ? "2px solid #1E3A8A" : "2px solid transparent",
                  color: activeTab === "reviews" ? "#1E3A8A" : "#475569",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: activeTab === "reviews" ? "600" : "400",
                  marginBottom: "-2px",
                }}
              >
                Arvostelut
              </button>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === "basic" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ color: "#0F172A", margin: 0, fontSize: "20px" }}>About</h3>
                    {!isEditingDescription && (
                      <button
                        onClick={() => setIsEditingDescription(true)}
                        style={{
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
                        {description ? "Edit" : "Add Description"}
                      </button>
                    )}
                  </div>

                  {/* Display profile title and descriptions from profile data */}
                  {profileData?.title && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h4 style={{ color: "#0F172A", margin: "0 0 0.5rem 0", fontSize: "18px", fontWeight: "600" }}>
                        {profileData.title}
                      </h4>
                    </div>
                  )}

                  {profileData?.shortDescription && (
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
                        {profileData.shortDescription}
                      </p>
                    </div>
                  )}

                  {profileData?.longDescription && (
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
                        {profileData.longDescription}
                      </p>
                    </div>
                  )}

                  {/* Roles */}
                  {profileData?.roles && profileData.roles.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ color: "#0F172A", fontSize: "16px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
                        Roles:
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {profileData.roles.map((role) => (
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
                  {profileData?.specializations && profileData.specializations.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ color: "#0F172A", fontSize: "16px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
                        Specializations:
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {profileData.specializations.map((spec) => (
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
                  {profileData?.styleTags && profileData.styleTags.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ color: "#0F172A", fontSize: "16px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
                        Style:
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {profileData.styleTags.map((tag) => (
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
                  {profileData?.categories && profileData.categories.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ color: "#0F172A", fontSize: "16px", fontWeight: "600", margin: "0 0 0.5rem 0" }}>
                        Categories:
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {profileData.categories.map((category) => (
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

                  {/* Portfolio description (legacy field) */}

                  {isEditingDescription ? (
                    <div>
                      <textarea
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                          setDescriptionError("");
                        }}
                        placeholder="Tell potential clients about yourself, your experience, your style, and what makes your work unique..."
                        rows={8}
                        maxLength={1000}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          fontSize: "16px",
                          border: descriptionError ? "1px solid #dc3545" : "1px solid #E2E8F0",
                          borderRadius: "5px",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                          backgroundColor: "#FFFFFF",
                          color: "#0F172A",
                          resize: "vertical",
                        }}
                      />
                      {descriptionError && (
                        <p style={{ color: "#721c24", fontSize: "14px", margin: "0.5rem 0 0 0" }}>
                          {descriptionError}
                        </p>
                      )}
                      <p style={{ color: "#475569", fontSize: "14px", margin: "0.5rem 0 1rem 0" }}>
                        {description.length}/1000 characters
                      </p>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={handleSaveDescription}
                          style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#F59E0B",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "transparent",
                            color: "#475569",
                            border: "1px solid #E2E8F0",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {description ? (
                        <p
                          style={{
                            color: "#475569",
                            fontSize: "16px",
                            lineHeight: "1.8",
                            whiteSpace: "pre-wrap",
                            margin: 0,
                          }}
                        >
                          {description}
                        </p>
                      ) : (
                        <p
                          style={{
                            color: "#94A3B8",
                            fontSize: "16px",
                            fontStyle: "italic",
                            margin: 0,
                          }}
                        >
                          No description added yet.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "delivery" && (
                <div>
                  <h3 style={{ color: "#0F172A", margin: "0 0 1rem 0", fontSize: "20px" }}>Delivery & Travel Costs</h3>
                  
                  {profileData?.averageDeliveryTime && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ color: "#475569", fontSize: "16px", margin: "0 0 0.5rem 0" }}>
                        <strong>Average Delivery Time:</strong> {profileData.averageDeliveryTime}
                      </p>
                    </div>
                  )}

                  {profileData?.revisionRounds !== null && profileData?.revisionRounds !== undefined && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ color: "#475569", fontSize: "16px", margin: "0 0 0.5rem 0" }}>
                        <strong>Revision Rounds Included:</strong> {profileData.revisionRounds}
                      </p>
                    </div>
                  )}

                  {profileData?.deliveryFormats && profileData.deliveryFormats.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ color: "#475569", fontSize: "16px", margin: "0 0 0.5rem 0" }}>
                        <strong>Delivery Formats:</strong>
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {profileData.deliveryFormats.map((format) => (
                          <span
                            key={format}
                            style={{
                              padding: "0.5rem 0.75rem",
                              backgroundColor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              borderRadius: "4px",
                              fontSize: "14px",
                              color: "#475569",
                            }}
                          >
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileData?.formatCapabilities && profileData.formatCapabilities.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ color: "#475569", fontSize: "16px", margin: "0 0 0.5rem 0" }}>
                        <strong>Format Capabilities:</strong>
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {profileData.formatCapabilities.map((format) => (
                          <span
                            key={format}
                            style={{
                              padding: "0.5rem 0.75rem",
                              backgroundColor: "#F8FAFC",
                              border: "1px solid #E2E8F0",
                              borderRadius: "4px",
                              fontSize: "14px",
                              color: "#475569",
                            }}
                          >
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileData?.travelCosts && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ color: "#475569", fontSize: "16px", margin: "0 0 0.5rem 0" }}>
                        <strong>Travel Costs:</strong>
                      </p>
                      {profileData.travelCosts.kmPrice && (
                        <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.25rem 0" }}>
                          Per km: €{profileData.travelCosts.kmPrice}
                        </p>
                      )}
                      {profileData.travelCosts.minFee && (
                        <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.25rem 0" }}>
                          Minimum fee: €{profileData.travelCosts.minFee}
                        </p>
                      )}
                      {profileData.travelCosts.travelTime && (
                        <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.25rem 0" }}>
                          Travel time: {profileData.travelCosts.travelTime}
                        </p>
                      )}
                    </div>
                  )}

                  {!profileData?.averageDeliveryTime && !profileData?.revisionRounds && 
                   (!profileData?.deliveryFormats || profileData.deliveryFormats.length === 0) &&
                   (!profileData?.formatCapabilities || profileData.formatCapabilities.length === 0) &&
                   !profileData?.travelCosts && (
                    <p style={{ color: "#94A3B8", fontSize: "16px" }}>
                      No delivery information added yet. <button
                        onClick={() => navigate("/photographer-profile")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#1E3A8A",
                          textDecoration: "underline",
                          cursor: "pointer",
                          fontSize: "16px",
                          padding: 0,
                        }}
                      >
                        Add delivery information
                      </button>
                    </p>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <h3 style={{ color: "#0F172A", margin: "0 0 1rem 0", fontSize: "20px" }}>Reviews</h3>
                  <p style={{ color: "#94A3B8", fontSize: "16px" }}>
                    Reviews and ratings will be displayed here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div>
          {/* Profile Picture */}
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
            <div style={{ position: "relative", display: "inline-block", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  backgroundColor: "#F8FAFC",
                  margin: "0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  border: "2px solid #E2E8F0",
                  position: "relative",
                }}
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = '<span style="color: #94A3B8; font-size: 48px;">📷</span>';
                    }}
                  />
                ) : (
                  <span style={{ color: "#94A3B8", fontSize: "48px" }}>📷</span>
                )}
              </div>
              <input
                type="file"
                ref={profilePictureInputRef}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleProfilePictureSelect}
                style={{ display: "none" }}
              />
              <button
                onClick={() => profilePictureInputRef.current?.click()}
                disabled={uploadingProfilePicture}
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#1E3A8A",
                  color: "white",
                  border: "3px solid white",
                  cursor: uploadingProfilePicture ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  opacity: uploadingProfilePicture ? 0.7 : 1,
                }}
                title="Upload profile picture"
                onMouseEnter={(e) => {
                  if (!uploadingProfilePicture) {
                    e.currentTarget.style.backgroundColor = "#1D4ED8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!uploadingProfilePicture) {
                    e.currentTarget.style.backgroundColor = "#1E3A8A";
                  }
                }}
              >
                {uploadingProfilePicture ? "..." : "📷"}
              </button>
            </div>
            <h3 style={{ color: "#0F172A", margin: "0 0 0.5rem 0", fontSize: "18px" }}>
              {profileData?.contactName || profileData?.name || user?.name || "Photographer"}
            </h3>
            {profileData?.title && (
              <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                {profileData.title}
              </p>
            )}
            <button
              onClick={() => profilePictureInputRef.current?.click()}
              disabled={uploadingProfilePicture}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "transparent",
                color: "#475569",
                border: "1px solid #E2E8F0",
                borderRadius: "5px",
                cursor: uploadingProfilePicture ? "not-allowed" : "pointer",
                fontSize: "13px",
                opacity: uploadingProfilePicture ? 0.7 : 1,
              }}
            >
              {uploadingProfilePicture ? "Uploading..." : profilePicture ? "Change Photo" : "Upload Photo"}
            </button>
          </div>

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
            <div style={{ marginBottom: "1rem" }}>
              {profileData?.hometown && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Location:</strong> {profileData.hometown}
                </p>
              )}
              {profileData?.serviceAreas && profileData.serviceAreas.length > 0 && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Service Areas:</strong> {profileData.serviceAreas.join(", ")}
                </p>
              )}
              {profileData?.operatorType && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Type:</strong> {
                    profileData.operatorType === "yksinyrittaja" ? "Solo" :
                    profileData.operatorType === "tiimi" ? "Team" :
                    profileData.operatorType === "tuotantoyhtio" ? "Production Company" :
                    profileData.operatorType
                  }
                </p>
              )}
              {profileData?.teamSize && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Team Size:</strong> {profileData.teamSize} {profileData.teamSize === 1 ? "person" : "people"}
                </p>
              )}
              {profileData?.phoneNumber && profileData?.phoneNumberVisible && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Phone:</strong> {profileData.phoneNumber}
                </p>
              )}
              {profileData?.companyName && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Company:</strong> {profileData.companyName}
                </p>
              )}
              {profileData?.businessId && profileData?.businessIdVisible && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Business ID:</strong> {profileData.businessId}
                </p>
              )}
              {profileData?.vatObliged && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>VAT Obliged:</strong> ✓ Yes
                </p>
              )}
              {profileData?.maxTravelDistance && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Max Travel:</strong> {profileData.maxTravelDistance} km
                </p>
              )}
              {profileData?.servesAllFinland && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Coverage:</strong> All of Finland
                </p>
              )}
              {profileData?.servesAbroad && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>International:</strong> ✓ Available
                </p>
              )}
            </div>
            <button
              onClick={() => navigate("/photographer-profile")}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#1E3A8A",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1D4ED8"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1E3A8A"}
            >
              Edit Profile →
            </button>
          </div>

          {/* Services */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "1.5rem",
            }}
          >
            <h3 style={{ color: "#0F172A", margin: "0 0 1rem 0", fontSize: "18px" }}>Services</h3>
            {loadingProfile ? (
              <p style={{ color: "#94A3B8", fontSize: "14px" }}>Loading services...</p>
            ) : profileData?.mainServices && profileData.mainServices.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {profileData.mainServices.map((service) => (
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
            ) : profileData?.categories && profileData.categories.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {profileData.categories.map((category) => (
                  <span
                    key={category}
                    style={{
                      padding: "0.5rem 0.75rem",
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: "4px",
                      fontSize: "13px",
                      color: "#475569",
                    }}
                  >
                    {category}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: "#94A3B8", fontSize: "14px" }}>No services added yet.</p>
            )}
          </div>

          {/* Pricing Information */}
          {(profileData?.minStartingPrice || profileData?.dayHourPrice) && (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "1.5rem",
                marginTop: "1.5rem",
              }}
            >
              <h3 style={{ color: "#0F172A", margin: "0 0 1rem 0", fontSize: "18px" }}>Pricing</h3>
              {profileData.minStartingPrice && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Starting from:</strong> €{profileData.minStartingPrice.toLocaleString()}
                </p>
              )}
              {profileData.dayHourPrice && (
                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 0.5rem 0" }}>
                  <strong>Day/Hour:</strong> €{profileData.dayHourPrice.toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Social Media Links */}
          {(profileData?.website || profileData?.instagram || profileData?.youtube || profileData?.vimeo || profileData?.tiktok) && (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
                padding: "1.5rem",
                marginTop: "1.5rem",
              }}
            >
              <h3 style={{ color: "#0F172A", margin: "0 0 1rem 0", fontSize: "18px" }}>Links</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {profileData.website && (
                  <a
                    href={profileData.website.startsWith("http") ? profileData.website : `https://${profileData.website}`}
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
                {profileData.instagram && (
                  <a
                    href={profileData.instagram.startsWith("http") ? profileData.instagram : `https://instagram.com/${profileData.instagram.replace("@", "")}`}
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
                {profileData.youtube && (
                  <a
                    href={profileData.youtube}
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
                {profileData.vimeo && (
                  <a
                    href={profileData.vimeo}
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
                {profileData.tiktok && (
                  <a
                    href={profileData.tiktok.startsWith("http") ? profileData.tiktok : `https://tiktok.com/@${profileData.tiktok.replace("@", "")}`}
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
    </div>
  );
};

export default Portfolio;

