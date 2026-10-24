
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  CalendarDays,
  ShieldCheck,
  Pencil,
  X,
  Save,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "./Profile.css";

const API_URL = "http://localhost:5000/api/customer";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch the logged-in customer's profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view your profile.");
          return;
        }

        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        setUser(data.user);
        setFormData({
          fullName: data.user.fullName || "",
          email: data.user.email || "",
        });
      } catch (err) {
        setError(err.message || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setSuccess("");
  };

  // Open edit mode
  const handleEdit = () => {
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
    });

    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  // Discard unsaved changes
  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
    });

    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  // Save profile changes to MongoDB through the backend
  const handleSave = async (e) => {
    e.preventDefault();

    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();

    if (!fullName || !email) {
      setError("Full name and email are required.");
      return;
    }

    if (fullName.length > 100) {
      setError("Full name cannot exceed 100 characters.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again to update your profile.");
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      setUser(data.user);

      setFormData({
        fullName: data.user.fullName || "",
        email: data.user.email || "",
      });

      setIsEditing(false);
      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="customer-profile-loading">
        <LoaderCircle className="profile-spinner" size={28} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  // Initial profile loading error
  if (error && !user) {
    return (
      <div className="customer-profile-message">
        <AlertCircle size={20} />
        <p>{error}</p>
      </div>
    );
  }

  if (!user) return null;

  const initial =
    user.fullName?.trim().charAt(0).toUpperCase() || "C";

  return (
    <div className="customer-profile-page">
      {/* Page heading */}
      <div className="profile-page-heading">
        <div>
          <span className="profile-eyebrow">ACCOUNT SETTINGS</span>
          <h1>My Profile</h1>
          <p>View and manage your personal information.</p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className="profile-edit-button"
            onClick={handleEdit}
          >
            <Pencil size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Success message */}
      {success && (
        <div className="profile-alert profile-alert-success" role="status">
          <CheckCircle2 size={18} />
          <span>{success}</span>

          <button
            type="button"
            aria-label="Dismiss success message"
            onClick={() => setSuccess("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="profile-alert profile-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>

          <button
            type="button"
            aria-label="Dismiss error message"
            onClick={() => setError("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Customer overview */}
      <section className="profile-overview-card">
        <div className="profile-avatar">{initial}</div>

        <div className="profile-overview-info">
          <h2>{user.fullName}</h2>
          <p>{user.email}</p>

          <span className="profile-role-badge">
            <ShieldCheck size={15} />
            Customer Account
          </span>
        </div>
      </section>

      {/* Personal information */}
      <section className="profile-details-card">
        <div className="profile-card-heading">
          <div className="profile-heading-icon">
            <UserRound size={20} />
          </div>

          <div>
            <h2>Personal Information</h2>
            <p>
              {isEditing
                ? "Update your registered account details"
                : "Your registered account details"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="profile-fields-grid">
            {/* Full name */}
            <div className="profile-field">
              <label htmlFor="profile-fullName">Full Name</label>

              {isEditing ? (
                <input
                  id="profile-fullName"
                  className="profile-input"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  maxLength={100}
                  autoComplete="name"
                  required
                  disabled={saving}
                />
              ) : (
                <div className="profile-value">
                  <UserRound size={18} />
                  <span>{user.fullName}</span>
                </div>
              )}
            </div>

            {/* Email address */}
            <div className="profile-field">
              <label htmlFor="profile-email">Email Address</label>

              {isEditing ? (
                <input
                  id="profile-email"
                  className="profile-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  disabled={saving}
                />
              ) : (
                <div className="profile-value">
                  <Mail size={18} />
                  <span>{user.email}</span>
                </div>
              )}
            </div>

            {/* Account type */}
            <div className="profile-field">
              <label>Account Type</label>

              <div className="profile-value">
                <ShieldCheck size={18} />
                <span>Customer</span>
              </div>
            </div>

            {/* Membership date */}
            <div className="profile-field">
              <label>Member Since</label>

              <div className="profile-value">
                <CalendarDays size={18} />
                <span>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Not available"}
                </span>
              </div>
            </div>
          </div>

          {/* Save and cancel controls */}
          {isEditing && (
            <div className="profile-form-actions">
              <button
                type="button"
                className="profile-cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={16} />
                Cancel
              </button>

              <button
                type="submit"
                className="profile-save-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoaderCircle className="profile-spinner" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </section>

      {/* Account security */}
      <section className="profile-details-card">
        <div className="profile-card-heading">
          <div className="profile-heading-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h2>Account Security</h2>
            <p>Keep your account secure</p>
          </div>
        </div>

        <div className="profile-security-row">
          <div>
            <strong>Password</strong>
            <p>Your password is securely hidden.</p>
          </div>

          <span className="profile-security-status">Protected</span>
        </div>

        <p className="profile-security-note">
          Password changes can be added here after connecting a secure
          password-update endpoint.
        </p>
      </section>
    </div>
  );
}
