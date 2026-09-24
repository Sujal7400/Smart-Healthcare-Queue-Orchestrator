import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function getPriorityColor(score) {
  if (score >= 100) return "#e74c3c";
  if (score >= 80) return "#e67e22";
  if (score >= 50) return "#f1c40f";
  return "#27ae60";
}

function StaffDashboard() {
  const { user, logout } = useAuth();

  const [department, setDepartment] = useState("");
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");

  const [referralForm, setReferralForm] = useState({
    patientId: "",
    referredFrom: "",
    referredToDepartment: "",
    urgencyLevel: "medium",
    reason: "",
  });

  const fetchQueue = async (dept) => {
    if (!dept) return;
    try {
      const res = await api.get(`/queue/live/${dept}`);
      setQueue(res.data.queue);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Failed to load queue"));
    }
  };

  const fetchStats = async (dept) => {
    if (!dept) return;
    try {
      const res = await api.get(`/queue/stats/${dept}`);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats");
    }
  };

  useEffect(() => {
    if (department) {
      fetchQueue(department);
      fetchStats(department);
    }

    socket.on("queueUpdated", (data) => {
      if (data.department === department) {
        fetchQueue(department);
        fetchStats(department);
      }
    });

    return () => socket.off("queueUpdated");
  }, [department]);

  const handleCallNext = async () => {
    setMessage("");
    try {
      const res = await api.put(`/queue/call-next/${department}`);
      setMessage(`✅ Called patient ID ${res.data.entry.patientId}`);
      fetchQueue(department);
      fetchStats(department);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Failed to call next patient"));
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/queue/complete/${id}`);
      fetchQueue(department);
      fetchStats(department);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Failed to complete"));
    }
  };

  const handleRemove = async (id) => {
    try {
      await api.put(`/queue/remove/${id}`);
      fetchQueue(department);
      fetchStats(department);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Failed to remove"));
    }
  };

  const handleReferralChange = (e) => {
    setReferralForm({ ...referralForm, [e.target.name]: e.target.value });
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/referrals/create", referralForm);
      setMessage("✅ Referral created and added to queue");
      setReferralForm({ patientId: "", referredFrom: "", referredToDepartment: "", urgencyLevel: "medium", reason: "" });
      if (referralForm.referredToDepartment === department) {
        fetchQueue(department);
        fetchStats(department);
      }
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Referral creation failed"));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={{ color: "#fff" }}>🩺 Admin Console — {user?.name}</h2>
        <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {/* DEPARTMENT SELECTOR */}
      <div style={styles.card}>
        <h3>Select Department to Manage</h3>
        <input
          style={styles.input}
          placeholder="Enter department name (e.g. Cardiology)"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <button style={styles.button} onClick={() => { fetchQueue(department); fetchStats(department); }}>Load Queue</button>
      </div>

      {/* STATS OVERVIEW */}
      {department && stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{stats.totalToday}</p>
            <p style={styles.statLabel}>Total Today</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{stats.currentlyWaiting}</p>
            <p style={styles.statLabel}>Currently Waiting</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{stats.completedToday}</p>
            <p style={styles.statLabel}>Completed Today</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statNumber}>{stats.averageWaitMinutes} min</p>
            <p style={styles.statLabel}>Avg Wait Time</p>
          </div>
        </div>
      )}

      {/* LIVE QUEUE */}
      {department && (
        <div style={styles.card}>
          <div style={styles.queueHeader}>
            <h3>📍 Live Queue — {department} ({queue.length} waiting)</h3>
            <button style={styles.callNextBtn} onClick={handleCallNext}>Call Next Patient</button>
          </div>

          {queue.length === 0 ? (
            <p>No patients waiting.</p>
          ) : (
            queue.map((entry) => (
              <div
                key={entry.id}
                style={{
                  ...styles.queueRow,
                  borderLeft: `5px solid ${getPriorityColor(entry.priorityScore)}`,
                  paddingLeft: "10px",
                }}
              >
                <span>
                  <b>#{entry.position}</b> — {entry.patient?.name} — {entry.sourceType} —
                  Priority: <b style={{ color: getPriorityColor(entry.priorityScore) }}>{entry.priorityScore}</b> —
                  Est. wait: {entry.estimatedWaitMinutes} min
                </span>
                <div>
                  <button style={styles.smallButton} onClick={() => handleComplete(entry.id)}>Mark Done</button>
                  <button style={styles.smallCancelButton} onClick={() => handleRemove(entry.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE REFERRAL */}
      <div style={styles.card}>
        <h3>➕ Create Referral</h3>
        <form onSubmit={handleCreateReferral} style={styles.form}>
          <input style={styles.input} placeholder="Patient ID" name="patientId" value={referralForm.patientId} onChange={handleReferralChange} required />
          <input style={styles.input} placeholder="Referred From (clinic/doctor)" name="referredFrom" value={referralForm.referredFrom} onChange={handleReferralChange} required />
          <input style={styles.input} placeholder="Referred To Department" name="referredToDepartment" value={referralForm.referredToDepartment} onChange={handleReferralChange} required />
          <select style={styles.input} name="urgencyLevel" value={referralForm.urgencyLevel} onChange={handleReferralChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="emergency">Emergency</option>
          </select>
          <textarea style={styles.input} placeholder="Reason (optional)" name="reason" value={referralForm.reason} onChange={handleReferralChange} />
          <button style={styles.button} type="submit">Create Referral</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "30px", background: "#0f1c2e", minHeight: "100vh", fontFamily: "Arial, sans-serif" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "25px", borderBottom: "2px solid #2e5aac", paddingBottom: "15px",
  },
  logoutBtn: { padding: "8px 16px", background: "#c0392b", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
  message: { background: "#1e3a5f", color: "#fff", padding: "10px", borderRadius: "6px", marginBottom: "15px" },
  card: {
    background: "#16273f", color: "#e0e6ed", padding: "20px", borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)", marginBottom: "20px", border: "1px solid #223354",
  },
  input: {
    padding: "8px", borderRadius: "6px", border: "1px solid #2e5aac",
    marginBottom: "10px", width: "100%", boxSizing: "border-box",
    background: "#0f1c2e", color: "#fff",
  },
  button: { padding: "10px 16px", background: "#2e5aac", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
  form: { display: "flex", flexDirection: "column", gap: "6px" },
  queueHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  callNextBtn: { padding: "10px 16px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" },
  queueRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 10px", borderBottom: "1px solid #223354", background: "#0f1c2e",
    borderRadius: "6px", marginBottom: "6px",
  },
  smallButton: { marginRight: "8px", padding: "6px 12px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  smallCancelButton: { padding: "6px 12px", background: "#e74c3c", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "20px" },
  statCard: { background: "#16273f", border: "1px solid #2e5aac", borderRadius: "10px", padding: "15px", textAlign: "center" },
  statNumber: { fontSize: "28px", fontWeight: "bold", color: "#4a90e2", margin: 0 },
  statLabel: { fontSize: "12px", color: "#9db2ce", margin: "5px 0 0 0" },
};

export default StaffDashboard;