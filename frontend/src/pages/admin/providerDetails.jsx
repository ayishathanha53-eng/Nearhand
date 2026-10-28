
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  UserRound,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BriefcaseBusiness,
  CalendarDays,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import "./ProviderDetails.css";

const API_URL = "http://localhost:5000/api/admin";
const SERVER_URL = "http://localhost:5000";

export default function ProviderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
const [interviewNotes, setInterviewNotes] = useState("");
const [interviewLoading, setInterviewLoading] = useState(false);
const [customDialog, setCustomDialog] = useState(null);
const [dialogAction, setDialogAction] = useState(null);


const openDialog = (title, message, type = "info", onConfirm = null) => {
  setCustomDialog({ title, message, type });
  setDialogAction(() => onConfirm);
};

const closeDialog = () => {
  setCustomDialog(null);
  setDialogAction(null);
};

const confirmDialog = () => {
  const action = dialogAction;
  closeDialog();
  if (action) action();
};

const scheduleInterview = async () => {
  if (!interviewDate) {
    openDialog(
  "Interview date required",
  "Please select an interview date and time.",
  "warning"
);
    return;
  }

  try {
    setInterviewLoading(true);

    const response = await fetch(
      `${API_URL}/providers/${id}/interview/schedule`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          interviewDate: new Date(interviewDate).toISOString(),
          interviewNotes,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not schedule interview");
    }

    openDialog(
  "Interview scheduled",
  "The interview has been scheduled successfully.",
  "success"
);
    await loadProvider();
  } catch (error) {
    openDialog("Something went wrong", error.message, "error");
  } finally {
    setInterviewLoading(false);
  }
};

