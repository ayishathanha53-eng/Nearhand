
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Eye,
  LayoutDashboard,
  FileText,
  MapPin,
  Phone,
  Mail,
  Menu,
  X,
  Save,
} from "lucide-react";
import "./Dashboard.css";

const API_URL = "http://localhost:5000/api/admin";
const SERVER_URL = "http://localhost:5000";

const PROVIDER_FILTERS = ["Pending", "Approved", "Rejected"];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [section, setSection] = useState("overview");
  const [filter, setFilter] = useState("Pending");
  const [summary, setSummary] = useState({});
  const [providers, setProviders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [complaintEdits, setComplaintEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("adminToken");

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
      throw new Error(data.message || "Request failed.");
    }

    return data;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryData, providerData, complaintData] = await Promise.all([
        api("/summary"),
        api(`/providers?status=${encodeURIComponent(filter)}`),
        api("/complaints"),
      ]);

      setSummary(summaryData);
      setProviders(providerData.providers || []);
      setComplaints(complaintData.complaints || []);
    } catch (err) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [api, filter]);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    loadData();
  }, [token, loadData, navigate]);

  function logout() {
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  }

  function displayName(provider) {
    return provider.fullName || provider.name || "Name not provided";
  }

  function displayValue(value) {
    return value === undefined || value === null || value === ""
      ? "Not provided"
      : String(value);
  }

  function fileUrl(path) {
    if (!path || typeof path !== "string") return "";

    if (/^https?:\/\//i.test(path)) return path;

    return `${SERVER_URL}/${path.replace(/^\/+/, "")}`;
  }

  function documentLinks(provider) {
    return [
      ["Identity proof", provider.idProof || provider.identityProof],
      ["Qualification certificate", provider.qualificationCertificate],
      ["Experience certificate", provider.experienceCertificate],
      ["Professional certificate", provider.professionalCertificate],
    ].filter(([, value]) => typeof value === "string" && value.trim());
  }

  function getCount(...values) {
    for (const value of values) {
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }

      if (typeof value === "string" && value.trim() !== "") {
        const number = Number(value);
        if (Number.isFinite(number)) return number;
      }
    }

    return 0;
  }

  const providerCounts = {
    pending: getCount(
      summary.pendingProviders,
      summary.pending,
      summary.providers?.pending,
      summary.providers?.Pending,
      summary.providerCounts?.pending
    ),
    approved: getCount(
      summary.approvedProviders,
      summary.approved,
      summary.providers?.approved,
      summary.providers?.Approved,
      summary.providerCounts?.approved
    ),
    rejected: getCount(
      summary.rejectedProviders,
      summary.rejected,
      summary.providers?.rejected,
      summary.providers?.Rejected,
      summary.providerCounts?.rejected
    ),
  };

  const totalProviders = getCount(
    summary.totalProviders,
    summary.totalProviderCount,
    summary.providers?.total,
    summary.providerCounts?.total
  ) || (
    providerCounts.pending +
    providerCounts.approved +
    providerCounts.rejected
  );

  const openComplaints = getCount(
    summary.openComplaints,
    summary.open,
    summary.complaints?.open,
    summary.complaints?.Open
  );

  const filteredProviders = providers.filter((provider) => {
    const text = [
      displayName(provider),
      provider.email,
      provider.phone,
      provider.serviceCategory,
      provider.city,
      provider.state,
      provider.verificationStatus,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase().trim());
  });

  const filteredComplaints = complaints.filter((complaint) => {
    const text = [
      complaint.subject,
      complaint.description,
      complaint.category,
      complaint.status,
      complaint.priority,
      complaint.customer?.name,
      complaint.customer?.fullName,
      complaint.customer?.email,
      complaint.provider?.fullName,
      complaint.provider?.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase().trim());
  });

  function editComplaint(id, field, value, complaint) {
    setComplaintEdits((previous) => ({
      ...previous,
      [id]: {
        status: previous[id]?.status ?? complaint.status ?? "open",
        priority: previous[id]?.priority ?? complaint.priority ?? "medium",
        adminNote: previous[id]?.adminNote ?? complaint.adminNote ?? "",
        [field]: value,
      },
    }));
  }

  async function updateComplaint(id, complaint) {
    const edits = complaintEdits[id] || {};

    const updates = {
      status: edits.status ?? complaint.status ?? "open",
      priority: edits.priority ?? complaint.priority ?? "medium",
      adminNote: edits.adminNote ?? complaint.adminNote ?? "",
    };

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      const result = await api(`/complaints/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      setNotice(result.message || "Complaint updated successfully.");

      setComplaintEdits((previous) => {
        const next = { ...previous };
        delete next[id];
        return next;
      });

      await loadData();
    } catch (err) {
      setError(err.message || "Could not update complaint.");
    } finally {
      setBusyId("");
    }
  }

  function openProvider(provider) {
    navigate(`/admin/providers/${provider._id}`);
  }

  function goToSection(nextSection, nextFilter) {
  setSection(nextSection);
  setSearch("");
  setNotice("");
  setError("");
  setSidebarOpen(false);

  if (nextFilter) {
    setFilter(nextFilter);
  }
}
  const pageTitle =
    section === "overview"
      ? "Dashboard Overview"
      : section === "providers"
        ? "Provider Verification"
        : "Customer Complaints";

  const pageDescription =
    section === "overview"
      ? "Monitor applications and customer concerns across Nearhand."
      : section === "providers"
        ? "Review provider applications, details and supporting documents."
        : "Review complaints and update their status.";

  if (loading && !providers.length && !complaints.length) {
    return (
      <div className="admin-loading">
        <RefreshCw size={28} className="admin-spin" />
        <p>Loading Nearhand Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {sidebarOpen && (
        <button
          className="admin-mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="admin-brand-area">
          <div className="admin-brand-icon">
            <ShieldCheck size={25} />
          </div>
          <div>
            <h2 className="admin-brand">Nearhand</h2>
            <p className="admin-tagline">Administration panel</p>
          </div>
          <button
            className="admin-close-sidebar"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-nav-label">WORKSPACE</div>

        <nav className="admin-navigation">
          <button
            className={`admin-nav ${
              section === "overview" ? "active" : ""
            }`}
            onClick={() => goToSection("overview")}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            className={`admin-nav ${
              section === "providers" ? "active" : ""
            }`}
            onClick={() => goToSection("providers")}
          >
            <Users size={19} />
            Provider Verification
            {providerCounts.pending > 0 && (
              <span className="admin-nav-count">
                {providerCounts.pending}
              </span>
            )}
          </button>

          <button
            className={`admin-nav ${
              section === "complaints" ? "active" : ""
            }`}
            onClick={() => goToSection("complaints")}
          >
            <MessageSquareWarning size={19} />
            Complaints
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-user-card">
            <div className="admin-avatar">A</div>
            <div>
              <strong>Administrator</strong>
              <span>Manage Nearhand</span>
            </div>
          </div>

          <button className="admin-nav admin-logout" onClick={logout}>
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={23} />
          </button>

          <div>
            <p className="admin-topbar-eyebrow">NEARHAND / ADMIN</p>
            <h1>{pageTitle}</h1>
          </div>

          <button
            className="admin-refresh-btn"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "admin-spin" : ""} />
            <span>Refresh</span>
          </button>
        </header>

        <section className="admin-page-intro">
          <div>
            <p>{pageDescription}</p>
          </div>
          <span className="admin-secure-label">
            <ShieldCheck size={15} />
            Admin workspace
          </span>
        </section>

        {error && (
          <div className="admin-alert admin-alert-error" role="alert">
            <XCircle size={18} />
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={17} />
            </button>
          </div>
        )}

        {notice && (
          <div className="admin-alert admin-alert-success" role="status">
            <CheckCircle2 size={18} />
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss notice">
              <X size={17} />
            </button>
          </div>
        )}

        {/* Overview */}
        {section === "overview" && (
          <>
            <div className="admin-section-heading">
              <div>
                <h2>Overview</h2>
                <p>Key information about your platform.</p>
              </div>
            </div>

            <div className="admin-stats-grid">
              <button
                className="admin-stat-card"
                onClick={() => goToSection("providers", "Pending")}

              >
                <div className="admin-stat-top">
                  <div className="admin-stat-icon green">
                    <Users size={22} />
                  </div>
                  <span className="admin-stat-link">View providers ↗</span>
                </div>
                <p>Total Providers</p>
                <h3>{totalProviders}</h3>
                <span className="admin-stat-footnote">
                  Registered on Nearhand
                </span>
              </button>

              <button
                className="admin-stat-card"
                onClick={() => {
                  setFilter("Pending");
                  goToSection("providers");
                }}
              >
                <div className="admin-stat-top">
                  <div className="admin-stat-icon amber">
                    <Clock size={22} />
                  </div>
                  <span className="admin-stat-link">Review ↗</span>
                </div>
                <p>Pending Applications</p>
                <h3>{providerCounts.pending}</h3>
                <span className="admin-stat-footnote">
                  Awaiting admin review
                </span>
              </button>

              <button
                className="admin-stat-card"
                onClick={() => {
                  setFilter("Approved");
                  goToSection("providers");
                }}
              >
                <div className="admin-stat-top">
                  <div className="admin-stat-icon green">
                    <CheckCircle2 size={22} />
                  </div>
                  <span className="admin-stat-link">View ↗</span>
                </div>
                <p>Approved Providers</p>
                <h3>{providerCounts.approved}</h3>
                <span className="admin-stat-footnote">
                  Approved applications
                </span>
              </button>

              <button
                className="admin-stat-card"
                onClick={() => goToSection("complaints")}
              >
                <div className="admin-stat-top">
                  <div className="admin-stat-icon red">
                    <MessageSquareWarning size={22} />
                  </div>
                  <span className="admin-stat-link">Review ↗</span>
                </div>
                <p>Open Complaints</p>
                <h3>{openComplaints}</h3>
                <span className="admin-stat-footnote">
                  Requiring attention
                </span>
              </button>
            </div>

            <div className="admin-content-card admin-quick-actions">
              <div className="admin-section-heading">
                <div>
                  <h2>Quick Actions</h2>
                  <p>Choose what you want to manage.</p>
                </div>
              </div>

              <div className="admin-quick-grid">
                <button
                  className="admin-quick-card"
                  onClick={() => goToSection("providers", "Approved")}
                >
                  <div className="admin-quick-icon">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3>Review Applications</h3>
                    <p>Open provider applications and supporting documents.</p>
                  </div>
                  <span>→</span>
                </button>

                <button
                  className="admin-quick-card"
                  onClick={() => goToSection("complaints")}
                >
                  <div className="admin-quick-icon">
                    <MessageSquareWarning size={22} />
                  </div>
                  <div>
                    <h3>Manage Complaints</h3>
                    <p>Review concerns and update complaint progress.</p>
                  </div>
                  <span>→</span>
                </button>
              </div>
            </div>

            <div className="admin-content-card">
              <div className="admin-section-heading">
                <div>
                  <h2>Pending Applications</h2>
                  <p>Applications waiting for your review.</p>
                </div>
                <button
                  className="admin-text-btn"
                  onClick={() => goToSection("providers")}
                >
                  View all
                </button>
              </div>

              {loading ? (
                <p className="admin-muted">Refreshing dashboard data...</p>
              ) : providers.length > 0 && filter === "Pending" ? (
                <div className="admin-mini-provider-list">
                  {providers.slice(0, 4).map((provider) => (
                    <div className="admin-mini-provider" key={provider._id}>
                      <div className="admin-provider-avatar">
                        {(displayName(provider)[0] || "P").toUpperCase()}
                      </div>
                      <div className="admin-mini-provider-info">
                        <strong>{displayName(provider)}</strong>
                        <span>
                          {displayValue(provider.serviceCategory)} ·{" "}
                          {displayValue(provider.city)}
                        </span>
                      </div>
                      <button
                        className="admin-outline-btn"
                        onClick={() => openProvider(provider)}
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state">
                  <CheckCircle2 size={28} />
                  <h3>No pending applications found</h3>
                  <p>New provider applications will appear here.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Provider verification */}
        {section === "providers" && (
          <>
            <div className="admin-stats-grid admin-provider-stats">
              <div className="admin-stat-card compact">
                <div className="admin-stat-top">
                  <div className="admin-stat-icon amber">
                    <Clock size={21} />
                  </div>
                </div>
                <p>Pending</p>
                <h3>{providerCounts.pending}</h3>
              </div>

              <div className="admin-stat-card compact">
                <div className="admin-stat-top">
                  <div className="admin-stat-icon green">
                    <CheckCircle2 size={21} />
                  </div>
                </div>
                <p>Approved</p>
                <h3>{providerCounts.approved}</h3>
              </div>

              <div className="admin-stat-card compact">
                <div className="admin-stat-top">
                  <div className="admin-stat-icon red">
                    <XCircle size={21} />
                  </div>
                </div>
                <p>Rejected</p>
                <h3>{providerCounts.rejected}</h3>
              </div>
            </div>

            <div className="admin-content-card">
              <div className="admin-section-heading">
                <div>
                  <h2>Provider Applications</h2>
                  <p>
                    Select an application status, then open a provider's full
                    details.
                  </p>
                </div>
              </div>

              <div className="admin-toolbar">
                <div className="admin-filter-tabs">
                  {PROVIDER_FILTERS.map((status) => (
                    <button
                      key={status}
                      className={`admin-filter-tab ${
                        filter === status ? "active" : ""
                      }`}
                      onClick={() => setFilter(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <label className="admin-search">
                  <Search size={18} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search providers..."
                  />
                </label>
              </div>

              {loading ? (
                <div className="admin-inline-loading">
                  <RefreshCw size={20} className="admin-spin" />
                  Loading providers...
                </div>
              ) : filteredProviders.length === 0 ? (
                <div className="admin-empty-state">
                  <Users size={30} />
                  <h3>No providers found</h3>
                  <p>
                    There are no matching {filter.toLowerCase()} applications.
                    Try another filter or search term.
                  </p>
                </div>
              ) : (
                <div className="admin-provider-list">
                  {filteredProviders.map((provider) => (
                    <article
                      className="admin-provider-card"
                      key={provider._id}
                    >
                      <div className="admin-provider-card-top">
                        <div className="admin-provider-avatar large">
                          {(displayName(provider)[0] || "P").toUpperCase()}
                        </div>

                        <div className="admin-provider-main">
                          <h3>{displayName(provider)}</h3>
                          <p>{displayValue(provider.serviceCategory)}</p>
                          <span
                            className={`admin-status-badge ${String(
                              provider.verificationStatus || filter
                            ).toLowerCase()}`}
                          >
                            {displayValue(provider.verificationStatus || filter)}
                          </span>
                        </div>

                        <button
                          className="admin-primary-btn"
                          onClick={() => openProvider(provider)}
                        >
                          <Eye size={17} />
                          View Details
                        </button>
                      </div>

                      <div className="admin-provider-info-grid">
                        <div>
                          <Mail size={16} />
                          <span>{displayValue(provider.email)}</span>
                        </div>
                        <div>
                          <Phone size={16} />
                          <span>{displayValue(provider.phone)}</span>
                        </div>
                        <div>
                          <MapPin size={16} />
                          <span>
                            {[provider.city, provider.state]
                              .filter(Boolean)
                              .join(", ") || "Location not provided"}
                          </span>
                        </div>
                        <div>
                          <BriefcaseTextFallback />
                          <span>
                            Experience: {displayValue(provider.experience)}
                          </span>
                        </div>
                      </div>

                      <div className="admin-provider-description">
                        {displayValue(provider.about || provider.description)}
                      </div>

                      {documentLinks(provider).length > 0 && (
                        <div className="admin-provider-documents">
                          <strong>Documents:</strong>
                          {documentLinks(provider).map(([label, path]) => (
                            <a
                              key={label}
                              href={fileUrl(path)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileText size={14} />
                              {label}
                            </a>
                          ))}
                        </div>
                      )}

                      <div className="admin-provider-card-footer">
                        <span>
                          Submitted {provider.createdAt
                            ? new Date(provider.createdAt).toLocaleDateString(
                                "en-IN"
                              )
                            : "date unavailable"}
                        </span>
                        <button
                          className="admin-text-btn"
                          onClick={() => openProvider(provider)}
                        >
                          Open full application →
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Complaints */}
       
{/* Complaints */}
{section === "complaints" && (
  <div className="admin-content-card">
    <div className="admin-section-heading">
      <div>
        <h2>Customer Messages</h2>
        <p>Review and manage customer complaints and feedback.</p>
      </div>
    </div>

    <label className="admin-search admin-complaint-search">
      <Search size={18} />
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search messages..."
      />
    </label>

    {loading ? (
      <div className="admin-inline-loading">
        <RefreshCw size={20} className="admin-spin" />
        Loading messages...
      </div>
    ) : filteredComplaints.length === 0 ? (
      <div className="admin-empty-state">
        <MessageSquareWarning size={30} />
        <h3>No messages found</h3>
        <p>Customer complaints and feedback will appear here.</p>
      </div>
    ) : (
      <div className="admin-complaint-list">
        {filteredComplaints.map((complaint) => (
          <article
            className="admin-complaint-card"
            key={complaint._id}
          >
            <div className="admin-complaint-header">
              <div>
                <h3>
                  {displayValue(
                    complaint.name ||
                    complaint.customer?.fullName ||
                    complaint.customer?.name ||
                    "Customer"
                  )}
                </h3>
                <p>
                  {displayValue(
                    complaint.email ||
                    complaint.customer?.email
                  )}
                </p>
              </div>

              <span
                className={`admin-status-badge ${String(
                  complaint.status || "open"
                ).toLowerCase().replace(/\s+/g, "-")}`}
              >
                {displayValue(complaint.status || "open")}
              </span>
            </div>

            <p className="admin-complaint-description">
              {displayValue(
                complaint.message ||
                complaint.description ||
                "No message provided."
              )}
            </p>

            <div className="admin-complaint-footer">
              <span>
                {complaint.createdAt
                  ? new Date(complaint.createdAt).toLocaleDateString("en-IN")
                  : "Date unavailable"}
              </span>

            </div>
          </article>
        ))}
      </div>
    )}
  </div>
)}


        <footer className="admin-footer">
          <span>Nearhand Admin Panel</span>
          <span>Provider review · Complaints management</span>
        </footer>
      </main>
    </div>
  );
}

function BriefcaseTextFallback() {
  return <FileText size={16} />;
}
