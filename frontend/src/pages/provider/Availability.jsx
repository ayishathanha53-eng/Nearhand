
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  CheckCircle2,
  CircleDollarSign,
  Languages,
  BriefcaseBusiness,
  Radio,
  ShieldCheck,
  Save,
  LoaderCircle,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Availability.css";

const API_URL = "http://localhost:5000";

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

const defaultHours = () =>
  DAYS.map((day) => ({
    day,
    isWorking: !["Sunday"].includes(day),
    startTime: "09:00",
    endTime: "17:00",
    breakStart: "",
    breakEnd: "",
  }));

export default function Availability() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

   const [servicePincodes, setServicePincodes] = useState([]);
const [newPincode, setNewPincode] = useState("");

  const [form, setForm] = useState({
    serviceDescription: "",
    skills: "",
    languages: "",
    startingPrice: "",
    appointmentDuration: 60,
    bufferMinutes: 15,
    minimumBookingNoticeHours: 2,
    serviceRadiusKm: 10,
    workingHours: defaultHours(),
  });

  useEffect(() => {
    async function loadProvider() {
      try {
        if (!token) {
          setError("Please log in to manage your service availability.");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/providers/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load your profile.");
        }

        const p = data.provider || data.result?.provider || data;
        setProvider(p);

        console.log("Loaded provider data:", p);
console.log("Saved PIN codes:", p.servicePincodes);
console.log("Saved working hours:", p.workingHours);

const savedPincodes = p.servicePincodes;

setServicePincodes(
  Array.isArray(savedPincodes)
    ? savedPincodes.map((pin) => String(pin))
    : typeof savedPincodes === "string" && savedPincodes.trim()
      ? savedPincodes.split(",").map((pin) => pin.trim()).filter(Boolean)
      : []
);

        setForm({
          serviceDescription: p.serviceDescription || "",
          skills: Array.isArray(p.skills) ? p.skills.join(", ") : "",
          languages: Array.isArray(p.languages)
            ? p.languages.join(", ")
            : "",
          startingPrice:
            p.startingPrice && p.startingPrice !== 0
              ? String(p.startingPrice)
              : "",
          appointmentDuration: p.appointmentDuration ?? 60,
          bufferMinutes: p.bufferMinutes ?? 15,
          minimumBookingNoticeHours: p.minimumBookingNoticeHours ?? 2,
          workingHours: DAYS.map((day) => {
            const saved = p.workingHours?.find((item) => item.day === day);
            return saved || {
              day,
              isWorking: false,
              startTime: "09:00",
              endTime: "17:00",
              breakStart: "",
              breakEnd: "",
            };
          }),
        });
      } catch (err) {
        setError(err.message || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProvider();
  }, [token]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addServicePincode = () => {
  const pincode = newPincode.trim();

  if (!/^\d{6}$/.test(pincode)) {
    setError("Enter a valid six-digit PIN code.");
    return;
  }

  if (servicePincodes.includes(pincode)) {
    setError("This PIN code has already been added.");
    return;
  }

  setServicePincodes((prev) => [...prev, pincode]);
  setNewPincode("");
  setError("");
};

const removeServicePincode = (pincode) => {
  setServicePincodes((prev) => prev.filter((pin) => pin !== pincode));
};

  const updateDay = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      workingHours: prev.workingHours.map((day, i) =>
        i === index ? { ...day, [key]: value } : day
      ),
    }));
  };

  async function saveSetup(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Please log in again.");
      return;
    }

    const skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
    const languages = form.languages
      .split(",").map((s) => s.trim()).filter(Boolean);

    if (!form.serviceDescription.trim()) {
      setError("Please enter a service description.");
      return;
    }

    if (!skills.length) {
      setError("Please enter at least one skill.");
      return;
    }

    if (!form.startingPrice || Number(form.startingPrice) <= 0) {
      setError("Please enter a starting price greater than zero.");
      return;
    }

    if (servicePincodes.length === 0) {
  setError("Please add at least one service-area PIN code.");
  return;
}

    if (!form.workingHours.some((day) => day.isWorking)) {
      setError("Select at least one working day.");
      return;
    }

    for (const day of form.workingHours) {
      if (!day.isWorking) continue;

      if (!day.startTime || !day.endTime || day.startTime >= day.endTime) {
        setError(`Check the working hours for ${day.day}.`);
        return;
      }

      if (Boolean(day.breakStart) !== Boolean(day.breakEnd)) {
        setError(`Enter both break times for ${day.day}, or leave both blank.`);
        return;
      }

      if (
        day.breakStart &&
        (day.breakStart < day.startTime ||
          day.breakEnd > day.endTime ||
          day.breakStart >= day.breakEnd)
      ) {
        setError(`Check the break times for ${day.day}.`);
        return;
      }
    }

    const payload = {
      serviceDescription: form.serviceDescription.trim(),
      skills,
      languages,
      startingPrice: Number(form.startingPrice),
      appointmentDuration: Number(form.appointmentDuration),
      bufferMinutes: Number(form.bufferMinutes),
      minimumBookingNoticeHours: Number(form.minimumBookingNoticeHours),
      servicePincodes,

      workingHours: form.workingHours.map((day) => ({
        ...day,
        breakStart: day.breakStart || undefined,
        breakEnd: day.breakEnd || undefined,
      })),
    };

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/providers/setup`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save your setup.");
      }

      setProvider((prev) => ({
  ...prev,
  ...(data.provider || {}),
  profileCompleted: true,
  profileCompletion: 100,
  acceptingBookings: prev?.acceptingBookings ?? false,
  isAvailableForCustomers: prev?.isAvailableForCustomers ?? false,
}));

setMessage("Your service setup has been saved successfully. Profile completion: 100%.");

      setMessage("Your service setup has been saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save your setup.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability() {
    setError("");
    setMessage("");

    if (!token) {
      setError("Please log in again.");
      return;
    }

    if (provider?.verificationStatus !== "Approved") {
      setError("Your account must be approved by the admin before going live.");
      return;
    }

    if (!provider?.profileCompleted) {
      setError("Please save your service setup before going live.");
      return;
    }

    const nextValue = !provider.acceptingBookings;
    setActivating(true);

    try {
      const response = await fetch(`${API_URL}/api/providers/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ acceptingBookings: nextValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update availability.");
      }

      setProvider((prev) => ({
        ...prev,
        ...(data.provider || {}),
        acceptingBookings: nextValue,
        isAvailableForCustomers: nextValue,
      }));

      setMessage(
        nextValue
          ? "Your profile is live and ready to receive bookings."
          : "Your profile has been paused."
      );
    } catch (err) {
      setError(err.message || "Unable to update availability.");
    } finally {
      setActivating(false);
    }
  }

  const isLive =
    Boolean(provider?.acceptingBookings) &&
    Boolean(provider?.isAvailableForCustomers);

  if (loading) {
    return (
      <div className="availability-loading">
        <LoaderCircle className="availability-spinner" size={30} />
        <p>Loading your workspace...</p>
      </div>
    );
  }

  return (
    <main className="availability-page">
      <div className="availability-topline">
        <button
          className="availability-back"
          onClick={() => navigate("/provider/dashboard")}
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>

        <span className={`availability-status ${isLive ? "live" : ""}`}>
          <span className="status-dot" />
          {isLive ? "Live" : provider?.verificationStatus || "Not live"}
        </span>
      </div>

      <header className="availability-heading">
        <div>
          <p className="availability-eyebrow">WORKSPACE / AVAILABILITY</p>
          <h1>Service availability</h1>
          <p className="availability-subtitle">
            Manage your services, working hours and booking preferences.
          </p>
        </div>
        <div className="availability-heading-icon">
          <CalendarDays size={29} />
        </div>
      </header>

      <section className="availability-progress">
        <div className="progress-icon">
          <ShieldCheck size={23} />
        </div>
        <div className="progress-copy">
          <strong>Profile setup</strong>
          <p>
            {provider?.profileCompleted
              ? "Your service setup has been completed."
              : "Complete your details and save your setup to continue."}
          </p>
        </div>
        <span className={`setup-pill ${provider?.profileCompleted ? "complete" : ""}`}>
          {provider?.profileCompleted ? "Completed" : "In progress"}
        </span>
      </section>

      {error && <div className="availability-alert error">{error}</div>}
      {message && <div className="availability-alert success">{message}</div>}

      <form onSubmit={saveSetup}>
        <section className="availability-card">
          <div className="availability-card-heading">
            <div className="section-icon"><BriefcaseBusiness size={21} /></div>
            <div>
              <h2>Service details</h2>
              <p>Help customers understand what you offer.</p>
            </div>
          </div>

          <div className="availability-form-grid">
            <label className="availability-field full-width">
              Service description <span className="required-star">*</span>
              <textarea
                rows={4}
                required
                value={form.serviceDescription}
                onChange={(e) => updateField("serviceDescription", e.target.value)}
                placeholder="Describe your services and experience..."
              />
            </label>

            <label className="availability-field">
              Skills <span className="required-star">*</span>
              <input
                required
                value={form.skills}
                onChange={(e) => updateField("skills", e.target.value)}
                placeholder="Plumbing, repairs, installation"
              />
              <small>Separate skills with commas.</small>
            </label>

            <label className="availability-field">
              Languages
              <div className="availability-input-icon">
                <Languages size={17} />
                <input
                  value={form.languages}
                  onChange={(e) => updateField("languages", e.target.value)}
                  placeholder="English, Malayalam"
                />
              </div>
              <small>Separate languages with commas.</small>
            </label>

            <label className="availability-field">
              Starting price (₹) <span className="required-star">*</span>
              <div className="availability-input-icon">
                <CircleDollarSign size={17} />
                <input
                  type="number"
                  min="1"
                  required
                  value={form.startingPrice}
                  onChange={(e) => updateField("startingPrice", e.target.value)}
                  placeholder="500"
                />
              </div>
            </label>

           
          </div>
        </section>

        <section className="availability-card">
          <div className="availability-card-heading">
  
            <div>

             <section className="availability-card booking-preferences-card">
  <div className="availability-card-heading">
    <div className="section-icon">
      <MapPin size={21} />
    </div>
    <div>
      <h2>Service locations</h2>
      <p>
        Add the PIN codes of all localities where you accept bookings.
      </p>
    </div>
  </div>

  <div className="availability-form-grid">
    <div className="availability-field full-width">
      <label htmlFor="servicePincode">
        Locality PIN code
      </label>

      <div className="availability-input-icon">
        <input
          id="servicePincode"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={newPincode}
          onChange={(e) =>
            setNewPincode(e.target.value.replace(/\D/g, ""))
          }
          placeholder="Enter six-digit PIN code"
        />

        <button
  type="button"
  className="service-pincode-add-button"
  onClick={addServicePincode}
  disabled={!newPincode}
>
  Add location
</button>
      </div>

      <small>
        Add each locality separately. Duplicate PIN codes are not allowed.
      </small>
    </div>

    <div className="full-width">
      <strong>Locations you serve ({servicePincodes.length})</strong>

      {servicePincodes.length === 0 ? (
        <p>
          No service locations added yet. Add at least one PIN code.
        </p>
      ) : (
        <div className="service-pincode-list">
          {servicePincodes.map((pincode) => (
            <div className="service-pincode-item" key={pincode}>
              <span>
                <MapPin size={16} />
                {pincode}
              </span>

              <button
                type="button"
                onClick={() => removeServicePincode(pincode)}
                aria-label={`Remove PIN code ${pincode}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
</section>
              <h2>Booking preferences</h2>
              <p>Minimum hours before booking.</p>
            </div>
          </div>

          <div className="availability-form-grid four-columns">
            

            

            <label className="availability-field">
              Booking notice (hours)
              <input
                type="number"
                min="0"
                max="720"
                value={form.minimumBookingNoticeHours}
                onChange={(e) => updateField("minimumBookingNoticeHours", e.target.value)}
              />
            </label>

            <div className="preference-note">
              <CheckCircle2 size={18} />
              <span>Keep your availability up to date.</span>
            </div>
          </div>
        </section>

        <section className="availability-card">
          <div className="availability-card-heading">
            <div className="section-icon"><CalendarDays size={21} /></div>
            <div>
              <h2>Weekly working hours</h2>
              <p>Choose your working days and service hours.</p>
            </div>
          </div>

          <div className="working-hours-list">
            {form.workingHours.map((day, index) => (
              <div className={`working-day ${day.isWorking ? "day-active" : ""}`} key={day.day}>
                <label className="working-day-name">
                  <input
                    type="checkbox"
                    checked={day.isWorking}
                    onChange={(e) => updateDay(index, "isWorking", e.target.checked)}
                  />
                  <span className="custom-check">
                    {day.isWorking && <CheckCircle2 size={18} />}
                  </span>
                  <span>{day.day}</span>
                </label>

                {day.isWorking ? (
                  <div className="working-day-times">
                    <label>
                      <span>Start</span>
                      <input
                        type="time"
                        required
                        value={day.startTime}
                        onChange={(e) => updateDay(index, "startTime", e.target.value)}
                      />
                    </label>
                    <label>
                      <span>End</span>
                      <input
                        type="time"
                        required
                        value={day.endTime}
                        onChange={(e) => updateDay(index, "endTime", e.target.value)}
                      />
                    </label>
                    
                  </div>
                ) : (
                  <span className="day-off-label">Day off</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="availability-save-bar">
          <p>Your changes are saved only when you select Save Setup.</p>
          <button className="availability-primary-button" type="submit" disabled={saving}>
            {saving ? <LoaderCircle className="availability-spinner" size={18} /> : <Save size={18} />}
            {saving ? "Saving..." : "Save Setup"}
          </button>
        </div>
      </form>

      <section className="availability-card go-live-card">
        <div className="availability-card-heading">
          <div className="section-icon"><Radio size={21} /></div>
          <div>
            <h2>Customer visibility</h2>
            <p>Control whether customers can find your provider profile.</p>
          </div>
        </div>

        <div className="go-live-content">
          <div>
            <strong>{isLive ? "Your profile is live" : "Your profile is currently paused"}</strong>
            <p>
              {isLive
                ? "You are accepting bookings. Pause your profile whenever you need to."
                : "Once approved and your setup is saved, you can make your profile visible to customers."}
            </p>
            {!provider?.profileCompleted && (
              <p className="go-live-hint">Save your setup before activating your profile.</p>
            )}
            {provider?.verificationStatus !== "Approved" && (
              <p className="go-live-hint">Admin approval is required to go live.</p>
            )}
          </div>

          <button
            type="button"
            className={isLive ? "availability-pause-button" : "availability-live-button"}
            onClick={toggleAvailability}
            disabled={
              activating ||
              !provider?.profileCompleted ||
              provider?.verificationStatus !== "Approved"
            }
          >
            {activating ? (
              <LoaderCircle className="availability-spinner" size={18} />
            ) : (
              <Radio size={18} />
            )}
            {activating ? "Updating..." : isLive ? "Pause Profile" : "Go Live"}
          </button>
        </div>
      </section>
    </main>
  );
}
