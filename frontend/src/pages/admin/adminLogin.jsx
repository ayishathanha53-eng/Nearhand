
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
} from "lucide-react";
import "./AdminLogin.css";

const API_URL = "http://localhost:5000/api/admin-auth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();

const unauthorizedMessage = location.state?.unauthorized
  ? location.state.message
  : "";

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
      window.location.href = "/admin/Dashboard";
    } catch (err) {
      setError(err.message || "Could not connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <div className="admin-decoration admin-decoration-left" />
      <div className="admin-decoration admin-decoration-right" />

      <header className="admin-login-header">
        <a href="/" className="admin-brand" aria-label="NearHand home">
          <span className="admin-brand-mark">N</span>
          <span className="admin-brand-name">NearHand</span>
        </a>

        <div className="admin-portal-label">
          <span />
          Admin Portal
        </div>
      </header>

      <section className="admin-login-card">
        <div className="admin-login-icon">
          <ShieldCheck size={31} strokeWidth={1.8} />
        </div>

        <h1>Welcome back</h1>
        <p className="admin-login-subtitle">
          Sign in to manage provider applications.
        </p>

        {unauthorizedMessage && (
  <div role="alert" className="admin-alert admin-alert-error">
    {unauthorizedMessage}
  </div>
)}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="admin-email">Admin email</label>
            <div className="admin-input-wrap">
              <Mail size={19} aria-hidden="true" />
              <input
                id="admin-email"
                type="email"
                placeholder="Enter your admin email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="admin-input-wrap">
              <LockKeyhole size={19} aria-hidden="true" />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-login-error" role="alert">
              <Shield size={18} />
              <span>{error}</span>
            </div>
          )}

          <button
            className="admin-login-button"
            type="submit"
            disabled={loading}
          >
            <span>{loading ? "Signing in..." : "Sign in"}</span>
            {!loading && <ArrowRight size={19} />}
          </button>
        </form>

        <div className="admin-secure-note">
          <span />
          <ShieldCheck size={17} />
          <span>Secure admin access</span>
          <span />
        </div>
      </section>

      <footer className="admin-login-footer">
        © {new Date().getFullYear()} NearHand. All rights reserved.
      </footer>
    </main>
  );
}

