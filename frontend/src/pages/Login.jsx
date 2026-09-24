import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.patient, res.data.token);

      // redirect based on role
      if (["staff", "doctor", "admin"].includes(res.data.patient.role)) {
        navigate("/staff-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p style={styles.error}>{error}</p>}

        <input style={styles.input} name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input style={styles.input} name="password" type="password" placeholder="Password" onChange={handleChange} required />

        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>New patient? <Link to="/register">Register here</Link></p>
      </form>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f4f8" },
  form: { background: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "350px", display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" },
  button: { padding: "10px", borderRadius: "6px", border: "none", background: "#2e5aac", color: "#fff", fontSize: "15px", cursor: "pointer" },
  error: { color: "red", fontSize: "13px" },
};

export default Login;