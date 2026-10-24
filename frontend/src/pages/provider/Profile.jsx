
import { useEffect, useState } from "react";
import {
  UserRound,
  BriefcaseBusiness,
  Clock3,
  MapPin,
  Languages,
  IndianRupee,
  CalendarClock,
  ShieldCheck,
  LoaderCircle,
  Camera,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import "./Profile.css";

const API_URL = "http://localhost:5000/api/providers/profile";
const PHOTO_API_URL = "http://localhost:5000/api/providers/profile/photo";
const SERVER_URL = "http://localhost:5000";

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "Not provided";
  }

  return String(value);
}

function formatDate(value) {
  if (!value) return "Not provided";
  return String(value).slice(0, 10);
}

function ProfileField({ label, value }) {
  return (
    <div className="profile-field">
      <span className="profile-field-label">{label}</span>
      <p>{formatValue(value)}</p>
    </div>
  );
}

function Profile() {
  const token = localStorage.getItem("token");

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        if (!token) {
          throw new Error("Please log in to view your profile.");
        }

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your profile.");
        }

        const profile = data.provider || data.result?.provider || data;
        setProvider(profile);
      } catch (err) {
        setError(err.message || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token]);

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError("");
    setPhotoMessage("");

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Please select a JPG or PNG image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The profile photo must be smaller than 5 MB.");
      return;
    }

    if (!token) {
      setError("Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("profilePhoto", file);

    setUploadingPhoto(true);

    try {
      const response = await fetch(PHOTO_API_URL, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to upload profile photo.");
      }

      setProvider((previous) => ({
        ...previous,
        ...(data.provider || {}),
        profilePhoto: data.profilePhoto || data.provider?.profilePhoto,
      }));

      setPhotoMessage("Profile photo updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to upload profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  if (loading) {
    return (
      <main className="profile-page profile-loading">
        <LoaderCircle className="profile-spinner" size={30} />
        <p>Loading your profile...</p>
      </main>
    );
  }

  if (!provider) {
    return (
      <main className="profile-page">
        <div className="profile-alert error">
          {error || "Unable to load your profile."}
        </div>
      </main>
    );
  }

  const photoUrl = provider.profilePhoto
    ? `${SERVER_URL}/${String(provider.profilePhoto).replace(/\\/g, "/").replace(/^\/+/, "")}`
    : "";

  const verificationStatus = provider.verificationStatus || "Pending";
  const statusClass = verificationStatus.toLowerCase();

  const servicePincodes = Array.isArray(provider.servicePincodes)
    ? provider.servicePincodes
    : [];

  const workingHours = Array.isArray(provider.workingHours)
    ? provider.workingHours
    : [];

  const bookingNotice =
    provider.minimumBookingNoticeHours ??
    provider.bookingNoticeHours;

    console.log("Minimum booking notice:", provider.minimumBookingNoticeHours);
console.log("Booking notice:", provider.bookingNoticeHours);
console.log("Full provider data:", provider);

  const skills = Array.isArray(provider.skills)
    ? provider.skills
    : provider.skills
      ? String(provider.skills).split(",").map((item) => item.trim()).filter(Boolean)
      : [];

  const languages = Array.isArray(provider.languages)
    ? provider.languages
    : provider.languages
      ? String(provider.languages).split(",").map((item) => item.trim()).filter(Boolean)
      : [];

  return (
    <main className="profile-page">
      <header className="profile-page-heading">
        <div>
          <p className="profile-eyebrow">PROVIDER WORKSPACE</p>
          <h1>My Profile</h1>
          <p>View your personal information, services, and availability.</p>
        </div>
        <div className="profile-heading-icon">
          <UserRound size={27} />
        </div>
      </header>

      {error && (
        <div className="profile-alert error" role="alert">
          {error}
        </div>
      )}

      {photoMessage && (
        <div className="profile-alert success" role="status">
          {photoMessage}
        </div>
      )}

      {/* Profile header */}
      <section className="profile-header-card">
        <div className="profile-avatar-column">
          <div className="profile-avatar">
            {photoUrl ? (
              <img src={photoUrl} alt="Provider profile" />
            ) : (
              <UserRound size={48} />
            )}

            {uploadingPhoto && (
              <div className="profile-photo-loading">
                <LoaderCircle className="profile-spinner" size={24} />
              </div>
            )}
          </div>

          <label
            className={`upload-photo-button ${uploadingPhoto ? "disabled" : ""}`}
          >
            <Camera size={15} />
            {uploadingPhoto ? "Uploading..." : "Change photo"}
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handlePhotoChange}
              disabled={uploadingPhoto}
              hidden
            />
          </label>
          <small className="profile-photo-help">JPG or PNG, max 5 MB</small>
        </div>

        <div className="profile-header-info">
          <p className="profile-eyebrow">YOUR PROVIDER ACCOUNT</p>
          <h2>{formatValue(provider.fullName)}</h2>
          <p className="profile-header-contact">
            {formatValue(provider.email)}
          </p>
          <p className="profile-header-contact">
            {formatValue(provider.phone)}
          </p>

          <span className={`profile-status ${statusClass}`}>
            <span className="profile-status-dot" />
            {verificationStatus}
          </span>
        </div>
      </section>

      {/* Verification notice */}
      <section className={`profile-notice ${statusClass}`}>
        <div className="profile-notice-icon">
          <ShieldCheck size={23} />
        </div>

        <div>
          <h3>
            {verificationStatus === "Approved"
              ? "Your account is approved"
              : verificationStatus === "Rejected"
                ? "Your application was rejected"
                : "Your application is awaiting approval"}
          </h3>

          <p>
            {verificationStatus === "Approved"
              ? "Your provider account has been approved by the admin."
              : verificationStatus === "Rejected"
                ? provider.rejectionReason ||
                  "Please contact the admin for more information about your application."
                : "Your submitted details are awaiting admin review. Some provider features may remain unavailable until approval."}
          </p>
        </div>
      </section>

      {/* SECTION 1: PERSONAL DETAILS */}
      <section className="profile-section">
        <div className="profile-section-heading">
          <div className="section-icon">
            <UserRound size={21} />
          </div>
          <div>
            <h2>Personal Details</h2>
            <p>Your personal, contact, address, and educational information.</p>
          </div>
        </div>

        <div className="profile-grid">
          <ProfileField label="Full Name" value={provider.fullName} />
          <ProfileField label="Email Address" value={provider.email} />
          <ProfileField label="Phone Number" value={provider.phone} />
          <ProfileField
            label="Date of Birth"
            value={formatDate(provider.dateOfBirth)}
          />
          <ProfileField label="Gender" value={provider.gender} />
          <ProfileField label="Address" value={provider.address} />
          <ProfileField label="City" value={provider.city} />
          <ProfileField label="District" value={provider.district} />
          <ProfileField label="State" value={provider.state} />
          <ProfileField label="PIN Code" value={provider.pincode} />
          <ProfileField
            label="Highest Qualification"
            value={provider.highestQualification ?? provider.qualification}
          />
          <ProfileField
            label="Institution"
            value={provider.institution}
          />
          <ProfileField
            label="Graduation Year"
            value={provider.graduationYear}
          />
        </div>
      </section>

      {/* SECTION 2: SERVICE DETAILS */}
      <section className="profile-section">
        <div className="profile-section-heading">
          <div className="section-icon">
            <BriefcaseBusiness size={21} />
          </div>
          <div>
            <h2>Service Details</h2>
            <p>Your professional information and booking preferences.</p>
          </div>
        </div>

        <div className="profile-grid">
          <ProfileField
            label="Service Category"
            value={provider.serviceCategory}
          />
          <ProfileField
            label="Experience"
            value={
              provider.experience !== undefined && provider.experience !== ""
                ? `${provider.experience} years`
                : ""
            }
          />
          <ProfileField
            label="Starting Price"
            value={
              provider.startingPrice !== undefined &&
              provider.startingPrice !== null &&
              provider.startingPrice !== ""
                ? `₹${provider.startingPrice}`
                : ""
            }
          />

          <div className="profile-field">
            <span className="profile-field-label">
              <CalendarClock size={15} />
              Minimum Booking Notice
            </span>
            <p>
              {bookingNotice !== undefined && bookingNotice !== null
                ? `${bookingNotice} hour${Number(bookingNotice) === 1 ? "" : "s"} before booking`
                : "Not provided"}
            </p>
          </div>

          <div className="profile-field full-width">
            <span className="profile-field-label">Service Description</span>
            <p className="profile-long-value">
              {formatValue(provider.serviceDescription ?? provider.about)}
            </p>
          </div>

          <div className="profile-field full-width">
            <span className="profile-field-label">
              <CheckCircle2 size={15} />
              Skills
            </span>
            {skills.length ? (
              <div className="profile-chip-list">
                {skills.map((skill, index) => (
                  <span className="profile-chip" key={`${skill}-${index}`}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p>Not provided</p>
            )}
          </div>

          <div className="profile-field full-width">
            <span className="profile-field-label">
              <Languages size={15} />
              Languages
            </span>
            {languages.length ? (
              <div className="profile-chip-list">
                {languages.map((language, index) => (
                  <span
                    className="profile-chip"
                    key={`${language}-${index}`}
                  >
                    {language}
                  </span>
                ))}
              </div>
            ) : (
              <p>Not provided</p>
            )}
          </div>
        </div>

        {/* All service PIN codes */}
        <div className="profile-subsection">
          <div className="profile-subsection-heading">
            <MapPin size={19} />
            <div>
              <h3>Service Locations</h3>
              <p>All PIN codes where you accept service bookings.</p>
            </div>
            <span className="profile-count">
              {servicePincodes.length} location
              {servicePincodes.length === 1 ? "" : "s"}
            </span>
          </div>

          {servicePincodes.length > 0 ? (
            <div className="profile-pincode-list">
              {servicePincodes.map((pincode, index) => (
                <span
                  className="profile-pincode"
                  key={`${pincode}-${index}`}
                >
                  <MapPin size={15} />
                  {pincode}
                </span>
              ))}
            </div>
          ) : (
            <p className="profile-empty-message">
              No service PIN codes have been added yet.
            </p>
          )}
        </div>
      </section>

      {/* SECTION 3: WORKING HOURS */}
      <section className="profile-section">
        <div className="profile-section-heading">
          <div className="section-icon">
            <Clock3 size={21} />
          </div>
          <div>
            <h2>Working Hours</h2>
            <p>Your weekly service schedule.</p>
          </div>
        </div>

        {workingHours.length > 0 ? (
          <div className="profile-working-hours">
            {workingHours.map((day) => (
              <div
                className={`profile-working-hour ${
                  day.isWorking ? "working" : "not-working"
                }`}
                key={day.day}
              >
                <div className="profile-working-day">
                  <span
                    className={`profile-day-indicator ${
                      day.isWorking ? "active" : ""
                    }`}
                  />
                  <strong>{day.day}</strong>
                </div>

                {day.isWorking ? (
                  <div className="profile-working-time">
                    <Clock3 size={15} />
                    <span>
                      {day.startTime || "09:00"} – {day.endTime || "17:00"}
                    </span>
                    {day.breakStart && day.breakEnd && (
                      <small>
                        Break: {day.breakStart} – {day.breakEnd}
                      </small>
                    )}
                  </div>
                ) : (
                  <span className="profile-day-off">Day off</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-empty-message">
            Working hours have not been configured yet.
          </p>
        )}
      </section>
    </main>
  );
}

export default Profile;
