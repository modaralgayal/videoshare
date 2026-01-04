import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postJob } from "../controllers/jobs";
import { getUser, isAuthenticated } from "../controllers/user";

export const PostJob = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state - comprehensive structure
  const [formData, setFormData] = useState({
    // Step 0 - Auth (handled by existing auth, but we verify email/phone)
    email: user?.email || "",
    phoneNumber: "",

    // Step 1 - Basic Settings
    customerType: "", // "yksityinen" | "yritys"
    projectContext: "", // "häät" | "yksityinen" | "yritys" | "en_tiedä"

    // Step 2 - Services
    services: [], // ["valokuvat", "videotuotanto", "dronekuvat", "dronevideo", "lyhytvideot", "editointi"]

    // Step 3 - Basic Info
    city: "",
    area: "",
    exactAddress: "",
    radius: "",
    customRadius: "",
    allowFurther: false,
    date: "",
    dateRange: { start: "", end: "" },
    dateNotLocked: false,
    duration: "",
    budgetMin: "",
    budgetMax: "",
    budgetUnknown: false,
    preferredProfile: "", // "solo" | "2-3" | "tuotantoyhtiö" | "ei_väliä"
    difficulty: "", // "perus" | "keskitaso" | "vaativa"
    difficultyDetails: "",
    priority: [], // ["hinta", "laatu", "nopeus", "luova_tyyli"]

    // Step 4 - Service Modules (conditional)
    // 4A - Valokuvat
    photoSubjects: [], // ["henkilöt", "tuote", "tila", "tapahtuma", "teollisuus", "muu"]
    photoCount: "",
    photoEditing: "",
    photoUsage: [], // ["yksityinen", "some", "yritysmarkkinointi", "maksettu_mainonta"]
    photoDetails: "",

    // 4B - Videotuotanto
    videoCount: "",
    videoLength: "",
    videoFormat: [], // ["16:9", "9:16", "molemmat"]
    videoNeeds: [], // ["konsepti", "kuvaus", "editointi", "tekstit", "voice_over"]
    videoUsage: [], // ["some", "nettisivut", "myynti", "mainonta"]
    videoDetails: "",

    // 4C - Drone
    droneSubject: [], // ["kiinteistö", "tapahtuma", "teollisuus", "luonto", "muu"]
    droneRestriction: "", // "en_tiedä" | "kyllä" | "ei"
    droneDetails: "",

    // 4D - Lyhytvideot
    shortVideoChannels: [], // ["tiktok", "reels", "shorts"]
    shortVideoWhoFilms: "", // "tekijä" | "asiakas" | "hybridi"
    shortVideoFrequency: "", // "kertaluonteinen" | "säännöllinen"
    shortVideoCount: "",
    shortVideoContractMonths: "",
    shortVideoRights: "", // "orgaaninen" | "maksettu" | "molemmat"
    shortVideoStyle: [], // ["trendi", "informatiivinen", "humor", "cinematic", "brändi"]
    shortVideoDetails: "",

    // 4E - Editointi
    editingSource: [], // ["puhelin", "kamera", "mixed"]
    editingFormat: [], // ["9:16", "16:9", "molemmat"]
    editingDetails: "",

    // Step 5 - Description & References
    description: "", // Required
    referenceLinks: [],
    attachments: [],
  });

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (!isAuthenticated() || !user || user.userType !== "customer") {
      navigate("/signin");
    }
  }, [navigate, user]);

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
        const index = currentArray.indexOf(value);
        if (index > -1) {
          return { ...prev, [field]: currentArray.filter((item) => item !== value) };
        } else {
          return { ...prev, [field]: [...currentArray, value] };
        }
      }
    });
  };

  const addReferenceLink = () => {
    setFormData((prev) => ({
      ...prev,
      referenceLinks: [...prev.referenceLinks, ""],
    }));
  };

  const updateReferenceLink = (index, value) => {
    setFormData((prev) => {
      const newLinks = [...prev.referenceLinks];
      newLinks[index] = value;
      return { ...prev, referenceLinks: newLinks };
    });
  };

  const removeReferenceLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      referenceLinks: prev.referenceLinks.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step) => {
    setError("");
    
    if (step === 1) {
      if (!formData.customerType) {
        setError("Please select customer type");
        return false;
      }
      if (!formData.projectContext) {
        setError("Please select project context");
        return false;
      }
    }

    if (step === 2) {
      if (formData.services.length === 0) {
        setError("Please select at least one service");
        return false;
      }
    }

    if (step === 3) {
      if (!formData.city) {
        setError("City is required");
        return false;
      }
      if (!formData.radius) {
        setError("Please select radius");
        return false;
      }
      if (!formData.date && !formData.dateRange.start) {
        setError("Please select a date or date range");
        return false;
      }
      if (!formData.duration) {
        setError("Please select duration");
        return false;
      }
      if (!formData.budgetUnknown && (!formData.budgetMin || !formData.budgetMax)) {
        setError("Please enter budget range or select 'I don't know'");
        return false;
      }
      if (!formData.budgetUnknown) {
        const min = parseFloat(formData.budgetMin);
        const max = parseFloat(formData.budgetMax);
        if (isNaN(min) || isNaN(max) || min >= max) {
          setError("Budget max must be greater than min");
          return false;
        }
      }
      if (!formData.difficulty) {
        setError("Please select difficulty level");
        return false;
      }
    }

    if (step === 5) {
      if (!formData.description.trim()) {
        setError("Description is required");
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Calculate expiration date (90 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      const jobData = {
        // Basic info
        customerType: formData.customerType,
        projectContext: formData.projectContext,
        services: formData.services,
        
        // Location
        city: formData.city,
        area: formData.area || null,
        exactAddress: formData.exactAddress || null,
        radius: formData.radius,
        allowFurther: formData.allowFurther,
        
        // Date
        date: formData.date || null,
        dateRange: formData.dateRange.start ? formData.dateRange : null,
        dateNotLocked: formData.dateNotLocked,
        
        // Duration & Budget
        duration: formData.duration,
        budgetMin: formData.budgetUnknown ? null : parseFloat(formData.budgetMin),
        budgetMax: formData.budgetUnknown ? null : parseFloat(formData.budgetMax),
        budgetUnknown: formData.budgetUnknown,
        
        // Profile & Difficulty
        preferredProfile: formData.preferredProfile || null,
        difficulty: formData.difficulty,
        difficultyDetails: formData.difficultyDetails || null,
        priority: formData.priority,
        
        // Service modules
        photoSubjects: formData.services.includes("valokuvat") ? formData.photoSubjects : null,
        photoCount: formData.services.includes("valokuvat") ? formData.photoCount || null : null,
        photoEditing: formData.services.includes("valokuvat") ? formData.photoEditing || null : null,
        photoUsage: formData.services.includes("valokuvat") ? formData.photoUsage : null,
        photoDetails: formData.services.includes("valokuvat") ? formData.photoDetails || null : null,
        
        videoCount: formData.services.includes("videotuotanto") ? formData.videoCount || null : null,
        videoLength: formData.services.includes("videotuotanto") ? formData.videoLength || null : null,
        videoFormat: formData.services.includes("videotuotanto") ? formData.videoFormat : null,
        videoNeeds: formData.services.includes("videotuotanto") ? formData.videoNeeds : null,
        videoUsage: formData.services.includes("videotuotanto") ? formData.videoUsage : null,
        videoDetails: formData.services.includes("videotuotanto") ? formData.videoDetails || null : null,
        
        droneSubject: (formData.services.includes("dronekuvat") || formData.services.includes("dronevideo")) ? formData.droneSubject : null,
        droneRestriction: (formData.services.includes("dronekuvat") || formData.services.includes("dronevideo")) ? formData.droneRestriction || null : null,
        droneDetails: (formData.services.includes("dronekuvat") || formData.services.includes("dronevideo")) ? formData.droneDetails || null : null,
        
        shortVideoChannels: formData.services.includes("lyhytvideot") ? formData.shortVideoChannels : null,
        shortVideoWhoFilms: formData.services.includes("lyhytvideot") ? formData.shortVideoWhoFilms || null : null,
        shortVideoFrequency: formData.services.includes("lyhytvideot") ? formData.shortVideoFrequency || null : null,
        shortVideoCount: formData.services.includes("lyhytvideot") ? formData.shortVideoCount || null : null,
        shortVideoContractMonths: formData.services.includes("lyhytvideot") && formData.shortVideoFrequency === "säännöllinen" ? formData.shortVideoContractMonths || null : null,
        shortVideoRights: formData.services.includes("lyhytvideot") ? formData.shortVideoRights || null : null,
        shortVideoStyle: formData.services.includes("lyhytvideot") ? formData.shortVideoStyle : null,
        shortVideoDetails: formData.services.includes("lyhytvideot") ? formData.shortVideoDetails || null : null,
        
        editingSource: formData.services.includes("editointi") ? formData.editingSource : null,
        editingFormat: formData.services.includes("editointi") ? formData.editingFormat : null,
        editingDetails: formData.services.includes("editointi") ? formData.editingDetails || null : null,
        
        // Description & References
        description: formData.description.trim(),
        referenceLinks: formData.referenceLinks.filter(link => link.trim()),
        attachments: formData.attachments, // Will be handled separately if file upload needed
        
        // Metadata
        status: "open",
        expiresAt: expiresAt.toISOString(),
      };

      await postJob(jobData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate("/jobs");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.userType !== "customer") {
    return null;
  }

  const totalSteps = 6;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const commonInputStyle = {
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

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "#0F172A", marginBottom: "0.5rem" }}>Post a Job Request</h1>
        <p style={{ color: "#475569", fontSize: "14px", marginBottom: "1rem" }}>
          Tarjouspyynnön jättäminen on täysin maksutonta.
        </p>
        
        {/* Progress Bar */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "14px", color: "#475569" }}>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span style={{ fontSize: "14px", color: "#475569" }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#E2E8F0",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#1E3A8A",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
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
          Job posted successfully! Redirecting...
        </div>
      )}

      {/* Step 0 - Already authenticated, just verify */}
      {currentStep === 0 && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "2rem" }}>
          <h2 style={{ color: "#0F172A", marginBottom: "1rem" }}>Verification</h2>
          <p style={{ color: "#475569", marginBottom: "1.5rem" }}>
            You are logged in as: {user.email || user.name}
          </p>
          <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "1.5rem" }}>
            Tarjoukset toimitetaan sähköpostiisi. Varmista, että sähköpostiosoitteesi on oikein.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={nextStep}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#1E3A8A",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 1 - Basic Settings */}
      {currentStep === 1 && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "2rem" }}>
          <h2 style={{ color: "#0F172A", marginBottom: "1.5rem" }}>Basic Settings</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Customer Type <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "1rem" }}>
              {["yksityinen", "yritys"].map((type) => (
                <label
                  key={type}
                  style={{
                    flex: 1,
                    padding: "1rem",
                    border: `2px solid ${formData.customerType === type ? "#1E3A8A" : "#E2E8F0"}`,
                    borderRadius: "5px",
                    cursor: "pointer",
                    backgroundColor: formData.customerType === type ? "#EFF6FF" : "#FFFFFF",
                    textAlign: "center",
                  }}
                >
                  <input
                    type="radio"
                    name="customerType"
                    value={type}
                    checked={formData.customerType === type}
                    onChange={(e) => handleInputChange("customerType", e.target.value)}
                    style={{ marginRight: "0.5rem" }}
                  />
                  {type === "yksityinen" ? "Private" : "Company"}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Project Context <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { value: "häät", label: "Wedding" },
                { value: "yksityinen", label: "Private" },
                { value: "yritys", label: "Company" },
                { value: "en_tiedä", label: "Not sure" },
              ].map((option) => (
                <label
                  key={option.value}
                  style={{
                    padding: "1rem",
                    border: `2px solid ${formData.projectContext === option.value ? "#1E3A8A" : "#E2E8F0"}`,
                    borderRadius: "5px",
                    cursor: "pointer",
                    backgroundColor: formData.projectContext === option.value ? "#EFF6FF" : "#FFFFFF",
                    textAlign: "center",
                  }}
                >
                  <input
                    type="radio"
                    name="projectContext"
                    value={option.value}
                    checked={formData.projectContext === option.value}
                    onChange={(e) => handleInputChange("projectContext", e.target.value)}
                    style={{ marginRight: "0.5rem" }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}>
            <button type="button" onClick={prevStep} style={{ padding: "0.75rem 1.5rem", backgroundColor: "transparent", color: "#1E3A8A", border: "1px solid #1E3A8A", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}>
              Back
            </button>
            <button type="button" onClick={nextStep} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#1E3A8A", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", fontWeight: "600" }}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2 - Services */}
      {currentStep === 2 && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "2rem" }}>
          <h2 style={{ color: "#0F172A", marginBottom: "1.5rem" }}>What Services Do You Need?</h2>
          <p style={{ color: "#475569", marginBottom: "1.5rem", fontSize: "14px", fontStyle: "italic" }}>
            Tämä tarjouspyyntö etsiin ensisijaisesti yhtä tekijää, joka pystyy toteuttamaan kaikki valitsemasi osa-alueet.
          </p>
          
          <div style={{ marginBottom: "1.5rem" }}>
            {[
              { value: "valokuvat", label: "Valokuvat (Photos)" },
              { value: "videotuotanto", label: "Videotuotanto (Video Production)" },
              { value: "dronekuvat", label: "Dronekuvat (Drone Photos)" },
              { value: "dronevideo", label: "Dronevideo (Drone Video)" },
              { value: "lyhytvideot", label: "Lyhytvideot / vertical (TikTok / Reels / Shorts / UGC)" },
              { value: "editointi", label: "Pelkkä editointi (Editing only)" },
            ].map((service) => (
              <label
                key={service.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "1rem",
                  marginBottom: "0.5rem",
                  border: `2px solid ${formData.services.includes(service.value) ? "#1E3A8A" : "#E2E8F0"}`,
                  borderRadius: "5px",
                  cursor: "pointer",
                  backgroundColor: formData.services.includes(service.value) ? "#EFF6FF" : "#FFFFFF",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.services.includes(service.value)}
                  onChange={() => handleArrayChange("services", service.value)}
                  style={{ marginRight: "0.75rem", width: "18px", height: "18px" }}
                />
                <span style={{ fontSize: "14px", fontWeight: "500" }}>{service.label}</span>
              </label>
            ))}
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}>
            <button type="button" onClick={prevStep} style={{ padding: "0.75rem 1.5rem", backgroundColor: "transparent", color: "#1E3A8A", border: "1px solid #1E3A8A", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}>
              Back
            </button>
            <button type="button" onClick={nextStep} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#1E3A8A", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", fontWeight: "600" }}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3 - Basic Info */}
      {currentStep === 3 && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "2rem" }}>
          <h2 style={{ color: "#0F172A", marginBottom: "1.5rem" }}>Basic Information</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={labelStyle}>
                City <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                style={commonInputStyle}
                placeholder="e.g., Helsinki"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Area / District</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                style={commonInputStyle}
                placeholder="e.g., Lauttasaari"
              />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Exact Address / Venue</label>
            <input
              type="text"
              value={formData.exactAddress}
              onChange={(e) => handleInputChange("exactAddress", e.target.value)}
              style={commonInputStyle}
              placeholder="Exact address (only shown to accepted bidder)"
            />
            <p style={{ fontSize: "12px", color: "#64748B", marginTop: "0.25rem" }}>
              Tarkka osoite avautuu vasta hyväksynnässä.
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Radius (km) <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <select
              value={formData.radius}
              onChange={(e) => {
                if (e.target.value !== "custom") {
                  handleInputChange("radius", e.target.value);
                } else {
                  handleInputChange("radius", "custom");
                }
              }}
              style={commonInputStyle}
              required
            >
              <option value="">Select radius</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
              <option value="custom">Custom</option>
            </select>
            {formData.radius === "custom" && (
              <input
                type="number"
                value={formData.customRadius || ""}
                onChange={(e) => {
                  handleInputChange("customRadius", e.target.value);
                  handleInputChange("radius", e.target.value);
                }}
                style={{ ...commonInputStyle, marginTop: "0.5rem" }}
                placeholder="Enter custom radius in km"
                min="1"
              />
            )}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.allowFurther}
                onChange={(e) => handleInputChange("allowFurther", e.target.checked)}
              />
              <span style={labelStyle}>Saa tarjota myös kauempaa</span>
            </label>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Date <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                style={commonInputStyle}
              />
              <span style={{ color: "#64748B" }}>or</span>
              <div style={{ display: "flex", gap: "0.5rem", flex: 1 }}>
                <input
                  type="date"
                  value={formData.dateRange.start}
                  onChange={(e) => handleInputChange("dateRange", { ...formData.dateRange, start: e.target.value })}
                  style={commonInputStyle}
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={formData.dateRange.end}
                  onChange={(e) => handleInputChange("dateRange", { ...formData.dateRange, end: e.target.value })}
                  style={commonInputStyle}
                  placeholder="End date"
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.dateNotLocked}
                onChange={(e) => handleInputChange("dateNotLocked", e.target.checked)}
              />
              <span style={labelStyle}>Päivä ei lukittu</span>
            </label>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Duration <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <select
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
              style={commonInputStyle}
              required
            >
              <option value="">Select duration</option>
              <option value="1-2 hours">1-2 hours</option>
              <option value="Half day (3-4 hours)">Half day (3-4 hours)</option>
              <option value="Full day (6-8 hours)">Full day (6-8 hours)</option>
              <option value="Multiple days">Multiple days</option>
              <option value="Week">Week</option>
              <option value="Ongoing">Ongoing</option>
            </select>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Budget <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div style={{ marginBottom: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.budgetUnknown}
                  onChange={(e) => {
                    handleInputChange("budgetUnknown", e.target.checked);
                    if (e.target.checked) {
                      handleInputChange("budgetMin", "");
                      handleInputChange("budgetMax", "");
                    }
                  }}
                />
                <span style={{ fontSize: "14px" }}>En tiedä (I don't know)</span>
              </label>
            </div>
            {!formData.budgetUnknown && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <input
                  type="number"
                  value={formData.budgetMin}
                  onChange={(e) => handleInputChange("budgetMin", e.target.value)}
                  style={commonInputStyle}
                  placeholder="Min (€)"
                  min="0"
                  step="0.01"
                />
                <input
                  type="number"
                  value={formData.budgetMax}
                  onChange={(e) => handleInputChange("budgetMax", e.target.value)}
                  style={commonInputStyle}
                  placeholder="Max (€)"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Preferred Photographer Profile</label>
            <select
              value={formData.preferredProfile}
              onChange={(e) => handleInputChange("preferredProfile", e.target.value)}
              style={commonInputStyle}
            >
              <option value="">No preference</option>
              <option value="solo">Solo</option>
              <option value="2-3">2-3 people</option>
              <option value="tuotantoyhtiö">Production Company</option>
              <option value="ei_väliä">No preference</option>
            </select>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Difficulty Level <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "1rem" }}>
              {["perus", "keskitaso", "vaativa"].map((level) => (
                <label
                  key={level}
                  style={{
                    flex: 1,
                    padding: "1rem",
                    border: `2px solid ${formData.difficulty === level ? "#1E3A8A" : "#E2E8F0"}`,
                    borderRadius: "5px",
                    cursor: "pointer",
                    backgroundColor: formData.difficulty === level ? "#EFF6FF" : "#FFFFFF",
                    textAlign: "center",
                  }}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={formData.difficulty === level}
                    onChange={(e) => handleInputChange("difficulty", e.target.value)}
                    style={{ marginRight: "0.5rem" }}
                  />
                  {level === "perus" ? "Basic" : level === "keskitaso" ? "Intermediate" : "Advanced"}
                </label>
              ))}
            </div>
          </div>

          {formData.difficulty && (
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Difficulty Details</label>
              <textarea
                value={formData.difficultyDetails}
                onChange={(e) => handleInputChange("difficultyDetails", e.target.value)}
                style={{ ...commonInputStyle, minHeight: "80px", resize: "vertical" }}
                placeholder="Explain why this is basic/intermediate/advanced..."
              />
            </div>
          )}

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Priority (Select all that apply)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {[
                { value: "hinta", label: "Price" },
                { value: "laatu", label: "Quality" },
                { value: "nopeus", label: "Speed" },
                { value: "luova_tyyli", label: "Creative Style" },
              ].map((priority) => (
                <label
                  key={priority.value}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={formData.priority.includes(priority.value)}
                    onChange={() => handleArrayChange("priority", priority.value)}
                  />
                  <span style={{ fontSize: "14px" }}>{priority.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}>
            <button type="button" onClick={prevStep} style={{ padding: "0.75rem 1.5rem", backgroundColor: "transparent", color: "#1E3A8A", border: "1px solid #1E3A8A", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}>
              Back
            </button>
            <button type="button" onClick={nextStep} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#1E3A8A", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", fontWeight: "600" }}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 4 - Service Modules (conditional) */}
      {currentStep === 4 && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "2rem" }}>
          <h2 style={{ color: "#0F172A", marginBottom: "1.5rem" }}>Service Details</h2>
          
          {/* 4A - Photos Module */}
          {formData.services.includes("valokuvat") && (
            <div style={{ marginBottom: "2rem", padding: "1.5rem", backgroundColor: "#F8FAFC", borderRadius: "8px" }}>
              <h3 style={{ color: "#0F172A", marginBottom: "1rem", fontSize: "18px" }}>Photos</h3>
              
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Photo Subjects</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["henkilöt", "tuote", "tila", "tapahtuma", "teollisuus", "muu"].map((subject) => (
                    <label key={subject} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.photoSubjects.includes(subject)}
                        onChange={() => handleArrayChange("photoSubjects", subject)}
                      />
                      <span style={{ fontSize: "14px" }}>{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Estimated Photo Count</label>
                <select
                  value={formData.photoCount}
                  onChange={(e) => handleInputChange("photoCount", e.target.value)}
                  style={commonInputStyle}
                >
                  <option value="">Select</option>
                  <option value="10">~10 photos</option>
                  <option value="30">~30 photos</option>
                  <option value="50">~50 photos</option>
                  <option value="100+">100+ photos</option>
                  <option value="en_tiedä">I don't know</option>
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Editing Level</label>
                <select
                  value={formData.photoEditing}
                  onChange={(e) => handleInputChange("photoEditing", e.target.value)}
                  style={commonInputStyle}
                >
                  <option value="">Select</option>
                  <option value="perus">Basic</option>
                  <option value="laajempi_retusointi">Extended retouching</option>
                  <option value="en_tiedä">I don't know</option>
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Usage</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["yksityinen", "some", "yritysmarkkinointi", "maksettu_mainonta"].map((usage) => (
                    <label key={usage} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.photoUsage.includes(usage)}
                        onChange={() => handleArrayChange("photoUsage", usage)}
                      />
                      <span style={{ fontSize: "14px" }}>{usage}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Additional Details</label>
                <textarea
                  value={formData.photoDetails}
                  onChange={(e) => handleInputChange("photoDetails", e.target.value)}
                  style={{ ...commonInputStyle, minHeight: "80px", resize: "vertical" }}
                  placeholder="Any additional details about photo needs..."
                />
              </div>
            </div>
          )}

          {/* 4B - Video Production Module */}
          {formData.services.includes("videotuotanto") && (
            <div style={{ marginBottom: "2rem", padding: "1.5rem", backgroundColor: "#F8FAFC", borderRadius: "8px" }}>
              <h3 style={{ color: "#0F172A", marginBottom: "1rem", fontSize: "18px" }}>Video Production</h3>
              
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Number of Videos</label>
                <select
                  value={formData.videoCount}
                  onChange={(e) => handleInputChange("videoCount", e.target.value)}
                  style={commonInputStyle}
                >
                  <option value="">Select</option>
                  <option value="1">1 video</option>
                  <option value="2-3">2-3 videos</option>
                  <option value="4-5">4-5 videos</option>
                  <option value="6+">6+ videos</option>
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Target Length</label>
                <select
                  value={formData.videoLength}
                  onChange={(e) => handleInputChange("videoLength", e.target.value)}
                  style={commonInputStyle}
                >
                  <option value="">Select</option>
                  <option value="30s">~30 seconds</option>
                  <option value="1min">~1 minute</option>
                  <option value="2-3min">2-3 minutes</option>
                  <option value="5+min">5+ minutes</option>
                </select>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Format <span style={{ color: "#EF4444" }}>*</span></label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["16:9", "9:16", "molemmat"].map((format) => (
                    <label key={format} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.videoFormat.includes(format)}
                        onChange={() => handleArrayChange("videoFormat", format)}
                      />
                      <span style={{ fontSize: "14px" }}>{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Needs</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["konsepti", "kuvaus", "editointi", "tekstit", "voice_over"].map((need) => (
                    <label key={need} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.videoNeeds.includes(need)}
                        onChange={() => handleArrayChange("videoNeeds", need)}
                      />
                      <span style={{ fontSize: "14px" }}>{need}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Usage</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["some", "nettisivut", "myynti", "mainonta"].map((usage) => (
                    <label key={usage} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.videoUsage.includes(usage)}
                        onChange={() => handleArrayChange("videoUsage", usage)}
                      />
                      <span style={{ fontSize: "14px" }}>{usage}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Additional Details</label>
                <textarea
                  value={formData.videoDetails}
                  onChange={(e) => handleInputChange("videoDetails", e.target.value)}
                  style={{ ...commonInputStyle, minHeight: "80px", resize: "vertical" }}
                  placeholder="Any additional details about video needs..."
                />
              </div>
            </div>
          )}

          {/* 4C - Drone Module */}
          {(formData.services.includes("dronekuvat") || formData.services.includes("dronevideo")) && (
            <div style={{ marginBottom: "2rem", padding: "1.5rem", backgroundColor: "#F8FAFC", borderRadius: "8px" }}>
              <h3 style={{ color: "#0F172A", marginBottom: "1rem", fontSize: "18px" }}>Drone</h3>
              
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Subject</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["kiinteistö", "tapahtuma", "teollisuus", "luonto", "muu"].map((subject) => (
                    <label key={subject} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.droneSubject.includes(subject)}
                        onChange={() => handleArrayChange("droneSubject", subject)}
                      />
                      <span style={{ fontSize: "14px" }}>{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Restricted Environment</label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  {["en_tiedä", "kyllä", "ei"].map((option) => (
                    <label key={option} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="droneRestriction"
                        value={option}
                        checked={formData.droneRestriction === option}
                        onChange={(e) => handleInputChange("droneRestriction", e.target.value)}
                      />
                      <span style={{ fontSize: "14px" }}>
                        {option === "en_tiedä" ? "I don't know" : option === "kyllä" ? "Yes" : "No"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Additional Details</label>
                <textarea
                  value={formData.droneDetails}
                  onChange={(e) => handleInputChange("droneDetails", e.target.value)}
                  style={{ ...commonInputStyle, minHeight: "80px", resize: "vertical" }}
                  placeholder="Any additional details about drone needs..."
                />
              </div>
            </div>
          )}

          {/* 4D - Short Videos Module */}
          {formData.services.includes("lyhytvideot") && (
            <div style={{ marginBottom: "2rem", padding: "1.5rem", backgroundColor: "#F8FAFC", borderRadius: "8px" }}>
              <h3 style={{ color: "#0F172A", marginBottom: "1rem", fontSize: "18px" }}>Short Videos / Vertical</h3>
              
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Channels <span style={{ color: "#EF4444" }}>*</span></label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["tiktok", "reels", "shorts"].map((channel) => (
                    <label key={channel} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.shortVideoChannels.includes(channel)}
                        onChange={() => handleArrayChange("shortVideoChannels", channel)}
                      />
                      <span style={{ fontSize: "14px" }}>{channel}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Who Films <span style={{ color: "#EF4444" }}>*</span></label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  {["tekijä", "asiakas", "hybridi"].map((option) => (
                    <label key={option} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="shortVideoWhoFilms"
                        value={option}
                        checked={formData.shortVideoWhoFilms === option}
                        onChange={(e) => handleInputChange("shortVideoWhoFilms", e.target.value)}
                      />
                      <span style={{ fontSize: "14px" }}>
                        {option === "tekijä" ? "Photographer" : option === "asiakas" ? "Customer films, photographer edits" : "Hybrid"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>
                  Frequency <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  {["kertaluonteinen", "säännöllinen"].map((option) => (
                    <label key={option} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="shortVideoFrequency"
                        value={option}
                        checked={formData.shortVideoFrequency === option}
                        onChange={(e) => handleInputChange("shortVideoFrequency", e.target.value)}
                      />
                      <span style={{ fontSize: "14px" }}>
                        {option === "kertaluonteinen" ? "One-time" : "Regular"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.shortVideoFrequency && (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={labelStyle}>
                      Video Count <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <select
                      value={formData.shortVideoCount}
                      onChange={(e) => handleInputChange("shortVideoCount", e.target.value)}
                      style={commonInputStyle}
                      required
                    >
                      <option value="">Select</option>
                      <option value="1">1 video</option>
                      <option value="2-5">2-5 videos</option>
                      <option value="6-10">6-10 videos</option>
                      <option value="10+">10+ videos</option>
                    </select>
                  </div>

                  {formData.shortVideoFrequency === "säännöllinen" && (
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={labelStyle}>
                        Contract Period (months) <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <select
                        value={formData.shortVideoContractMonths}
                        onChange={(e) => handleInputChange("shortVideoContractMonths", e.target.value)}
                        style={commonInputStyle}
                        required
                      >
                        <option value="">Select</option>
                        <option value="1">1 month</option>
                        <option value="3">3 months</option>
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Usage Rights</label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  {["orgaaninen", "maksettu", "molemmat"].map((option) => (
                    <label key={option} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="shortVideoRights"
                        value={option}
                        checked={formData.shortVideoRights === option}
                        onChange={(e) => handleInputChange("shortVideoRights", e.target.value)}
                      />
                      <span style={{ fontSize: "14px" }}>
                        {option === "orgaaninen" ? "Organic only" : option === "maksettu" ? "Paid allowed" : "Both"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Style</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["trendi", "informatiivinen", "humor", "cinematic", "brändi"].map((style) => (
                    <label key={style} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.shortVideoStyle.includes(style)}
                        onChange={() => handleArrayChange("shortVideoStyle", style)}
                      />
                      <span style={{ fontSize: "14px" }}>{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Additional Details</label>
                <textarea
                  value={formData.shortVideoDetails}
                  onChange={(e) => handleInputChange("shortVideoDetails", e.target.value)}
                  style={{ ...commonInputStyle, minHeight: "80px", resize: "vertical" }}
                  placeholder="Any additional details about short video needs..."
                />
              </div>
            </div>
          )}

          {/* 4E - Editing Only Module */}
          {formData.services.includes("editointi") && (
            <div style={{ marginBottom: "2rem", padding: "1.5rem", backgroundColor: "#F8FAFC", borderRadius: "8px" }}>
              <h3 style={{ color: "#0F172A", marginBottom: "1rem", fontSize: "18px" }}>Editing Only</h3>
              
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Material Source</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["puhelin", "kamera", "mixed"].map((source) => (
                    <label key={source} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.editingSource.includes(source)}
                        onChange={() => handleArrayChange("editingSource", source)}
                      />
                      <span style={{ fontSize: "14px" }}>{source}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Delivery Format</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {["9:16", "16:9", "molemmat"].map((format) => (
                    <label key={format} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={formData.editingFormat.includes(format)}
                        onChange={() => handleArrayChange("editingFormat", format)}
                      />
                      <span style={{ fontSize: "14px" }}>{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Additional Details</label>
                <textarea
                  value={formData.editingDetails}
                  onChange={(e) => handleInputChange("editingDetails", e.target.value)}
                  style={{ ...commonInputStyle, minHeight: "80px", resize: "vertical" }}
                  placeholder="Any additional details about editing needs..."
                />
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}>
            <button type="button" onClick={prevStep} style={{ padding: "0.75rem 1.5rem", backgroundColor: "transparent", color: "#1E3A8A", border: "1px solid #1E3A8A", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}>
              Back
            </button>
            <button type="button" onClick={nextStep} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#1E3A8A", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", fontWeight: "600" }}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 5 - Description & References */}
      {currentStep === 5 && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "2rem" }}>
          <h2 style={{ color: "#0F172A", marginBottom: "1.5rem" }}>Description & References</h2>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>
              Describe Your Need in Your Own Words <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              style={{ ...commonInputStyle, minHeight: "150px", resize: "vertical" }}
              placeholder="This is the most important field. Describe your project, requirements, timeline, and any special considerations..."
              required
            />
            <p style={{ fontSize: "12px", color: "#64748B", marginTop: "0.25rem" }}>
              This field "saves" all special cases (e.g., underwater + drone, etc.)
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Reference Links</label>
            {formData.referenceLinks.map((link, index) => (
              <div key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => updateReferenceLink(index, e.target.value)}
                  style={commonInputStyle}
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() => removeReferenceLink(index)}
                  style={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "#EF4444",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addReferenceLink}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#F8FAFC",
                color: "#1E3A8A",
                border: "1px solid #1E3A8A",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "14px",
                marginTop: "0.5rem",
              }}
            >
              + Add Reference Link
            </button>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}>
            <button type="button" onClick={prevStep} style={{ padding: "0.75rem 1.5rem", backgroundColor: "transparent", color: "#1E3A8A", border: "1px solid #1E3A8A", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}>
              Back
            </button>
            <button type="button" onClick={nextStep} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#1E3A8A", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", fontWeight: "600" }}>
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 6 - Summary & Publish */}
      {currentStep === 6 && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", padding: "2rem" }}>
          <h2 style={{ color: "#0F172A", marginBottom: "1.5rem" }}>Summary</h2>
          
          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#F8FAFC", borderRadius: "5px" }}>
            <h3 style={{ color: "#0F172A", marginBottom: "0.5rem" }}>Services</h3>
            <p style={{ color: "#475569" }}>{formData.services.join(", ") || "None selected"}</p>
          </div>

          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#F8FAFC", borderRadius: "5px" }}>
            <h3 style={{ color: "#0F172A", marginBottom: "0.5rem" }}>Location</h3>
            <p style={{ color: "#475569" }}>
              {formData.city}
              {formData.area && `, ${formData.area}`}
              {formData.radius && ` (${formData.radius} km radius)`}
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#F8FAFC", borderRadius: "5px" }}>
            <h3 style={{ color: "#0F172A", marginBottom: "0.5rem" }}>Date & Duration</h3>
            <p style={{ color: "#475569" }}>
              {formData.date || (formData.dateRange.start && `${formData.dateRange.start} - ${formData.dateRange.end}`) || "Not set"}
              {formData.dateNotLocked && " (Not locked)"}
            </p>
            <p style={{ color: "#475569" }}>Duration: {formData.duration || "Not set"}</p>
          </div>

          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#F8FAFC", borderRadius: "5px" }}>
            <h3 style={{ color: "#0F172A", marginBottom: "0.5rem" }}>Budget</h3>
            <p style={{ color: "#475569" }}>
              {formData.budgetUnknown
                ? "I don't know"
                : formData.budgetMin && formData.budgetMax
                ? `€${formData.budgetMin} - €${formData.budgetMax}`
                : "Not set"}
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#F8FAFC", borderRadius: "5px" }}>
            <h3 style={{ color: "#0F172A", marginBottom: "0.5rem" }}>Description</h3>
            <p style={{ color: "#475569", whiteSpace: "pre-wrap" }}>{formData.description || "Not provided"}</p>
          </div>

          <div style={{ marginBottom: "2rem", padding: "1rem", backgroundColor: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "5px" }}>
            <p style={{ color: "#92400E", fontSize: "14px", margin: 0 }}>
              <strong>Note:</strong> Julkaisun jälkeen tarjouspyyntöä ei voi muokata. Jos haluat muutoksia, poista pyyntö ja tee uusi.
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={prevStep}
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
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: loading ? "#94A3B8" : "#1E3A8A",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              {loading ? "Publishing..." : "Publish Job Request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostJob;
