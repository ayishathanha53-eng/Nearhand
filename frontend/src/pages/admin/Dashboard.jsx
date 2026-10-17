import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquareWarning,
  RefreshCw,
  LogOut,
  Search,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_URL = "http://localhost:5000/api/admin";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState("providers");
  const [filter, setFilter] = useState("pending");
  const [summary, setSummary] = useState({});
  const [providers, setProviders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");

  const token = localStorage.getItem("token");

  const api = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryData, providerData, complaintData] = await Promise.all([
        api("/summary"),
        api(`/providers?status=${filter}`),
        api("/complaints"),
      ]);

      setSummary(summaryData);
      setProviders(providerData.providers || []);
      setComplaints(complaintData.complaints || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [api, filter]);

  useEffect(() => {
    if (!token) {
      setError("Please sign in with an administrator account.");
      setLoading(false);
      return;
    }
    loadData();
  }, [token, loadData]);

  async function reviewProvider(provider, action) {
    let reason = "";

    if (action === "reject") {
      reason = window.prompt("Enter the reason for rejecting this application:") || "";
      if (!reason.trim()) return;
    } else if (!window.confirm(`Approve ${provider.fullName || provider.name || "this provider"}?`)) {
      return;
    }

    setBusyId(provider._id);
    setNotice("");
    setError("");

    try {
      const result = await api(
        `/providers/${provider._id}/${action}`,
        {
          method: "PATCH",
          body: JSON.stringify(action === "reject" ? { reason } : {}),
        }
      );

      setNotice(result.message);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  async function updateComplaint(id, updates) {
    setBusyId(id);
    setError("");
    setNotice("");

    try {
      const result = await api(`/complaints/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      setNotice(result.message);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function displayName(provider) {
    return provider.fullName || provider.name || "Name not provided";
  }

  function documentLinks(provider) {
    const fields = [
      ["Identity proof", provider.identityProof],
      ["Qualification certificate", provider.qualificationCertificate],
      ["Professional certificate", provider.professionalCertificate],
      ["Experience certificate", provider.experienceCertificate],
    ];

    return fields.filter(([, value]) => typeof value === "string" && value.trim());
  }

  function fileUrl(path) {
    if (/^https?:\/\//i.test(path)) return path;
    return `http://localhost:5000/${path.replace(/^\/+/, "")}`;
  }

  const filteredProviders = providers.filter((provider) => {
    const text = [
      displayName(provider),
      provider.email,
      provider.serviceCategory,
      provider.city,
    ].filter(Boolean).join(" ").toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const filteredComplaints = complaints.filter((complaint) => {
    const text = [
      complaint.subject,
      complaint.description,
      complaint.category,
      complaint.status,
      complaint.customer?.name,
      complaint.customer?.fullName,
      complaint.customer?.email,
    ].filter(Boolean).join(" ").toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon"><ShieldCheck size={25} /></div>
          <div>
            <strong>NearHand</strong>
            <span>Admin Console</span>
          </div>
        </div>

        <p className="admin-sidebar-label">WORKSPACE</p>

        <button
          className={`admin-nav ${section === "providers" ? "active" : ""}`}
          onClick={() => { setSection("providers"); setSearch(""); }}
        >
          <Users size={19} /> Provider Verification
        </button>

        <button
          className={`admin-nav ${section === "complaints" ? "active" : ""}`}
          onClick={() => { setSection("complaints"); setSearch(""); }}
        >
          <MessageSquareWarning size={19} /> Customer Complaints
          {summary.openComplaints > 0 && (
            <span className="admin-nav-count">{summary.openComplaints}</span>
          )}
        </button>

        <div className="admin-sidebar-bottom">
          <p>NearHand Admin</p>
          <button className="admin-logout" onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">NEARHAND MANAGEMENT</p>
            <h1>Admin Dashboard</h1>
          </div>
          <button className="admin-refresh" onClick={loadData} disabled={loading}>
            <RefreshCw size={17} /> Refresh
          </button>
        </header>

        <section className="admin-content">
          <div className="admin-welcome">
            <div>
              <h2>Welcome back, Admin</h2>
              <p>Review applications and keep the marketplace safe and reliable.</p>
            </div>
            <div className="admin-welcome-icon"><ShieldCheck size={34} /></div>
          </div>

          <div className="admin-stats">
            <Stat icon={<Users />} title="Total Providers" value={summary.totalProviders} />
            <Stat icon={<Clock />} title="Pending Review" value={summary.pendingProviders} />
            <Stat icon={<CheckCircle2 />} title="Approved" value={summary.approvedProviders} />
            <Stat icon={<MessageSquareWarning />} title="Open Complaints" value={summary.openComplaints} />
          </div>

          {error && <div className="admin-alert error">{error}</div>}
          {notice && <div className="admin-alert success">{notice}</div>}

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>{section === "providers" ? "Provider Verification" : "Customer Complaints"}</h2>
                <p>
                  {section === "providers"
                    ? "Review submitted details and verification documents."
                    : "Track customer issues and update their resolution status."}
                </p>
              </div>
              <div className="admin-search">
                <Search size={17} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search records..."
                />
              </div>
            </div>

            {section === "providers" && (
              <>
                <div className="admin-filter-row">
                  {["pending", "approved", "rejected"].map((status) => (
                    <button
                      key={status}
                      className={`admin-filter ${filter === status ? "active" : ""}`}
                      onClick={() => setFilter(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <p className="admin-empty">Loading provider applications...</p>
                ) : filteredProviders.length === 0 ? (
                  <p className="admin-empty">No {filter} provider applications found.</p>
                ) : (
                  <div className="admin-record-list">
                    {filteredProviders.map((provider) => (
                      <article className="admin-record" key={provider._id}>
                        <div className="admin-record-top">
                          <div className="admin-avatar">
                            {(displayName(provider).charAt(0) || "P").toUpperCase()}
                          </div>
                          <div className="admin-record-title">
                            <h3>{displayName(provider)}</h3>
                            <p>{provider.email || "No email provided"}</p>
                            <span className={`admin-status ${provider.verificationStatus}`}>
                              {provider.verificationStatus || "pending"}
                            </span>
                          </div>
                          <div className="admin-service-tag">
                            {provider.serviceCategory || provider.serviceType || "Service not specified"}
                          </div>
                        </div>

                        <div className="admin-provider-details">
                          <div><span>Phone</span><strong>{provider.phone || "—"}</strong></div>
                          <div><span>Location</span><strong>{[provider.city, provider.state].filter(Boolean).join(", ") || provider.address || "—"}</strong></div>
                          <div><span>Experience</span><strong>{provider.experience ? `${provider.experience} years` : "—"}</strong></div>
                          <div><span>Starting price</span><strong>{provider.startingPrice ? `₹${provider.startingPrice}` : "—"}</strong></div>
                        </div>

                        {provider.description && (
                          <p className="admin-provider-description">{provider.description}</p>
                        )}

                        <div className="admin-documents">
                          <strong>Submitted documents</strong>
                          <div className="admin-document-links">
                            {documentLinks(provider).map(([label, path]) => (
                              <a key={label} href={fileUrl(path)} target="_blank" rel="noreferrer">
                                {label} <ExternalLink size={14} />
                              </a>
                            ))}
                            {documentLinks(provider).length === 0 && (
                              <span>No document links found in the provider record.</span>
                            )}
                          </div>
                        </div>

                        {provider.verificationStatus === "rejected" && provider.rejectionReason && (
                          <p className="admin-rejection-reason">
                            <strong>Rejection reason:</strong> {provider.rejectionReason}
                          </p>
                        )}

                        {provider.verificationStatus === "pending" && (
                          <div className="admin-record-actions">
                            <button
                              className="admin-approve"
                              disabled={busyId === provider._id}
                              onClick={() => reviewProvider(provider, "approve")}
                            >
                              <CheckCircle2 size={17} /> Approve
                            </button>
                            <button
                              className="admin-reject"
                              disabled={busyId === provider._id}
                              onClick={() => reviewProvider(provider, "reject")}
                            >
                              <XCircle size={17} /> Reject
                            </button>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {section === "complaints" && (
              loading ? (
                <p className="admin-empty">Loading complaints...</p>
              ) : filteredComplaints.length === 0 ? (
                <p className="admin-empty">No customer complaints found.</p>
              ) : (
                <div className="admin-record-list">
                  {filteredComplaints.map((complaint) => (
                    <article className="admin-record" key={complaint._id}>
                      <div className="admin-record-top">
                        <div className="admin-avatar complaint"><MessageSquareWarning size={21} /></div>
                        <div className="admin-record-title">
                          <h3>{complaint.subject}</h3>
                          <p>
                            Customer: {complaint.customer?.fullName ||
                              complaint.customer?.name ||
                              complaint.customer?.email ||
                              "Customer"}
                          </p>
                          <span className={`admin-status ${complaint.status}`}>
                            {complaint.status}
                          </span>
                        </div>
                        <span className={`admin-priority ${complaint.priority}`}>
                          {complaint.priority} priority
                        </span>
                      </div>

                      <p className="admin-complaint-description">{complaint.description}</p>
                      <p className="admin-complaint-meta">
                        Category: {complaint.category || "Other"} ·{" "}
                        {complaint.createdAt
                          ? new Date(complaint.createdAt).toLocaleString()
                          : "Date unavailable"}
                      </p>

                      <label className="admin-note-label">
                        Admin note
                        <textarea
                          id={`note-${complaint._id}`}
                          defaultValue={complaint.adminNote || ""}
                          placeholder="Add an internal resolution note..."
                        />
                      </label>

                      <div className="admin-complaint-actions">
                        <label>
                          Priority
                          <select
                            value={complaint.priority}
                            onChange={(event) => updateComplaint(complaint._id, {
                              priority: event.target.value,
                            })}
                            disabled={busyId === complaint._id}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </label>

                        <label>
                          Status
                          <select
                            value={complaint.status}
                            onChange={(event) => updateComplaint(complaint._id, {
                              status: event.target.value,
                            })}
                            disabled={busyId === complaint._id}
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </label>

                        <button
                          className="admin-approve"
                          disabled={busyId === complaint._id}
                          onClick={() => updateComplaint(complaint._id, {
                            adminNote: document.getElementById(`note-${complaint._id}`)?.value || "",
                          })}
                        >
                          Save note
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

function Stat({ icon, title, value }) {
  return (
    <article className="admin-stat">
      <div className="admin-stat-icon">{icon}</div>
      <p>{title}</p>
      <strong>{value ?? "—"}</strong>
    </article>
  );
}


