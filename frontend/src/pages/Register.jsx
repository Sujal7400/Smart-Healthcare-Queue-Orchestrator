import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    age: "",
    gender: "",
  });
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
      await api.post("/auth/register", form);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2>Patient Registration</h2>
        {error && <p style={styles.error}>{error}</p>}

        <input style={styles.input} name="name" placeholder="Full Name" onChange={handleChange} required />
        <input style={styles.input} name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input style={styles.input} name="phone" placeholder="Phone Number" onChange={handleChange} required />
        <input style={styles.input} name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input style={styles.input} name="age" type="number" placeholder="Age (optional)" onChange={handleChange} />
        <select style={styles.input} name="gender" onChange={handleChange}>
          <option value="">Select Gender (optional)</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p>Already have an account? <Link to="/login">Login here</Link></p>
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

export default Register;