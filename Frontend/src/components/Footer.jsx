import { colors } from "../styles/theme";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: colors.primary, color: "white", marginTop: "auto" }}>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2.5rem 2rem 1.5rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2rem",
        }}
      >
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "0.75rem", color: "white" }}>
            kuvauspalvelut.fi
          </h3>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: "1.6" }}>
            Connecting customers with professional photographers and videographers across Finland.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            For Customers
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {["Post a Job", "View Bids", "Browse Photographers"].map((label) => (
              <span key={label} style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)" }}>{label}</span>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            For Photographers
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {["Browse Jobs", "Submit Bids", "Manage Portfolio"].map((label) => (
              <span key={label} style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)" }}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: "1rem 2rem",
          textAlign: "center",
          fontSize: "12px",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        © {year} kuvauspalvelut.fi — All rights reserved
      </div>
    </footer>
  );
};

export default Footer;
