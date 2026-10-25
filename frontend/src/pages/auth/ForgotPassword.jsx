
import { useState } from "react";
import { Link } from "react-router-dom";
import "./PasswordReset.css";

const API_URL = "http://localhost:5000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState("customer");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    // Clear previous messages and reset links.
    setMessage("");
    setError("");
    setResetUrl("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/password-reset/forgot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            accountType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to process your request."
        );
      }

      setMessage(data.message || "Request processed successfully.");

      // Show reset link only during local development.
      if (
        import.meta.env.DEV &&
        typeof data.resetUrl === "string" &&
        data.resetUrl.startsWith("http://localhost:")
      ) {
        setResetUrl(data.resetUrl);
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyResetLink() {
    try {
      await navigator.clipboard.writeText(resetUrl);
      setMessage("Reset link copied to clipboard.");
    } catch {
      setError(
        "Unable to copy the link. Please open the reset link directly."
      );
    }
  }

  return (
    <main className="password-page">
      <section className="password-card">
        <h1>Forgot Password?</h1>

        <p>
          Enter your registered email address. If an account
          matches, you can continue to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="accountType">
            Account Type
          </label>

          <select
            id="accountType"
            value={accountType}
            onChange={(event) =>
              setAccountType(event.target.value)
            }
            disabled={loading}
          >
            <option value="customer">Customer</option>
            <option value="provider">Service Provider</option>
          </select>

          <label htmlFor="email">
            Registered Email Address
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            maxLength={254}
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Get Reset Link"}
          </button>
        </form>

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

        {import.meta.env.DEV && resetUrl && (
          <div className="development-reset-link">
            <h3>Development Reset Link</h3>

            <p>
              No email was sent. Open the link below to reset
              your password.
            </p>

            <p>
              <a href={resetUrl}>
                Open Password Reset Page
              </a>
            </p>

            <button
              type="button"
              onClick={copyResetLink}
            >
              Copy Reset Link
            </button>
          </div>
        )}

        <p className="password-back-link">
          Remembered your password?{" "}
          <Link to="/login">Back to Login</Link>
        </p>
      </section>
    </main>
  );
}