const submitInterviewResult = async (result) => {
  openDialog(
  `Confirm interview ${result.toLowerCase()}`,
  `Are you sure you want to mark this interview as ${result}?`,
  "confirm",
  async () => {
    try {
      setInterviewLoading(true);

      const response = await fetch(
        `${API_URL}/providers/${id}/interview/result`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({
            result,
            interviewNotes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save interview result");
      }

      openDialog(
        "Interview result saved",
        data.message || "The interview result was saved successfully.",
        "success"
      );

      await loadProvider();
    } catch (error) {
      openDialog("Something went wrong", error.message, "error");
    } finally {
      setInterviewLoading(false);
    }
  }
);
return;
  if (!confirmed) return;

  try {
    setInterviewLoading(true);

    const response = await fetch(
      `${API_URL}/providers/${id}/interview/result`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          result,
          interviewNotes,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not save interview result");
    }

    alert(data.message);
    await loadProvider();
  } catch (error) {
    alert(error.message);
  } finally {
    setInterviewLoading(false);
  }
};

  const api = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${
          localStorage.getItem("adminToken") || ""
        }`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  }, []);

  const loadProvider = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (!localStorage.getItem("adminToken")) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const data = await api(`/providers/${id}`);
      setProvider(data.provider);
    } catch (err) {
      setError(err.message || "Unable to load provider details.");
    } finally {
      setLoading(false);
    }
  }, [api, id, navigate]);

  useEffect(() => {
    loadProvider();
  }, [loadProvider]);

  function getFileUrl(filePath) {
    if (!filePath || typeof filePath !== "string") return "";

    if (/^https?:\/\//i.test(filePath)) {
      return filePath;
    }

    return `${SERVER_URL}/${filePath.replace(/^\/+/, "")}`;
  }

  function formatDate(value) {
    if (!value) return "Not provided";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "Not provided";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function displayValue(value) {
    if (value === null || value === undefined || value === "") {
      return "Not provided";
    }

    return String(value);
  }

  function documentLinks() {
    if (!provider) return [];

    return [
      ["Identity proof", provider.idProof || provider.identityProof],
      ["Qualification certificate", provider.qualificationCertificate],
      ["Experience certificate", provider.experienceCertificate],
      ["Professional certificate", provider.professionalCertificate],
    ].filter(([, path]) => typeof path === "string" && path.trim());
  }


  async function approveProvider() {
   openDialog(
  "Approve provider",
  `Are you sure you want to approve ${
    provider.fullName || "this provider"
  }?`,
  "confirm",
  async () => {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await api(`/providers/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({}),
      });

      setProvider(result.provider);
      setNotice(result.message || "Provider approved successfully.");
    } catch (err) {
      setError(err.message || "Could not approve provider.");
    } finally {
      setBusy(false);
    }
  }
);
return;

    if (!confirmed) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await api(`/providers/${id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({}),
      });

      setProvider(result.provider);
      setNotice(result.message || "Provider approved successfully.");
    } catch (err) {
      setError(err.message || "Could not approve provider.");
    } finally {
      setBusy(false);
    }
  }

  async function rejectProvider(event) {
    event.preventDefault();

    if (!rejectionReason.trim()) {
      setError("Please enter a reason for rejecting this application.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await api(`/providers/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({
          reason: rejectionReason.trim(),
        }),
      });

      setProvider(result.provider);
      setNotice(result.message || "Provider application rejected.");
      setShowRejectDialog(false);
      setRejectionReason("");
    } catch (err) {
      setError(err.message || "Could not reject provider.");
    } finally {
      setBusy(false);
    }
  }
 
  if (loading) {
    return (
      <div className="provider-loading">
        <RefreshCw size={28} />
        <p>Loading provider details...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="provider-details-page">
        <div className="provider-details-container">
          <button
            className="provider-back-btn"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <div className="provider-details-card">
            <div className="provider-message provider-error">
              {error || "Provider not found."}
            </div>

            <button
              className="provider-action-btn provider-approve-btn"
              onClick={loadProvider}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const documents = documentLinks();
  const statusClass = String(provider.verificationStatus || "Pending")
    .toLowerCase();

  return (
    <div className="provider-details-page">
      <div className="provider-details-container">
        {/* Header */}
        <header className="provider-details-header">
          <div>
            <p className="customer-eyebrow">NEARHAND ADMIN</p>
            <h1>Provider Details</h1>
            <p>Review the provider's application and submitted documents.</p>
          </div>

          <button
            className="provider-back-btn"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>
        </header>

        {/* Messages */}
        {error && (
          <div className="provider-message provider-error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="provider-message provider-success" role="status">
            {notice}
          </div>
        )}

        {/* Provider overview */}
        <section className="provider-details-card">
          <div className="provider-section-title">
            <UserRound size={22} />
            <h2>Provider Overview</h2>
          </div>

          <div className="provider-details-grid">
            <div className="provider-detail-item">
              <label>Full Name</label>
              <p>{displayValue(provider.fullName || provider.name)}</p>
            </div>

            <div className="provider-detail-item">
              <label>Application Status</label>
              <p>
                <span className={`provider-status ${statusClass}`}>
                  {displayValue(provider.verificationStatus)}
                </span>
              </p>
            </div>

            <div className="provider-detail-item">
              <label>
                <Mail size={14} /> Email Address
              </label>
              <p>{displayValue(provider.email)}</p>
            </div>

            <div className="provider-detail-item">
              <label>
                <Phone size={14} /> Phone Number
              </label>
              <p>{displayValue(provider.phone)}</p>
            </div>

            <div className="provider-detail-item">
              <label>Date of Birth</label>
              <p>{formatDate(provider.dateOfBirth)}</p>
            </div>

            <div className="provider-detail-item">
              <label>Gender</label>
              <p>{displayValue(provider.gender)}</p>
            </div>

            <div className="provider-detail-item">
              <label>Application Submitted</label>
              <p>{formatDate(provider.createdAt)}</p>
            </div>

            <div className="provider-detail-item">
              <label>Last Reviewed</label>
              <p>{formatDate(provider.verificationReviewedAt)}</p>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="provider-details-card">
          <div className="provider-section-title">
            <MapPin size={22} />
            <h2>Address and Service Area</h2>
          </div>

          <div className="provider-details-grid">
            <div className="provider-detail-item">
              <label>Address</label>
              <p>{displayValue(provider.address)}</p>
            </div>

            <div className="provider-detail-item">
              <label>City</label>
              <p>{displayValue(provider.city)}</p>
            </div>

            <div className="provider-detail-item">
              <label>State</label>
              <p>{displayValue(provider.state)}</p>
            </div>

            <div className="provider-detail-item">
              <label>Pincode</label>
              <p>{displayValue(provider.pincode)}</p>
            </div>

            <div className="provider-detail-item">
              <label>Service Area</label>
              <p>{displayValue(provider.serviceArea)}</p>
            </div>

            <div className="provider-detail-item">
              <label>Service Category</label>
              <p>{displayValue(provider.serviceCategory)}</p>
            </div>
          </div>
        </section>

        {/* Education and experience */}
        <section className="provider-details-card">
          <div className="provider-section-title">
            <GraduationCap size={22} />
            <h2>Education and Experience</h2>
          </div>

          <div className="provider-details-grid">
            <div className="provider-detail-item">
              <label>Highest Qualification</label>
              <p>{displayValue(provider.highestQualification)}</p>
            </div>

            <div className="provider-detail-item">
              <label>Institution</label>
              <p>{displayValue(provider.institution)}</p>
            </div>

            <div className="provider-detail-item">
              <label>Graduation Year</label>
              <p>{displayValue(provider.graduationYear)}</p>
            </div>

            <div className="provider-detail-item">
              <label>
                <BriefcaseBusiness size={14} /> Experience
              </label>
              <p>{displayValue(provider.experience)}</p>
            </div>
          </div>

          <div className="provider-detail-item provider-about">
            <label>About the Provider</label>
            <p className="provider-description">
              {displayValue(provider.about || provider.description)}
            </p>
          </div>
        </section>

        {/* Documents */}
        <section className="provider-details-card">
          <div className="provider-section-title">
            <FileText size={22} />
            <h2>Submitted Documents</h2>
          </div>

          {documents.length > 0 ? (
            <div className="provider-document-list">
              {documents.map(([label, filePath]) => (
                <a
                  key={label}
                  className="provider-document-link"
                  href={getFileUrl(filePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText size={18} />
                  {label}
                  <span>View document ↗</span>
                </a>
              ))}

              {customDialog && (
  <div
    className="nh-dialog-overlay"
    onMouseDown={(event) => {
      if (
        event.target === event.currentTarget &&
        customDialog.type !== "confirm"
      ) {
        closeDialog();
      }
    }}
  >
    <section
      className="nh-dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="nh-dialog-title"
      aria-describedby="nh-dialog-message"
    >
      <div className={`nh-dialog-icon ${customDialog.type}`}>
        {customDialog.type === "success" ? (
          <CheckCircle2 size={28} />
        ) : customDialog.type === "error" ||
          customDialog.type === "warning" ? (
          <XCircle size={28} />
        ) : (
          <ShieldCheck size={28} />
        )}
      </div>

      <h2 id="nh-dialog-title">{customDialog.title}</h2>

      <p id="nh-dialog-message">{customDialog.message}</p>

      <div className="nh-dialog-actions">
        {customDialog.type === "confirm" && (
          <button
            type="button"
            className="nh-dialog-btn nh-dialog-cancel"
            onClick={closeDialog}
          >
            Cancel
          </button>
        )}

        <button
          type="button"
          autoFocus
          className={`nh-dialog-btn ${
            customDialog.type === "confirm"
              ? "nh-dialog-confirm"
              : "nh-dialog-primary"
          }`}
          onClick={
            customDialog.type === "confirm"
              ? confirmDialog
              : closeDialog
          }
        >
          {customDialog.type === "confirm" ? "Confirm" : "Got it"}
        </button>
      </div>
    </section>
  </div>
)}

            </div>
          ) : (
            <p>No documents have been uploaded.</p>
          )}
        </section>

        {/* Interview information: fields will be connected to the backend later */}
        
        
{/* Interview and final approval */}
<section className="provider-details-card">
  <div className="provider-section-title">
    <CalendarDays size={22} />
    <h2>Interview and Final Approval</h2>
  </div>

  <div className="provider-details-grid">
    <div className="provider-detail-item">
      <label>Interview Status</label>
      <p>{provider.interviewStatus || "Not Scheduled"}</p>
    </div>

    <div className="provider-detail-item">
      <label>Interview Result</label>
      <p>{provider.interviewResult || "Pending"}</p>
    </div>

    <div className="provider-detail-item">
      <label>Scheduled Interview</label>
      <p>
        {provider.interviewDate
          ? new Date(provider.interviewDate).toLocaleString()
          : "Not scheduled"}
      </p>
    </div>
  </div>

  <label htmlFor="interviewDate">Interview date and time</label>
  <input
    id="interviewDate"
    type="datetime-local"
    value={interviewDate}
    onChange={(event) => setInterviewDate(event.target.value)}
    disabled={interviewLoading}
  />

  <label htmlFor="interviewNotes">Interview notes</label>
  <textarea
    id="interviewNotes"
    value={interviewNotes}
    onChange={(event) => setInterviewNotes(event.target.value)}
    placeholder="Add interview notes..."
    rows={4}
    disabled={interviewLoading}
  />

  
<div className="provider-decision-actions">
  <button
    type="button"
    className="provider-action-btn provider-approve-btn"
    onClick={scheduleInterview}
    disabled={
      interviewLoading ||
      busy ||
      provider.verificationStatus === "Rejected" ||
      provider.verificationStatus === "Approved"
    }
  >
    {interviewLoading ? "Saving..." : "Schedule Interview"}
  </button>

  {provider.verificationStatus !== "Rejected" &&
    provider.verificationStatus !== "Approved" && (
      <button
        type="button"
        className="provider-action-btn provider-reject-btn"
        onClick={() => {
          setError("");
          setNotice("");
          setShowRejectDialog(true);
        }}
        disabled={busy || interviewLoading}
      >
        <XCircle size={17} />
        Reject Application
      </button>
    )}


    
{provider.verificationStatus !== "Rejected" &&
  provider.verificationStatus !== "Approved" && (
    <button
      type="button"
      className="provider-action-btn provider-approve-btn"
      onClick={approveProvider}
      disabled={busy || interviewLoading}
    >
      <CheckCircle2 size={17} />
      {busy ? "Approving..." : "Approve Application"}
    </button>
)}


  {provider.interviewStatus === "Scheduled" && (
    <>
      <button
        type="button"
        className="provider-action-btn provider-approve-btn"
        onClick={() => submitInterviewResult("Pass")}
        disabled={interviewLoading || busy}
      >
        Mark Interview Passed
      </button>

      <button
        type="button"
        className="provider-action-btn provider-reject-btn"
        onClick={() => submitInterviewResult("Fail")}
        disabled={interviewLoading || busy}
      >
        Mark Interview Failed
      </button>
    </>
  )}
</div>


  {provider.interviewNotes && (
    <p>
      <strong>Saved notes:</strong> {provider.interviewNotes}
    </p>
  )}
</section>


       

        {/* Rejection dialog */}
        {showRejectDialog && (
          <div
            className="provider-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !busy) {
                setShowRejectDialog(false);
              }
            }}
          >
            <form className="provider-modal" onSubmit={rejectProvider}>
              <h2>Reject Application</h2>
              <p>
                Enter a clear reason for rejecting this provider's application.
                This reason will be saved with the application.
              </p>

              <label htmlFor="rejectionReason">
                Reason for rejection <span aria-hidden="true">*</span>
              </label>

              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Explain why the application is being rejected..."
                required
                minLength={3}
                maxLength={1000}
                disabled={busy}
              />

              <div className="provider-modal-actions">
                <button
                  type="button"
                  className="provider-back-btn"
                  onClick={() => {
                    setShowRejectDialog(false);
                    setRejectionReason("");
                    setError("");
                  }}
                  disabled={busy}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="provider-action-btn provider-reject-btn"
                  disabled={busy || !rejectionReason.trim()}
                >
                  <XCircle size={17} />
                  {busy ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
