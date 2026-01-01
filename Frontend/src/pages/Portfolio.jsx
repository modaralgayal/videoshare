import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, isAuthenticated } from "../controllers/user";
import { savePortfolio, fetchPhotographerPortfolio } from "../controllers/portfolio";
import { uploadFile } from "../utils/upload";

export const Portfolio = () => {
  const navigate = useNavigate();
  const [user] = useState(() => getUser());

  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

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

    loadPortfolio();
  }, [user]);

  // Handle file selection and upload
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (images only)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Please upload JPEG, PNG, or WebP images only.");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setUploadError(`File size exceeds 10MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
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
    <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ color: "#0F172A" }}>My Portfolio</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/jpg,image/png,image/webp"
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
              fontSize: "16px",
              fontWeight: "600",
              opacity: uploading ? 0.7 : 1,
            }}
          >
            {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : "Upload Image"}
          </button>
        </div>
      </div>

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

      {/* Portfolio Description Section */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          padding: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ color: "#0F172A", margin: 0 }}>About Me</h2>
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
              {description ? "Edit Description" : "Add Description"}
            </button>
          )}
        </div>

        {isEditingDescription ? (
          <div>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setDescriptionError("");
              }}
              placeholder="Tell potential clients about yourself, your experience, your style, and what makes your work unique..."
              rows={6}
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
                Save Description
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
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",
                  margin: 0,
                }}
              >
                {description}
              </p>
            ) : (
              <p
                style={{
                  color: "#475569",
                  fontSize: "16px",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                No description added yet. Click "Add Description" to tell clients about yourself and your work.
              </p>
            )}
          </div>
        )}
      </div>

      {loading && <p style={{ color: "#475569" }}>Loading portfolio...</p>}

      {!loading && portfolioItems.length === 0 && (
        <div
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
          }}
        >
          <p style={{ color: "#475569", fontSize: "18px", marginBottom: "1rem" }}>
            Your portfolio is empty.
          </p>
          <p style={{ color: "#475569", marginBottom: "2rem" }}>
            Start building your portfolio by uploading your best work to showcase your skills to potential clients.
          </p>
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
              fontSize: "16px",
              fontWeight: "600",
              opacity: uploading ? 0.7 : 1,
            }}
          >
            {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : "Upload Your First Image"}
          </button>
        </div>
      )}

      {!loading && portfolioItems.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          {portfolioItems.map((item) => {
            // Get first image from media array
            const image = item.media?.[0];
            if (!image || image.type !== "image") return null;

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  position: "relative",
                }}
              >
                {/* Image */}
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
                    src={image.url}
                    alt={image.filename || "Portfolio image"}
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
                  {/* Delete button overlay */}
                  <button
                    onClick={() => handleDeleteImage(item.id)}
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      padding: "0.5rem",
                      backgroundColor: "rgba(0, 0, 0, 0.6)",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.8)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)"}
                    title="Delete image"
                  >
                    ✕
                  </button>
                </div>
                <div style={{ padding: "1rem" }}>
                  <p style={{ color: "#475569", fontSize: "12px", margin: 0 }}>
                    {image.filename || "Image"}
                  </p>
                  {image.size && (
                    <p style={{ color: "#94A3B8", fontSize: "11px", margin: "0.25rem 0 0 0" }}>
                      {(image.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Portfolio Stats Section */}
      <div
        style={{
          marginTop: "3rem",
          padding: "2rem",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ color: "#0F172A", marginTop: 0, marginBottom: "1.5rem" }}>
          Portfolio Statistics
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          <div>
            <p style={{ color: "#475569", fontSize: "14px", margin: 0 }}>Total Items</p>
            <p style={{ color: "#0F172A", fontSize: "32px", fontWeight: "bold", margin: "0.5rem 0 0 0" }}>
              {portfolioItems.length}
            </p>
          </div>
          <div>
            <p style={{ color: "#475569", fontSize: "14px", margin: 0 }}>Total Views</p>
            <p style={{ color: "#0F172A", fontSize: "32px", fontWeight: "bold", margin: "0.5rem 0 0 0" }}>
              {/* TODO: Add views count from backend */}
              0
            </p>
          </div>
          <div>
            <p style={{ color: "#475569", fontSize: "14px", margin: 0 }}>Active Bids</p>
            <p style={{ color: "#0F172A", fontSize: "32px", fontWeight: "bold", margin: "0.5rem 0 0 0" }}>
              {/* TODO: Add active bids count from backend */}
              0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;

