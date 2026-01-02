import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, isAuthenticated } from "../controllers/user";
import { savePhotographerProfile, fetchPhotographerProfile } from "../controllers/portfolio";

export const PhotographerProfile = () => {
  const navigate = useNavigate();
  const [user] = useState(() => getUser());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state - organized by sections
  const [formData, setFormData] = useState({
    // Tili & yhteys (Account & Contact)
    phoneNumber: "",
    phoneNumberVisible: true,
    contactName: "",
    companyName: "",
    businessId: "",
    businessIdVisible: true,
    vatObliged: false,
    billingModel: "",
    profileLanguages: [],

    // Profiilin peruskuvaus (Basic Profile Description)
    title: "",
    shortDescription: "",
    longDescription: "",

    // Yritystyyppi & tiimi (Company Type & Team)
    operatorType: "",
    teamSize: null,
    roles: [],

    // Toiminta-alue (Service Area)
    hometown: "",
    serviceAreas: [],
    maxTravelDistance: null,
    travelCosts: null,
    servesAllFinland: false,
    servesAbroad: false,

    // Palvelut & osaaminen (Services & Expertise)
    mainServices: [],
    categories: [],
    styleTags: [],
    experienceLevel: null,
    specializations: [],

    // Hintatiedot (Pricing Information)
    minStartingPrice: null,
    dayHourPrice: null,
    packages: [],
    includedInPrice: [],
    additionalServices: [],

    // Toimitus & prosessi (Delivery & Process)
    averageDeliveryTime: "",
    revisionRounds: null,
    deliveryFormats: [],
    formatCapabilities: [],

    // Kalusto (Equipment)
    cameras: [],
    equipment: [],
    lightingAudio: [],

    // Sertifikaatit & turvallisuus (Certifications & Safety)
    droneCertifications: [],
    liabilityInsurance: null,
    safetyCards: [],

    // Saatavuus (Availability)
    weeklyAvailability: [],
    leadTime: "",

    // Viestintä & käytännöt (Communication & Practices)
    preferredContactMethod: "",
    hasContractTemplate: false,
    cancellationTerms: "",
    depositRequired: false,

    // Some & kanavat (Social Media & Channels)
    website: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    vimeo: "",
    mediaKit: "",
  });

  // Redirect if not authenticated or not a photographer
  useEffect(() => {
    if (!isAuthenticated() || !user || user.userType !== "photographer") {
      navigate("/signin");
    }
  }, [navigate, user]);

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (user && user.userType === "photographer" && user.uid) {
        try {
          setLoading(true);
          const profile = await fetchPhotographerProfile();
          if (profile) {
            setFormData((prev) => ({
              ...prev,
              phoneNumber: profile.phoneNumber || "",
              phoneNumberVisible: profile.phoneNumberVisible !== undefined ? profile.phoneNumberVisible : true,
              contactName: profile.contactName || "",
              companyName: profile.companyName || "",
              businessId: profile.businessId || "",
              businessIdVisible: profile.businessIdVisible !== undefined ? profile.businessIdVisible : true,
              vatObliged: profile.vatObliged || false,
              billingModel: profile.billingModel || "",
              profileLanguages: profile.profileLanguages || [],
              title: profile.title || "",
              shortDescription: profile.shortDescription || "",
              longDescription: profile.longDescription || "",
              operatorType: profile.operatorType || "",
              teamSize: profile.teamSize || null,
              roles: profile.roles || [],
              hometown: profile.hometown || "",
              serviceAreas: profile.serviceAreas || [],
              maxTravelDistance: profile.maxTravelDistance || null,
              travelCosts: profile.travelCosts || null,
              servesAllFinland: profile.servesAllFinland || false,
              servesAbroad: profile.servesAbroad || false,
              mainServices: profile.mainServices || [],
              categories: profile.categories || [],
              styleTags: profile.styleTags || [],
              experienceLevel: profile.experienceLevel || null,
              specializations: profile.specializations || [],
              minStartingPrice: profile.minStartingPrice || null,
              dayHourPrice: profile.dayHourPrice || null,
              packages: profile.packages || [],
              includedInPrice: profile.includedInPrice || [],
              additionalServices: profile.additionalServices || [],
              averageDeliveryTime: profile.averageDeliveryTime || "",
              revisionRounds: profile.revisionRounds || null,
              deliveryFormats: profile.deliveryFormats || [],
              formatCapabilities: profile.formatCapabilities || [],
              cameras: profile.cameras || [],
              equipment: profile.equipment || [],
              lightingAudio: profile.lightingAudio || [],
              droneCertifications: profile.droneCertifications || [],
              liabilityInsurance: profile.liabilityInsurance || null,
              safetyCards: profile.safetyCards || [],
              weeklyAvailability: profile.weeklyAvailability || [],
              leadTime: profile.leadTime || "",
              preferredContactMethod: profile.preferredContactMethod || "",
              hasContractTemplate: profile.hasContractTemplate || false,
              cancellationTerms: profile.cancellationTerms || "",
              depositRequired: profile.depositRequired || false,
              website: profile.website || "",
              instagram: profile.instagram || "",
              tiktok: profile.tiktok || "",
              youtube: profile.youtube || "",
              vimeo: profile.vimeo || "",
              mediaKit: profile.mediaKit || "",
            }));
          }
        } catch (err) {
          console.error("Error loading profile:", err);
          setError("Failed to load profile data");
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfile();
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field, value, action = "toggle") => {
    setFormData((prev) => {
      const currentArray = prev[field] || [];
      if (action === "add") {
        return { ...prev, [field]: [...currentArray, value] };
      } else if (action === "remove") {
        return { ...prev, [field]: currentArray.filter((item) => item !== value) };
      } else {
        // toggle
        const index = currentArray.indexOf(value);
        if (index > -1) {
          return { ...prev, [field]: currentArray.filter((item) => item !== value) };
        } else {
          return { ...prev, [field]: [...currentArray, value] };
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await savePhotographerProfile(formData);
      setSuccess("Profile saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.userType !== "photographer") {
    return null;
  }

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1rem" }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  // Common input styles
  const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #E2E8F0",
    borderRadius: "5px",
    fontSize: "14px",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "500",
    color: "#0F172A",
    fontSize: "14px",
  };

  const sectionStyle = {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    padding: "2rem",
    marginBottom: "2rem",
  };

  const sectionTitleStyle = {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #E2E8F0",
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "#0F172A", marginBottom: "0.5rem" }}>Photographer Profile</h1>
        <p style={{ color: "#475569" }}>Complete your profile to help customers find and choose you</p>
      </div>

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

      {success && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "1rem",
            borderRadius: "5px",
            marginBottom: "1rem",
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Tili & yhteys (Account & Contact) */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Account & Contact</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Contact Name <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => handleInputChange("contactName", e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Phone Number
            </label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
                placeholder="+358..."
              />
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.phoneNumberVisible}
                  onChange={(e) => handleInputChange("phoneNumberVisible", e.target.checked)}
                />
                <span style={{ fontSize: "14px", color: "#475569" }}>Visible to customers</span>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Company Name / Business Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Business ID (Y-tunnus)
            </label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input
                type="text"
                value={formData.businessId}
                onChange={(e) => handleInputChange("businessId", e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
                placeholder="1234567-8"
              />
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.businessIdVisible}
                  onChange={(e) => handleInputChange("businessIdVisible", e.target.checked)}
                />
                <span style={{ fontSize: "14px", color: "#475569" }}>Visible to customers</span>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.vatObliged}
                onChange={(e) => handleInputChange("vatObliged", e.target.checked)}
              />
              <span style={labelStyle}>VAT Obliged (ALV-velvollinen)</span>
            </label>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Billing Model</label>
            <select
              value={formData.billingModel}
              onChange={(e) => handleInputChange("billingModel", e.target.value)}
              style={inputStyle}
            >
              <option value="">Select billing model</option>
              <option value="verkkolasku">Verkkolasku (E-invoice)</option>
              <option value="sahkoposti">Sähköposti</option>
              <option value="kevytyrittajyys">Kevytyrittäjyys</option>
            </select>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Profile Languages</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["Finnish", "English", "Swedish", "German", "Russian"].map((lang) => (
                <label key={lang} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.profileLanguages.includes(lang)}
                    onChange={() => handleArrayChange("profileLanguages", lang)}
                  />
                  <span style={{ fontSize: "14px" }}>{lang}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Profiilin peruskuvaus (Basic Profile Description) */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Basic Profile Description</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Title <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              style={inputStyle}
              placeholder="e.g., Cinematic videotuotanto & valokuvaus"
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Short Introduction (1-3 sentences) <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <textarea
              value={formData.shortDescription}
              onChange={(e) => handleInputChange("shortDescription", e.target.value)}
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              placeholder="Brief introduction about yourself and your services"
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Longer Introduction (Story, approach)</label>
            <textarea
              value={formData.longDescription}
              onChange={(e) => handleInputChange("longDescription", e.target.value)}
              style={{ ...inputStyle, minHeight: "150px", resize: "vertical" }}
              placeholder="Tell your story, your approach, what makes you unique"
            />
          </div>
        </div>

        {/* Yritystyyppi & tiimi (Company Type & Team) */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Company Type & Team</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Operator Type <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <select
              value={formData.operatorType}
              onChange={(e) => handleInputChange("operatorType", e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">Select type</option>
              <option value="yksinyrittaja">Yksinyrittäjä (Solo)</option>
              <option value="tiimi">Tiimi (Team)</option>
              <option value="tuotantoyhtio">Tuotantoyhtiö (Production Company)</option>
            </select>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Team Size</label>
            <input
              type="number"
              value={formData.teamSize || ""}
              onChange={(e) => handleInputChange("teamSize", e.target.value ? parseInt(e.target.value) : null)}
              style={inputStyle}
              min="1"
              placeholder="Number of team members"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Roles</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["Kuvaaja", "Ohjaaja", "Editoija", "Äänittäjä", "Valokuvaaja", "Drone-kuvaaja", "Koloristi"].map((role) => (
                <label key={role} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={() => handleArrayChange("roles", role)}
                  />
                  <span style={{ fontSize: "14px" }}>{role}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Toiminta-alue (Service Area) */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Service Area</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Hometown <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.hometown}
              onChange={(e) => handleInputChange("hometown", e.target.value)}
              style={inputStyle}
              placeholder="e.g., Helsinki"
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Service Areas <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.serviceAreas.join(", ")}
              onChange={(e) => handleInputChange("serviceAreas", e.target.value.split(",").map(s => s.trim()).filter(s => s))}
              style={inputStyle}
              placeholder="e.g., Helsinki, Espoo, Vantaa (comma-separated)"
              required
            />
            <p style={{ fontSize: "12px", color: "#64748B", marginTop: "0.25rem" }}>
              Enter cities or regions separated by commas
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Maximum Travel Distance (km)</label>
            <input
              type="number"
              value={formData.maxTravelDistance || ""}
              onChange={(e) => handleInputChange("maxTravelDistance", e.target.value ? parseInt(e.target.value) : null)}
              style={inputStyle}
              min="0"
              placeholder="Maximum distance you're willing to travel"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.servesAllFinland}
                onChange={(e) => handleInputChange("servesAllFinland", e.target.checked)}
              />
              <span style={labelStyle}>Serves All of Finland</span>
            </label>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.servesAbroad}
                onChange={(e) => handleInputChange("servesAbroad", e.target.checked)}
              />
              <span style={labelStyle}>Serves Abroad</span>
            </label>
          </div>
        </div>

        {/* Palvelut & osaaminen (Services & Expertise) */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Services & Expertise</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Main Services <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["Video", "Valokuvaus", "Short-form", "Drone", "Live", "Tuotantopalvelut"].map((service) => (
                <label key={service} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.mainServices.includes(service)}
                    onChange={() => handleArrayChange("mainServices", service)}
                  />
                  <span style={{ fontSize: "14px" }}>{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Categories <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["Häät", "Yritys", "Tapahtuma", "Tuote", "Kiinteistö", "Some", "Dokumentti"].map((category) => (
                <label key={category} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category)}
                    onChange={() => handleArrayChange("categories", category)}
                  />
                  <span style={{ fontSize: "14px" }}>{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Style Tags</label>
            <input
              type="text"
              value={formData.styleTags.join(", ")}
              onChange={(e) => handleInputChange("styleTags", e.target.value.split(",").map(s => s.trim()).filter(s => s))}
              style={inputStyle}
              placeholder="e.g., cinematic, dokumentaarinen, raikas, luxury (comma-separated)"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Specializations</label>
            <input
              type="text"
              value={formData.specializations.join(", ")}
              onChange={(e) => handleInputChange("specializations", e.target.value.split(",").map(s => s.trim()).filter(s => s))}
              style={inputStyle}
              placeholder="e.g., FPV, värimäärittely, storytelling, haastattelut (comma-separated)"
            />
          </div>
        </div>

        {/* Hintatiedot (Pricing Information) */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Pricing Information</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Minimum Starting Price (€)</label>
            <input
              type="number"
              value={formData.minStartingPrice || ""}
              onChange={(e) => handleInputChange("minStartingPrice", e.target.value ? parseFloat(e.target.value) : null)}
              style={inputStyle}
              min="0"
              step="0.01"
              placeholder="Starting from..."
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Day/Hour Price (€)</label>
            <input
              type="number"
              value={formData.dayHourPrice || ""}
              onChange={(e) => handleInputChange("dayHourPrice", e.target.value ? parseFloat(e.target.value) : null)}
              style={inputStyle}
              min="0"
              step="0.01"
              placeholder="Price per day or hour"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>What's Included in Price</label>
            <input
              type="text"
              value={formData.includedInPrice.join(", ")}
              onChange={(e) => handleInputChange("includedInPrice", e.target.value.split(",").map(s => s.trim()).filter(s => s))}
              style={inputStyle}
              placeholder="e.g., kuvaus, editointi, värimäärittely, äänet (comma-separated)"
            />
          </div>
        </div>

        {/* Toimitus & prosessi (Delivery & Process) */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Delivery & Process</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Average Delivery Time</label>
            <select
              value={formData.averageDeliveryTime}
              onChange={(e) => handleInputChange("averageDeliveryTime", e.target.value)}
              style={inputStyle}
            >
              <option value="">Select delivery time</option>
              <option value="1-3 days">1-3 days</option>
              <option value="1 week">1 week</option>
              <option value="2 weeks">2 weeks</option>
              <option value="3-4 weeks">3-4 weeks</option>
              <option value="1+ months">1+ months</option>
            </select>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Revision Rounds Included</label>
            <input
              type="number"
              value={formData.revisionRounds || ""}
              onChange={(e) => handleInputChange("revisionRounds", e.target.value ? parseInt(e.target.value) : null)}
              style={inputStyle}
              min="0"
              placeholder="Number of revision rounds"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Delivery Formats</label>
            <input
              type="text"
              value={formData.deliveryFormats.join(", ")}
              onChange={(e) => handleInputChange("deliveryFormats", e.target.value.split(",").map(s => s.trim()).filter(s => s))}
              style={inputStyle}
              placeholder="e.g., Drive, Frame.io, WeTransfer (comma-separated)"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Format Capabilities</label>
            <input
              type="text"
              value={formData.formatCapabilities.join(", ")}
              onChange={(e) => handleInputChange("formatCapabilities", e.target.value.split(",").map(s => s.trim()).filter(s => s))}
              style={inputStyle}
              placeholder="e.g., 4K, pysty 9:16, 1:1, stillit + video (comma-separated)"
            />
          </div>
        </div>

        {/* Kalusto (Equipment) */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Equipment</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Cameras</label>
            <input
              type="text"
              value={formData.cameras.join(", ")}
              onChange={(e) => handleInputChange("cameras", e.target.value.split(",").map(s => s.trim()).filter(s => s))}
              style={inputStyle}
              placeholder="e.g., Sony A7S III, Canon R5 (comma-separated)"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Equipment (Lenses, Drones, Gimbals)</label>
            <input
              type="text"
              value={formData.equipment.join(", ")}
              onChange={(e) => handleInputChange("equipment", e.target.value.split(",").map(s => s.trim()).filter(s => s))}
              style={inputStyle}
              placeholder="e.g., DJI Mavic 3, Ronin RS 3 (comma-separated)"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Lighting & Audio Equipment</label>
            <input
              type="text"
              value={formData.lightingAudio.join(", ")}
              onChange={(e) => handleInputChange("lightingAudio", e.target.value.split(",").map(s => s.trim()).filter(s => s))}
              style={inputStyle}
              placeholder="e.g., LED panels, wireless mics (comma-separated)"
            />
          </div>
        </div>

        {/* Sertifikaatit & turvallisuus (Certifications & Safety) */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Certifications & Safety</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Drone Certifications / Registrations</label>
            <input
              type="text"
              value={formData.droneCertifications.join(", ")}
              onChange={(e) => handleInputChange("droneCertifications", e.target.value.split(",").map(s => s.trim()).filter(s => s))}
              style={inputStyle}
              placeholder="e.g., EASA A1/A3, drone registration number (comma-separated)"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Liability Insurance</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.liabilityInsurance?.hasInsurance || false}
                  onChange={(e) => handleInputChange("liabilityInsurance", {
                    ...formData.liabilityInsurance,
                    hasInsurance: e.target.checked,
                    amount: formData.liabilityInsurance?.amount || ""
                  })}
                />
                <span style={{ fontSize: "14px" }}>Has Liability Insurance</span>
              </label>
              {formData.liabilityInsurance?.hasInsurance && (
                <input
                  type="text"
                  value={formData.liabilityInsurance?.amount || ""}
                  onChange={(e) => handleInputChange("liabilityInsurance", {
                    ...formData.liabilityInsurance,
                    amount: e.target.value
                  })}
                  style={{ ...inputStyle, width: "200px" }}
                  placeholder="Coverage amount (€)"
                />
              )}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Safety Cards / Certifications</label>
            <input
              type="text"
              value={formData.safetyCards.join(", ")}
              onChange={(e) => handleInputChange("safetyCards", e.target.value.split(",").map(s => s.trim()).filter(s => s))}
              style={inputStyle}
              placeholder="e.g., Työturvallisuuskortti, First Aid (comma-separated)"
            />
          </div>
        </div>

        {/* Saatavuus (Availability) */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Availability</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Weekly Availability</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["Weekdays", "Weekends", "Evenings"].map((avail) => (
                <label key={avail} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.weeklyAvailability.includes(avail)}
                    onChange={() => handleArrayChange("weeklyAvailability", avail)}
                  />
                  <span style={{ fontSize: "14px" }}>{avail}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Lead Time (How quickly can you start?)</label>
            <select
              value={formData.leadTime}
              onChange={(e) => handleInputChange("leadTime", e.target.value)}
              style={inputStyle}
            >
              <option value="">Select lead time</option>
              <option value="immediate">Immediate (same day)</option>
              <option value="1-2 days">1-2 days</option>
              <option value="1 week">1 week</option>
              <option value="2+ weeks">2+ weeks</option>
            </select>
          </div>
        </div>

        {/* Viestintä & käytännöt (Communication & Practices) */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Communication & Practices</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Preferred Contact Method</label>
            <select
              value={formData.preferredContactMethod}
              onChange={(e) => handleInputChange("preferredContactMethod", e.target.value)}
              style={inputStyle}
            >
              <option value="">Select preferred method</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="messenger">Messenger</option>
            </select>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.hasContractTemplate}
                onChange={(e) => handleInputChange("hasContractTemplate", e.target.checked)}
              />
              <span style={labelStyle}>Has Own Contract Template</span>
            </label>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Cancellation Terms / Deposit Required</label>
            <div style={{ marginBottom: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.depositRequired}
                  onChange={(e) => handleInputChange("depositRequired", e.target.checked)}
                />
                <span style={{ fontSize: "14px" }}>Deposit Required</span>
              </label>
            </div>
            <textarea
              value={formData.cancellationTerms}
              onChange={(e) => handleInputChange("cancellationTerms", e.target.value)}
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              placeholder="Describe your cancellation terms and deposit policy"
            />
          </div>
        </div>

        {/* Some & kanavat (Social Media & Channels) */}
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Social Media & Channels</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              style={inputStyle}
              placeholder="https://..."
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Instagram</label>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) => handleInputChange("instagram", e.target.value)}
              style={inputStyle}
              placeholder="@username or URL"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>TikTok</label>
            <input
              type="text"
              value={formData.tiktok}
              onChange={(e) => handleInputChange("tiktok", e.target.value)}
              style={inputStyle}
              placeholder="@username or URL"
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>YouTube</label>
            <input
              type="url"
              value={formData.youtube}
              onChange={(e) => handleInputChange("youtube", e.target.value)}
              style={inputStyle}
              placeholder="https://youtube.com/..."
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Vimeo</label>
            <input
              type="url"
              value={formData.vimeo}
              onChange={(e) => handleInputChange("vimeo", e.target.value)}
              style={inputStyle}
              placeholder="https://vimeo.com/..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}>
          <button
            type="button"
            onClick={() => navigate("/portfolio")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "transparent",
              color: "#1E3A8A",
              border: "1px solid #1E3A8A",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: saving ? "#94A3B8" : "#1E3A8A",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PhotographerProfile;

