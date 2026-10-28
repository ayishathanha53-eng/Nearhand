
import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "./PasswordReset.css";

const API_URL = "http://localhost:5000";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const accountType = searchParams.get("accountType") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token || !["customer", "provider"].includes(accountType)) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError("Password must be between 8 and 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/password-reset/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            accountType,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to reset password."
        );
      }

      setMessage(
        data.message || "Password reset successfully."
      );
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="password-page">
      <section className="password-card">
        <h1>Reset Password</h1>
        <p>Enter and confirm your new password below.</p>

        {!token || !["customer", "provider"].includes(accountType) ? (
          <p role="alert">
            This reset link is invalid. Please request a new one.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              maxLength={128}
              required
              disabled={loading}
            />

            <label htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              minLength={8}
              maxLength={128}
              required
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && (
          <p className="password-success" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="password-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        )}

        <p>
          <Link to="/forgot-password">
            Request another reset link
          </Link>
        </p>
      </section>
    </main>
  );
}
