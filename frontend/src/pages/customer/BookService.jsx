
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Search,
  LoaderCircle,
  CheckCircle,
  AlertCircle,
  BriefcaseBusiness,
} from "lucide-react";

const API_URL = "http://localhost:5000";

function getLocalDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export default function BookService() {
  const navigate = useNavigate();
const [searchParams] = useSearchParams();
const requestedProviderId = searchParams.get("providerId") || "";

  const [providers, setProviders] = useState([]);
  const [providerId, setProviderId] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [loadingProviders, setLoadingProviders] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
const [bookingId, setBookingId] = useState("");

  const selectedProvider = providers.find(
    (provider) => provider._id === providerId
  );

  async function loadProviders() {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in as a customer to book a service.");
      setLoadingProviders(false);
      return;
    }

    setLoadingProviders(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/customer/providers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load providers.");
      }

      const availableProviders = Array.isArray(data.providers)
        ? data.providers
        : [];

      setProviders(availableProviders);

      // Select the provider requested by the profile page,
// provided that they are still available for booking.
setProviderId((currentId) => {
  if (
    requestedProviderId &&
    availableProviders.some(
      (provider) => provider._id === requestedProviderId
    )
  ) {
    return requestedProviderId;
  }

  if (availableProviders.some((provider) => provider._id === currentId)) {
    return currentId;
  }

  return "";
});

if (
  requestedProviderId &&
  !availableProviders.some(
    (provider) => provider._id === requestedProviderId
  )
) {
  setError(
    "The selected provider is no longer available. Please choose another provider."
  );
}

      if (availableProviders.length === 0) {
        setError("No providers are currently accepting bookings.");
      }
    } catch (err) {
      setProviders([]);
      setError(err.message || "Unable to load providers.");
    } finally {
      setLoadingProviders(false);
    }
  }

  useEffect(() => {
    loadProviders();
  }, []);

  function handleProviderChange(event) {
    const id = event.target.value;
    const provider = providers.find((item) => item._id === id);

    setProviderId(id);
    setServiceName(provider?.serviceCategory || "");
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    if (!providerId || !selectedProvider) {
      setError("Please select an available service provider.");
      return;
    }

    if (!bookingDate || new Date(bookingDate) <= new Date()) {
      setError("Please select a future date and time.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/customer/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          providerId,
          serviceName,
          // Send an explicit timestamp with timezone information.
          bookingDate: new Date(bookingDate).toISOString(),
          address,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to submit booking.");
      }

      setBookingId(data.booking?._id || "Unavailable");
setShowBookingDialog(true);
      setBookingDate("");
      setAddress("");
      setDescription("");

    } catch (err) {
      setError(err.message || "Something went wrong.");

      // Refresh the live provider list in case the provider went offline.
      if (err.message?.toLowerCase().includes("provider")) {
        await loadProviders();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={styles.page}>
      <button
        type="button"
        onClick={() => navigate("/customer/dashboard")}
        style={styles.backButton}
      >
        <ArrowLeft size={17} />
        Back to Dashboard
      </button>

      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>NEARHAND SERVICES</p>
          <h1 style={styles.heading}>Book a Service</h1>
          <p style={styles.subtitle}>
            Choose a live professional and schedule your service.
          </p>
        </div>

        <div style={styles.headerIcon}>
          <BriefcaseBusiness size={27} />
        </div>
      </header>

      <form onSubmit={handleSubmit} style={styles.form}>
        {error && (
          <div role="alert" style={styles.error}>
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div role="status" style={styles.success}>
            <CheckCircle size={19} />
            <span>{success}</span>
          </div>
        )}

        <h2 style={styles.sectionHeading}>Service details</h2>

        <label style={styles.label} htmlFor="provider">
          Available service provider *
        </label>

        {loadingProviders ? (
          <p style={styles.info}>
            <LoaderCircle size={18} />
            Loading available providers...
          </p>
        ) : (
          <select
            id="provider"
            value={providerId}
            onChange={handleProviderChange}
            required
            style={styles.input}
          >
            <option value="">Select a provider</option>
            {providers.map((provider) => (
              <option key={provider._id} value={provider._id}>
                {provider.fullName} — {provider.serviceCategory}
                {provider.city ? ` (${provider.city})` : ""}
              </option>
            ))}
          </select>
        )}

        {selectedProvider && (
          <div style={styles.providerCard}>
            <div style={styles.providerAvatar}>
              {selectedProvider.profilePhoto ? (
                <img
                  src={
                    selectedProvider.profilePhoto.startsWith("http")
                      ? selectedProvider.profilePhoto
                      : `${API_URL}/${selectedProvider.profilePhoto.replace(/^\/+/, "")}`
                  }
                  alt={selectedProvider.fullName}
                  style={styles.photo}
                />
              ) : (
                <BriefcaseBusiness size={25} />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <strong>{selectedProvider.fullName}</strong>
              <p style={styles.providerMeta}>
                {selectedProvider.serviceCategory}
              </p>
              <p style={styles.providerMeta}>
                <MapPin size={14} />
                {selectedProvider.city || selectedProvider.serviceArea}
              </p>
            </div>

            <div style={styles.price}>
              ₹{Number(selectedProvider.startingPrice || 0).toLocaleString("en-IN")}
              <small> starting price</small>
            </div>
          </div>
        )}

        <label style={styles.label} htmlFor="serviceName">
          Service required *
        </label>
        <input
          id="serviceName"
          value={serviceName}
          onChange={(e) => setServiceName(e.target.value)}
          placeholder="e.g. Plumbing repair"
          maxLength={120}
          required
          style={styles.input}
        />

        <label style={styles.label} htmlFor="bookingDate">
          Preferred date and time *
        </label>
        <div style={styles.inputWithIcon}>
          <CalendarDays size={18} />
          <input
            id="bookingDate"
            type="datetime-local"
            min={getLocalDateTime()}
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            required
            style={styles.dateInput}
          />
        </div>

        <label style={styles.label} htmlFor="address">
          Service address *
        </label>
        <textarea
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter the complete address where the service is needed"
          maxLength={500}
          required
          rows={3}
          style={styles.input}
        />

        <label style={styles.label} htmlFor="description">
          Describe your requirements *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the work you need done"
          maxLength={2000}
          rows={4}
          style={styles.input}
          required
        />

        <button
          type="submit"
          disabled={
            loadingProviders ||
            submitting ||
            providers.length === 0
          }
          style={{
            ...styles.submitButton,
            opacity:
              loadingProviders || submitting || providers.length === 0
                ? 0.65
                : 1,
          }}
        >
          {submitting ? (
            <>
              <LoaderCircle size={18} />
              Submitting booking...
            </>
          ) : (
            <>
              <Search size={18} />
              Submit Booking Request
            </>
          )}
        </button>


        {showBookingDialog && (
  <div style={styles.dialogOverlay}>
    <div style={styles.dialogBox}>
      <CheckCircle size={45} color="#167852" />

      <h2 style={styles.dialogTitle}>Booking Successful!</h2>

      <p style={styles.dialogMessage}>
        Your service booking request has been submitted successfully.
      </p>

      <div style={styles.dialogBookingId}>
        Booking ID: {bookingId}
      </div>

      <p style={styles.dialogMessage}>
        Your booking remains pending until the service provider confirms it.
      </p>

      <button
        type="button"
        style={styles.dialogButton}
        onClick={() => setShowBookingDialog(false)}
      >
        OK
      </button>
    </div>
  </div>
)}

        <p style={styles.note}>
        Your service booking will remain pending until the service provider confirms your request.
        </p>
      </form>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px clamp(16px, 4vw, 48px)",
    background: "#f5f9f6",
    color: "#123b30",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 0",
    border: 0,
    background: "transparent",
    color: "#61776b",
    cursor: "pointer",
    fontSize: 14,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    maxWidth: 760,
    margin: "26px auto",
  },
  eyebrow: {
    margin: "0 0 8px",
    color: "#167852",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
  },
  heading: {
    margin: 0,
    fontSize: "clamp(27px, 4vw, 36px)",
  },
  subtitle: {
    color: "#71817a",
    lineHeight: 1.6,
    fontSize: 14,
  },
  headerIcon: {
    display: "grid",
    placeItems: "center",
    width: 55,
    height: 55,
    borderRadius: 15,
    background: "#e4f3e9",
    color: "#167852",
    flexShrink: 0,
  },
  form: {
    maxWidth: 760,
    margin: "0 auto",
    padding: "clamp(18px, 4vw, 30px)",
    border: "1px solid #e1ebe5",
    borderRadius: 16,
    background: "#ffffff",
    boxShadow: "0 5px 22px rgba(24,83,56,0.05)",
  },
  sectionHeading: {
    margin: "0 0 18px",
    fontSize: 19,
  },
  label: {
    display: "block",
    margin: "18px 0 8px",
    fontSize: 13,
    fontWeight: 700,
    color: "#34594a",
  },
  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: "12px 13px",
    border: "1px solid #dce6df",
    borderRadius: 9,
    outlineColor: "#167852",
    background: "#ffffff",
    color: "#123b30",
    fontSize: 14,
  },
  inputWithIcon: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 12px",
    border: "1px solid #dce6df",
    borderRadius: 9,
    color: "#167852",
  },
  dateInput: {
    width: "100%",
    minWidth: 0,
    padding: "12px 0",
    border: 0,
    outline: "none",
    color: "#123b30",
    background: "transparent",
    fontSize: 14,
  },
  providerCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 14,
    padding: 14,
    border: "1px solid #dcece1",
    borderRadius: 12,
    background: "#f7fbf8",
  },
  providerAvatar: {
    display: "grid",
    placeItems: "center",
    width: 52,
    height: 52,
    overflow: "hidden",
    borderRadius: 12,
    background: "#e4f3e9",
    color: "#167852",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  providerMeta: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    margin: "5px 0 0",
    color: "#71817a",
    fontSize: 12,
  },
  price: {
    marginLeft: "auto",
    color: "#167852",
    fontWeight: 700,
    fontSize: 16,
  },
  note: {
    color: "#71817a",
    fontSize: 12,
    lineHeight: 1.6,
    textAlign: "center",
  },
  info: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#61776b",
    fontSize: 14,
  },
  error: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    padding: 12,
    borderRadius: 9,
    background: "#fff1ef",
    color: "#a53e32",
    fontSize: 13,
    lineHeight: 1.5,
  },
  success: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    padding: 12,
    borderRadius: 9,
    background: "#e8f6ed",
    color: "#167047",
    fontSize: 13,
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },
  submitButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    width: "100%",
    marginTop: 24,
    padding: 14,
    border: 0,
    borderRadius: 9,
    background: "#167852",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },


