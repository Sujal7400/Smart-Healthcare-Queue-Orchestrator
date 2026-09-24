import { Link } from "react-router-dom";

function Landing() {
  const features = [
    { icon: "📅", title: "Smart Appointment Booking", desc: "Book appointments across departments with real-time slot availability." },
    { icon: "🎫", title: "Walk-in Token System", desc: "Instant digital token generation for walk-in patients, no paperwork needed." },
    { icon: "📍", title: "Live Queue Tracking", desc: "Track your position and estimated wait time in real-time from anywhere." },
    { icon: "🚨", title: "Priority-Based Referrals", desc: "Emergency and high-urgency referral cases are automatically prioritized." },
    { icon: "⏱️", title: "Wait-Time Forecasting", desc: "Data-driven predictions estimate wait times based on historical patterns." },
    { icon: "🩺", title: "Staff Operational Dashboard", desc: "Real-time queue management console for hospital staff and doctors." },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.hospitalName}>🏥 MediQueue Hospital</h1>
        <p style={styles.tagline}>Smart Healthcare Queue Orchestrator</p>
        <p style={styles.subTagline}>
          Reducing patient wait times through intelligent queue management,
          referral prioritization, and real-time capacity forecasting.
        </p>
        <div style={styles.buttonRow}>
          <Link to="/login" style={styles.loginBtn}>Login</Link>
          <Link to="/register" style={styles.registerBtn}>Register</Link>
        </div>
      </div>

      <div style={styles.featuresSection}>
        <h2 style={styles.featuresTitle}>System Features</h2>
        <div style={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer style={styles.footer}>
        <p>Smart Healthcare Queue Orchestrator — Capstone Project</p>
      </footer>
    </div>
  );
}

const styles = {
  page: { fontFamily: "Arial, sans-serif", background: "#f0f4f8", minHeight: "100vh" },
  hero: {
    background: "linear-gradient(135deg, #2e5aac, #1a3c6e)",
    color: "#fff",
    textAlign: "center",
    padding: "60px 20px",
  },
  hospitalName: { fontSize: "36px", margin: "0 0 10px 0" },
  tagline: { fontSize: "18px", fontWeight: "bold", margin: "0 0 8px 0", opacity: 0.95 },
  subTagline: { fontSize: "14px", maxWidth: "550px", margin: "0 auto 30px auto", opacity: 0.85, lineHeight: "1.5" },
  buttonRow: { display: "flex", justifyContent: "center", gap: "15px" },
  loginBtn: {
    padding: "12px 28px", background: "#fff", color: "#2e5aac",
    borderRadius: "6px", textDecoration: "none", fontWeight: "bold",
  },
  registerBtn: {
    padding: "12px 28px", background: "transparent", color: "#fff",
    border: "2px solid #fff", borderRadius: "6px", textDecoration: "none", fontWeight: "bold",
  },
  featuresSection: { maxWidth: "1000px", margin: "0 auto", padding: "50px 20px" },
  featuresTitle: { textAlign: "center", color: "#1a3c6e", marginBottom: "30px" },
  featuresGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" },
  featureCard: {
    background: "#fff", padding: "20px", borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center",
  },
  featureIcon: { fontSize: "32px", marginBottom: "10px" },
  featureTitle: { fontSize: "16px", color: "#1a3c6e", margin: "0 0 8px 0" },
  featureDesc: { fontSize: "13px", color: "#666", lineHeight: "1.4", margin: 0 },
  footer: { textAlign: "center", padding: "20px", color: "#999", fontSize: "12px" },
};

export default Landing;