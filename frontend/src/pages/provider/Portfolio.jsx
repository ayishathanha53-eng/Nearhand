
import { useEffect, useState } from "react";
import "./Profile.css";

const API_URL = "http://localhost:5000/api/providers/profile";
const SERVER_URL = "http://localhost:5000";

function Profile() {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view your profile.");
          return;
        }

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        setProvider(data.provider);
      } catch (err) {
        setError(err.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="provider-profile">Loading profile...</div>;
  }

  if (error) {
    return <div className="provider-profile profile-error">{error}</div>;
  }

  if (!provider) {
    return <div className="provider-profile">Profile not found.</div>;
  }

  const status = provider.verificationStatus || "Pending";

  const photoUrl = provider.profilePhoto
    ? `${SERVER_URL}/${provider.profilePhoto.replace(/\\/g, "/")}`
    : "";

  const formatValue = (value) => {
    if (value === undefined || value === null || value === "") {
      return "Not provided";
    }

    if (Array.isArray(value)) {
      return value.length ? value.join(", ") : "Not provided";
    }

    return String(value);
  };

  const fields = [
    ["Full Name", provider.fullName],
    ["Email", provider.email],
    ["Phone", provider.phone],
    ["Date of Birth", provider.dateOfBirth
      ? String(provider.dateOfBirth).slice(0, 10)
      : ""],
    ["Gender", provider.gender],
    ["Address", provider.address],
    ["City", provider.city],
    ["District", provider.district],
    ["State", provider.state],
    ["PIN Code", provider.pincode],
    ["Service Category", provider.serviceCategory],
    ["Experience", provider.experience],
    ["Service Area", provider.serviceArea],
    ["Highest Qualification", provider.highestQualification],
    ["Institution", provider.institution],
    ["Graduation Year", provider.graduationYear],
    ["About", provider.about],
    ["Service Description", provider.serviceDescription],
    ["Skills", provider.skills],
    ["Languages", provider.languages],
    ["Service PIN Codes", provider.servicePincodes],
    ["Starting Price", provider.startingPrice != null
      ? `₹${provider.startingPrice}`
      : ""],
  ];

  return (
    <div className="provider-profile">
      <div className="profile-header">
        <div className="profile-photo">
          {photoUrl ? (
            <img src={photoUrl} alt="Provider profile" />
          ) : (
            <span>
              {provider.fullName?.charAt(0)?.toUpperCase() || "P"}
            </span>
          )}
        </div>

        <div>
          <h1>{provider.fullName || "Provider Profile"}</h1>
          <p>{provider.serviceCategory || "Service Provider"}</p>
          <span
            className={`profile-status ${status.toLowerCase()}`}
          >
            {status}
          </span>
        </div>
      </div>

      {status === "Pending" && (
        <div className="profile-notice pending-notice">
          Your profile is awaiting admin approval.
        </div>
      )}

      {status === "Approved" && (
        <div className="profile-notice approved-notice">
          Your profile has been approved by the admin.
        </div>
      )}

      {status === "Rejected" && (
        <div className="profile-notice rejected-notice">
          Your profile was rejected.
          {provider.rejectionReason && (
            <p>Reason: {provider.rejectionReason}</p>
          )}
        </div>
      )}

      <section className="profile-section">
        <h2>Provider Details</h2>

        <div className="profile-grid">
          {fields.map(([label, value]) => (
            <div className="profile-field" key={label}>
              <span>{label}</span>
              <p>{formatValue(value)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="profile-section">
        <h2>Working Hours</h2>

        {provider.workingHours?.length ? (
          <div className="working-hours-list">
            {provider.workingHours.map((day) => (
              <div className="working-hour" key={day.day}>
                <strong>{day.day}</strong>
                <span>
                  {day.isWorking
                    ? `${day.startTime} – ${day.endTime}`
                    : "Closed"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p>Working hours have not been configured.</p>
        )}
      </section>
    </div>
  );
}

export default Profile;