dialog: {
  background: "#ffffff",
  color: "#123b30",
  padding: "30px 24px",
  borderRadius: 16,
  boxShadow: "0 12px 35px rgba(0, 0, 0, 0.2)",
  textAlign: "center",
  maxWidth: 400,
  width: "100%",
},
dialogHeading: {
  color: "#167852",
  margin: "14px 0 10px",
  fontSize: 23,
},
dialogText: {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#61776b",
  margin: "12px 0",
},
bookingId: {
  display: "block",
  padding: 13,
  margin: "16px 0",
  borderRadius: 9,
  background: "#e8f6ed",
  color: "#167047",
  fontWeight: 700,
  fontSize: 14,
  overflowWrap: "anywhere",
},


dialogOverlay: {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10000,
},

dialogBox: {
  backgroundColor: "#ffffff",
  padding: "30px",
  borderRadius: "16px",
  width: "90%",
  maxWidth: "420px",
  textAlign: "center",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.25)",
  animation: "popup 0.3s ease-out",
},

dialogTitle: {
  color: "#167852",
  fontSize: "24px",
  margin: "12px 0",
},

dialogMessage: {
  color: "#61776b",
  fontSize: "14px",
  lineHeight: 1.6,
  margin: "12px 0",
},

dialogBookingId: {
  backgroundColor: "#e8f6ed",
  color: "#167047",
  padding: "12px",
  borderRadius: "8px",
  fontWeight: "bold",
  overflowWrap: "anywhere",
  margin: "16px 0",
},

dialogButton: {
  width: "100%",
  padding: "12px",
  backgroundColor: "#167852",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "12px",
},

};
