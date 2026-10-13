import { useState } from "react";
import {
  UserRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  X,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { apiRequest } from "../../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});

  const [accountCreated, setAccountCreated] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Remove error when user starts correcting the field
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one digit";
    } else if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/;'`~+=]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one special character";
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  
const handleCreateAccount = async (e) => {
  e.preventDefault();

  // Check the existing form validation
  if (!validateForm()) {
    return;
  }

  try {
    // Send customer details to the backend
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      }),
    });

    // Show success popup only after the backend succeeds
    if (data.success) {
      setAccountCreated(true);
    }
  } catch (error) {
    // Display backend errors, such as an email already registered
    alert(error.message);
  }
};


  const closePopup = () => {
    setAccountCreated(false);
  };

  const goToDashboard = () => {
    setAccountCreated(false);

    navigate("/customer/dashboard");
  };

  return (
    <div className="auth-page">

      <div className="auth-container register-container">

        {/* Close button */}
        <button
          className="auth-close-btn"
          onClick={() => navigate("/login")}
          type="button"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div
          className="auth-brand"
          onClick={() => navigate("/")}
        >
          <div className="auth-brand-icon">
            N
          </div>

          <div>
            <h1>NearHand</h1>
            <p>Your Service, Near You</p>
          </div>
        </div>

        {/* Heading */}
        <div className="register-heading">
          <h2>Create your account</h2>

          <p>
            Create your customer account and start
            finding trusted professionals near you.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateAccount}>

          {/* Full Name */}
          <div className="form-group">

            <label>Full name</label>

            <div
              className={`input-wrapper ${
                errors.fullName ? "input-error" : ""
              }`}
            >
              <UserRound size={18} />

              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            {errors.fullName && (
              <p className="error-message">
                {errors.fullName}
              </p>
            )}

          </div>

          {/* Email */}
          <div className="form-group">

            <label>Email</label>

            <div
              className={`input-wrapper ${
                errors.email ? "input-error" : ""
              }`}
            >
              <Mail size={18} />

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {errors.email && (
              <p className="error-message">
                {errors.email}
              </p>
            )}

          </div>

          {/* Password */}
          <div className="form-group">

            <label>Password</label>

            <div
              className={`input-wrapper ${
                errors.password ? "input-error" : ""
              }`}
            >
              <Lock size={18} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            {/* Password requirements */}
            <div className="password-requirements">

              <p
                className={
                  formData.password.length >= 8
                    ? "valid"
                    : ""
                }
              >
                ✓ At least 8 characters
              </p>

              <p
                className={
                  /[0-9]/.test(formData.password)
                    ? "valid"
                    : ""
                }
              >
                ✓ At least one digit
              </p>

              <p
                className={
                  /[!@#$%^&*(),.?":{}|<>_\-\\[\]/;'`~+=]/.test(
                    formData.password
                  )
                    ? "valid"
                    : ""
                }
              >
                ✓ At least one special character
              </p>

            </div>

            {errors.password && (
              <p className="error-message">
                {errors.password}
              </p>
            )}

          </div>

          {/* Confirm Password */}
          <div className="form-group">

            <label>Confirm password</label>

            <div
              className={`input-wrapper ${
                errors.confirmPassword
                  ? "input-error"
                  : ""
              }`}
            >
              <Lock size={18} />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

            {errors.confirmPassword && (
              <p className="error-message">
                {errors.confirmPassword}
              </p>
            )}

          </div>

          {/* Create Account */}
          <button
            type="submit"
            className="sign-in-btn"
          >
            Create account
          </button>

        </form>

        {/* Already have account */}
        <p className="already-account">
          Already have an account?{" "}

          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </p>

      </div>

      {/* =====================================
          SUCCESS POPUP
      ====================================== */}

      {accountCreated && (
        <div className="success-overlay">

          <div className="success-modal">

            <button
              className="success-close"
              onClick={closePopup}
            >
              <X size={19} />
            </button>

            <div className="success-icon">
              <CheckCircle size={55} />
            </div>

            <h2>
              Account created
              successfully!
            </h2>

            <p>
              Welcome to NearHand. You can
              now explore and book services.
            </p>

            <button
              className="success-dashboard-btn"
              onClick={goToDashboard}
            >
              Go to dashboard
            </button>

            <p className="success-login-text">
              Already have an account?{" "}

              <button
                type="button"
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
            </p>

          </div>

        </div>
      )}

    </div>
  );
}