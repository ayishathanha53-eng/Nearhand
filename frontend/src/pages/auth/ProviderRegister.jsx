import { useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  BriefcaseBusiness,
  GraduationCap,
  Upload,
  FileText,
  CheckCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { apiRequest } from "../../services/api";
export default function ProviderRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",

    gender: "",
    dateOfBirth: "",

    address: "",
    city: "",
    state: "",
    pincode: "",

    serviceCategory: "",
    serviceType: "",
    experience: "",
    startingPrice: "",
    serviceAreas: "",
    description: "",

    qualification: "",
    institution: "",
    specialization: "",
    completionYear: "",
  });

  const [files, setFiles] = useState({
    identityProof: null,
    qualificationCertificate: null,
    professionalCertificate: null,
    experienceCertificate: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] = useState({});

  const [submitted, setSubmitted] = useState(false);

  // -----------------------------
  // Handle text inputs
  // -----------------------------

const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));
};

  
const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate the form first
  if (!validateForm()) {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    return;
  }

  try {
    // Create FormData to send text fields and files
    const data = new FormData();

    // Personal information
    data.append("fullName", formData.fullName.trim());
    data.append("email", formData.email.trim().toLowerCase());
    data.append("phone", formData.phone.trim());
    data.append("password", formData.password);
    data.append("gender", formData.gender);
    data.append("dateOfBirth", formData.dateOfBirth);

    // Address information
    data.append("address", formData.address.trim());
    data.append("city", formData.city.trim());
    data.append("state", formData.state.trim());
    data.append("pincode", formData.pincode.trim());

    // Qualification information
    data.append(
      "highestQualification",
      formData.qualification
    );
    data.append("institution", formData.institution);
    data.append("graduationYear", formData.completionYear);

    // Professional information
    data.append("serviceCategory", formData.serviceCategory);
    data.append("experience", formData.experience);
    data.append("serviceArea", formData.serviceAreas.trim());
    data.append("about", formData.description.trim());

    // Additional form fields, if your model supports them
    data.append("serviceType", formData.serviceType);
    data.append("startingPrice", formData.startingPrice);
    data.append("specialization", formData.specialization);

    // Attach documents using the exact backend field names
    if (files.identityProof) {
      data.append("idProof", files.identityProof);
    }

    if (files.qualificationCertificate) {
      data.append(
        "qualificationCertificate",
        files.qualificationCertificate
      );
    }

    if (files.experienceCertificate) {
      data.append(
        "experienceCertificate",
        files.experienceCertificate
      );
    }

    // Send the data to the provider registration API
    const result = await apiRequest(
      "/api/providers/register",
      {
        method: "POST",
        body: data,
      }
    );

    // Show success only when the server confirms registration
    if (result.success) {
      setSubmitted(true);
    } else {
      alert(result.message || "Provider registration failed");
    }
  } catch (error) {
    console.error("Provider registration error:", error);
    alert(error.message || "Something went wrong during registration");
  }
};


  // -----------------------------
  // Handle file upload
  // -----------------------------

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];

    if (!file) return;

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        [fieldName]: "File size must be less than 5 MB",
      }));

      return;
    }

    setFiles((previous) => ({
      ...previous,
      [fieldName]: file,
    }));

    setErrors((previous) => ({
      ...previous,
      [fieldName]: "",
    }));
  };

  // -----------------------------
  // Validation
  // -----------------------------

  const validateForm = () => {
    const newErrors = {};

    // Personal details
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone =
        "Phone number must contain 10 digits";
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
    } else if (
      !/[!@#$%^&*(),.?":{}|<>_\-\\[\]/;'`~+=]/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Password must contain at least one special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password";
    } else if (
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    // Address
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "PIN code is required";
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode =
        "PIN code must contain 6 digits";
    }

    // Professional
    if (!formData.serviceCategory) {
      newErrors.serviceCategory =
        "Select a service category";
    }

    if (!formData.serviceType) {
      newErrors.serviceType =
        "Select your service";
    }

    if (!formData.experience) {
      newErrors.experience =
        "Select your experience";
    }

    if (!formData.serviceAreas.trim()) {
      newErrors.serviceAreas =
        "Enter the areas you serve";
    }

    if (!formData.description.trim()) {
      newErrors.description =
        "Please describe your services";
    }

    // Qualification
    if (!formData.qualification) {
      newErrors.qualification =
        "Select your qualification";
    }

    // Identity document
    if (!files.identityProof) {
      newErrors.identityProof =
        "Identity proof is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // -----------------------------
  // Submit
  // -----------------------------

  

  // -----------------------------
  // File upload component
  // -----------------------------

  const UploadBox = ({
    label,
    fieldName,
    required = false,
    accept = ".pdf,.jpg,.jpeg,.png",
  }) => {
    const selectedFile = files[fieldName];

    return (
      <div className="provider-upload-group">

        <label>
          {label}

          {required && (
            <span className="required-star"> *</span>
          )}
        </label>

        <label className="provider-upload-box">

          <input
            type="file"
            accept={accept}
            onChange={(e) =>
              handleFileChange(e, fieldName)
            }
          />

          {selectedFile ? (
            <>
              <FileText size={25} />

              <strong>
                {selectedFile.name}
              </strong>

              <span>
                Click to change file
              </span>
            </>
          ) : (
            <>
              <Upload size={27} />

              <strong>
                Upload file
              </strong>

              <span>
                PDF, JPG or PNG (Max. 5MB)
              </span>
            </>
          )}

        </label>

        {errors[fieldName] && (
          <p className="error-message">
            {errors[fieldName]}
          </p>
        )}

      </div>
    );
  };

  return (
    <div className="provider-page">

      <div className="provider-form-container">

        {/* =================================
            HEADER
        ================================= */}

        <div className="provider-header">

          <button
            className="provider-close"
            type="button"
            onClick={() => navigate("/login")}
          >
            <X size={20} />
          </button>

          <div
            className="auth-brand provider-brand"
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

          <div className="provider-title">

            <h2>
              Create your provider account
            </h2>

            <p>
              Join NearHand and connect with
              customers who need your services.
            </p>

          </div>

        </div>

        {/* =================================
            FORM
        ================================= */}

        <form onSubmit={handleSubmit}>

          {/* =================================
              PERSONAL INFORMATION
          ================================= */}

          <section className="provider-section">

            <div className="provider-section-title">

              <div className="section-icon">
                <UserRound size={18} />
              </div>

              <div>
                <h3>Personal Information</h3>
                <p>
                  Tell us a little about yourself
                </p>
              </div>

            </div>

            <div className="provider-grid">

              {/* Full Name */}
              <div className="provider-form-group full-width">

                <label>Full name *</label>

                <div className="provider-input">

                  <UserRound size={17} />

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
              <div className="provider-form-group">

                <label>Email *</label>

                <div className="provider-input">

                  <Mail size={17} />

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

              {/* Phone */}
              <div className="provider-form-group">

                <label>Phone number *</label>

                <div className="provider-input">

                  <Phone size={17} />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="10 digit phone number"
                    maxLength="10"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                </div>

                {errors.phone && (
                  <p className="error-message">
                    {errors.phone}
                  </p>
                )}

              </div>

              {/* Password */}
              <div className="provider-form-group">

                <label>Password *</label>

                <div className="provider-input">

                  <Lock size={17} />

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
                    className="provider-eye"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

                <div className="provider-password-info">

                  <span
                    className={
                      formData.password.length >= 8
                        ? "valid"
                        : ""
                    }
                  >
                    ✓ 8+ characters
                  </span>

                  <span
                    className={
                      /[0-9]/.test(
                        formData.password
                      )
                        ? "valid"
                        : ""
                    }
                  >
                    ✓ One digit
                  </span>

                  <span
                    className={
                      /[!@#$%^&*(),.?":{}|<>_\-\\[\]/;'`~+=]/.test(
                        formData.password
                      )
                        ? "valid"
                        : ""
                    }
                  >
                    ✓ One special character
                  </span>

                </div>

                {errors.password && (
                  <p className="error-message">
                    {errors.password}
                  </p>
                )}

              </div>

              {/* Confirm Password */}
              <div className="provider-form-group">

                <label>
                  Confirm password *
                </label>

                <div className="provider-input">

                  <Lock size={17} />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="provider-eye"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

                {errors.confirmPassword && (
                  <p className="error-message">
                    {errors.confirmPassword}
                  </p>
                )}

              </div>

              {/* Gender */}
              <div className="provider-form-group">

                <label>Gender</label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* Date of Birth */}
              <div className="provider-form-group">

                <label>Date of birth</label>

                <input
                  className="provider-normal-input"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />

              </div>

            </div>

          </section>

          {/* =================================
              ADDRESS
          ================================= */}

          <section className="provider-section">

            <div className="provider-section-title">

              <div className="section-icon">
                <MapPin size={18} />
              </div>

              <div>
                <h3>Address Details</h3>
                <p>
                  Where can customers find you?
                </p>
              </div>

            </div>

            <div className="provider-grid">

              {/* Address */}
              <div className="provider-form-group full-width">

                <label>Address *</label>

                <textarea
                  name="address"
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                />

                {errors.address && (
                  <p className="error-message">
                    {errors.address}
                  </p>
                )}

              </div>

              {/* City */}
              <div className="provider-form-group">

                <label>City *</label>

                <input
                  className="provider-normal-input"
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                />

                {errors.city && (
                  <p className="error-message">
                    {errors.city}
                  </p>
                )}

              </div>

              {/* State */}
              <div className="provider-form-group">

                <label>State *</label>

                <input
                  className="provider-normal-input"
                  type="text"
                  name="state"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleChange}
                />

                {errors.state && (
                  <p className="error-message">
                    {errors.state}
                  </p>
                )}

              </div>

              {/* PIN */}
              <div className="provider-form-group">

                <label>PIN code *</label>

                <input
                  className="provider-normal-input"
                  type="text"
                  name="pincode"
                  placeholder="6 digit PIN"
                  maxLength="6"
                  value={formData.pincode}
                  onChange={handleChange}
                />

                {errors.pincode && (
                  <p className="error-message">
                    {errors.pincode}
                  </p>
                )}

              </div>

            </div>

          </section>

          {/* =================================
              PROFESSIONAL DETAILS
          ================================= */}

          <section className="provider-section">

            <div className="provider-section-title">

              <div className="section-icon">
                <BriefcaseBusiness size={18} />
              </div>

              <div>
                <h3>Professional Details</h3>
                <p>
                  Tell customers about your services
                </p>
              </div>

            </div>

            <div className="provider-grid">

              {/* Category */}
              <div className="provider-form-group">

                <label>
                  Service category *
                </label>

                <select
                  name="serviceCategory"
                  value={
                    formData.serviceCategory
                  }
                  onChange={handleChange}
                >

                  <option value="">
                    Select category
                  </option>

                  <option value="electrician">
                    Electrician
                  </option>

                  <option value="plumber">
                    Plumber
                  </option>

                  <option value="carpenter">
                    Carpenter
                  </option>

                  <option value="tutor">
                    Tutor
                  </option>

                  <option value="cleaner">
                    Cleaner
                  </option>

                  <option value="ac-repair">
                    AC Repair
                  </option>

                  <option value="mechanic">
                    Mechanic
                  </option>

                  <option value="painter">
                    Painter
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

                {errors.serviceCategory && (
                  <p className="error-message">
                    {errors.serviceCategory}
                  </p>
                )}

              </div>

              {/* Service Type */}
              <div className="provider-form-group">

                <label>
                  Service type *
                </label>

                <input
                  className="provider-normal-input"
                  type="text"
                  name="serviceType"
                  placeholder="e.g. Home electrical repair"
                  value={formData.serviceType}
                  onChange={handleChange}
                />

                {errors.serviceType && (
                  <p className="error-message">
                    {errors.serviceType}
                  </p>
                )}

              </div>

              {/* Experience */}
              <div className="provider-form-group">

                <label>
                  Experience *
                </label>

                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                >

                  <option value="">
                    Select experience
                  </option>

                  <option value="less-than-1">
                    Less than 1 year
                  </option>

                  <option value="1-3">
                    1 - 3 years
                  </option>

                  <option value="3-5">
                    3 - 5 years
                  </option>

                  <option value="5-10">
                    5 - 10 years
                  </option>

                  <option value="10-plus">
                    10+ years
                  </option>

                </select>

                {errors.experience && (
                  <p className="error-message">
                    {errors.experience}
                  </p>
                )}

              </div>

              {/* Starting Price */}
              <div className="provider-form-group">

                <label>
                  Starting price
                </label>

                <input
                  className="provider-normal-input"
                  type="number"
                  name="startingPrice"
                  placeholder="₹ Enter amount"
                  min="0"
                  value={
                    formData.startingPrice
                  }
                  onChange={handleChange}
                />

              </div>

              {/* Service Areas */}
              <div className="provider-form-group full-width">

                <label>
                  Service areas *
                </label>

                <div className="provider-input">

                  <MapPin size={17} />

                  <input
                    type="text"
                    name="serviceAreas"
                    placeholder="e.g. Kollam, Kottarakkara, Karunagappally"
                    value={
                      formData.serviceAreas
                    }
                    onChange={handleChange}
                  />

                </div>

                {errors.serviceAreas && (
                  <p className="error-message">
                    {errors.serviceAreas}
                  </p>
                )}

              </div>

              {/* Description */}
              <div className="provider-form-group full-width">

                <label>
                  About you / Description *
                </label>

                <textarea
                  name="description"
                  placeholder="Tell customers about your experience and services..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                />

                {errors.description && (
                  <p className="error-message">
                    {errors.description}
                  </p>
                )}

              </div>

            </div>

          </section>

          {/* =================================
              QUALIFICATION
          ================================= */}

          <section className="provider-section">

            <div className="provider-section-title">

              <div className="section-icon">
                <GraduationCap size={18} />
              </div>

              <div>
                <h3>Qualification Details</h3>
                <p>
                  Add your education and professional qualifications
                </p>
              </div>

            </div>

            <div className="provider-grid">

              {/* Qualification */}
              <div className="provider-form-group">

                <label>
                  Highest qualification *
                </label>

                <select
                  name="qualification"
                  value={
                    formData.qualification
                  }
                  onChange={handleChange}
                >

                  <option value="">
                    Select qualification
                  </option>

                  <option value="10th">
                    10th
                  </option>

                  <option value="12th">
                    12th
                  </option>

                  <option value="diploma">
                    Diploma
                  </option>

                  <option value="degree">
                    Degree
                  </option>

                  <option value="masters">
                    Master's Degree
                  </option>

                  <option value="certificate">
                    Professional Certificate
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>

                {errors.qualification && (
                  <p className="error-message">
                    {errors.qualification}
                  </p>
                )}

              </div>

              {/* Institution */}
              <div className="provider-form-group">

                <label>
                  Institution
                </label>

                <input
                  className="provider-normal-input"
                  type="text"
                  name="institution"
                  placeholder="College / institution"
                  value={formData.institution}
                  onChange={handleChange}
                />

              </div>

              {/* Specialization */}
              <div className="provider-form-group">

                <label>
                  Course / Specialization
                </label>

                <input
                  className="provider-normal-input"
                  type="text"
                  name="specialization"
                  placeholder="e.g. Electrical Engineering"
                  value={
                    formData.specialization
                  }
                  onChange={handleChange}
                />

              </div>

              {/* Completion Year */}
              <div className="provider-form-group">

                <label>
                  Year of completion
                </label>

                <input
                  className="provider-normal-input"
                  type="number"
                  name="completionYear"
                  placeholder="e.g. 2023"
                  min="1950"
                  max="2100"
                  value={
                    formData.completionYear
                  }
                  onChange={handleChange}
                />

              </div>

            </div>

          </section>

          {/* =================================
              DOCUMENT VERIFICATION
          ================================= */}

          <section className="provider-section">

            <div className="provider-section-title">

              <div className="section-icon">
                <FileText size={18} />
              </div>

              <div>
                <h3>
                  Verification Documents
                </h3>

                <p>
                  Documents will be reviewed by NearHand admin
                </p>
              </div>

            </div>

            <div className="verification-notice">

              <CheckCircle size={18} />

              <p>
                Upload clear and valid documents.
                Your identity proof is required
                for verification.
              </p>

            </div>

            <div className="upload-grid">

              <UploadBox
                label="Identity Proof"
                fieldName="identityProof"
                required={true}
              />

              <UploadBox
                label="Qualification Certificate"
                fieldName="qualificationCertificate"
              />

              <UploadBox
                label="Professional Certificate"
                fieldName="professionalCertificate"
              />

              <UploadBox
                label="Experience Certificate"
                fieldName="experienceCertificate"
              />

            </div>

          </section>

          {/* =================================
              SUBMIT
          ================================= */}

          <div className="provider-submit-section">

            <p>
              By submitting this application,
              you agree to provide accurate
              information for verification.
            </p>

            <button
              type="submit"
              className="provider-submit-btn"
            >
              Submit for verification
            </button>

            <p className="provider-login-link">
              Already have an account?{" "}

              <button
                type="button"
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
            </p>

          </div>

        </form>

      </div>

      {/* =====================================
          SUCCESS POPUP
      ====================================== */}

      {submitted && (
        <div className="provider-success-overlay">

          <div className="provider-success-modal">

            <button
              className="provider-success-close"
              type="button"
              onClick={() =>
                setSubmitted(false)
              }
            >
              <X size={19} />
            </button>

            <div className="provider-success-icon">
              <CheckCircle size={55} />
            </div>

            <h2>
              Application submitted
              successfully!
            </h2>

            <p>
              Thank you for joining NearHand.
              Your provider application has been
              submitted for verification.
            </p>

            <p className="provider-pending-text">
              Our admin team will review your
              details and documents. You will be
              able to offer services after approval.
            </p>

            <button
              className="provider-login-btn"
              type="button"
              onClick={() => navigate("/login")}
            >
              Go to login
            </button>

            <p className="provider-success-login">
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