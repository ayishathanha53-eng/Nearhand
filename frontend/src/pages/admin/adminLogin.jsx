
import { useState } from "react";

const API_URL = "http://localhost:5000/api/admin-auth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed");
      }

      if (!data.token || data.user?.role !== "admin") {
        throw new Error("Invalid administrator login response");
      }

      localStorage.setItem("adminToken", data.token);
    window.location.href = "/admin/Dashboard";// Redirect to the admin dashboard
    } catch (err) {
      setError(err.message || "Could not connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1>NearHand Admin</h1>
        <p>Sign in to manage provider applications.</p>

        <label htmlFor="admin-email">Admin email</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {error && <p role="alert" style={{ color: "#b42318" }}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f4f6f9",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    boxSizing: "border-box",
    padding: 32,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: 11,
    marginTop: 6,
    marginBottom: 18,
    border: "1px solid #d0d5dd",
    borderRadius: 6,
  },
  button: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    border: 0,
    borderRadius: 6,
    background: "#172554",
    color: "#fff",
    cursor: "pointer",
  },
};
