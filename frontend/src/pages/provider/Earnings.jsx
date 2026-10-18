
import { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  Plus,
  RefreshCw,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Banknote,
} from "lucide-react";
import "./Earnings.css";

const API_URL = "http://localhost:5000";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const today = () => {
  const date = new Date();
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );
  return localDate.toISOString().slice(0, 10);
};

const emptyForm = () => ({
  amount: "",
  description: "",
  receivedAt: today(),
  paymentMethod: "Cash",
  notes: "",
});

export default function Earnings() {
  const [entries, setEntries] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(emptyForm);

  const loadEarnings = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again to view your earnings.");
      }

      const response = await fetch(`${API_URL}/api/providers/earnings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load earnings.");
      }

      setEntries(result.manualEntries || []);
      setTotalEarnings(Number(result.summary?.manualEarnings) || 0);
    } catch (err) {
      setError(err.message || "Unable to load earnings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEarnings();
  }, [loadEarnings]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/api/providers/earnings/manual`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...form,
            amount: Number(form.amount),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save earning.");
      }

      setForm(emptyForm());
      setShowForm(false);
      setNotice("Manual earning added successfully.");

      await loadEarnings();
    } catch (err) {
      setError(err.message || "Unable to save earning.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="earnings-page">
      <header className="earnings-header">
        <div>
          <h1>My Earnings</h1>
          <p>Record and track your manual income.</p>
        </div>

        <button
          type="button"
          className="earnings-refresh"
          onClick={loadEarnings}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="earnings-alert earnings-alert-error" role="alert">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="earnings-alert earnings-alert-success" role="status">
          <CheckCircle2 size={19} />
          <span>{notice}</span>
        </div>
      )}

      <section className="earnings-summary">
        <article className="earnings-card earnings-card-primary">
          <div className="earnings-card-top">
            <span>Total manual earnings</span>
            <span className="earnings-icon">
              <Wallet size={22} />
            </span>
          </div>

          <strong>{formatMoney(totalEarnings)}</strong>
          <p>Income you've manually recorded</p>
        </article>
      </section>

      <section className="earnings-section">
        <div className="earnings-section-heading">
          <div>
            <h2>Manual earnings</h2>
            <p>Add income received outside NearHand booking payments.</p>
          </div>

          <button
            type="button"
            className="earnings-add-button"
            onClick={() => {
              setShowForm((current) => !current);
              setError("");
              setNotice("");
            }}
          >
            <Plus size={18} />
            {showForm ? "Close form" : "Add earning"}
          </button>
        </div>

        {showForm && (
          <form className="earnings-form" onSubmit={handleSubmit}>
            <div className="earnings-form-grid">
              <label>
                Amount (₹) *
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="e.g. 800"
                  required
                />
              </label>

              <label>
                Date received *
                <input
                  name="receivedAt"
                  type="date"
                  value={form.receivedAt}
                  onChange={handleChange}
                  max={today()}
                  required
                />
              </label>

              <label className="earnings-form-full">
                Service or income description *
                <input
                  name="description"
                  type="text"
                  maxLength="200"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="e.g. Fan repair for an outside customer"
                  required
                />
              </label>

              <label>
                Payment method
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank transfer</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Notes (optional)
                <input
                  name="notes"
                  type="text"
                  maxLength="500"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Additional details"
                />
              </label>
            </div>

            <div className="earnings-form-actions">
              <button
                type="button"
                className="earnings-cancel-button"
                onClick={() => setShowForm(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="earnings-add-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save earning"}
              </button>
            </div>

            <p className="earnings-form-note">
              This entry will not change any booking or booking payment status.
            </p>
          </form>
        )}
      </section>

      <section className="earnings-section">
        <div className="earnings-section-heading">
          <div>
            <h2>Earning history</h2>
            <p>Your manually recorded income.</p>
          </div>

          <span className="earnings-count">
            {entries.length} shown
          </span>
        </div>

        {loading ? (
          <div className="earnings-loading">
            <RefreshCw className="earnings-spin" size={24} />
            <p>Loading earnings...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="earnings-empty">
            <Banknote size={30} />
            <h3>No manual earnings yet</h3>
            <p>Add your first entry to start tracking your income.</p>
          </div>
        ) : (
          <div className="earnings-table-wrap">
            <table className="earnings-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Date received</th>
                  <th>Payment method</th>
                  <th className="earnings-amount-cell">Amount</th>
                </tr>
              </thead>

              <tbody>
                {entries.map((entry) => (
                  <tr key={entry._id}>
                    <td>
                      <strong>{entry.description}</strong>
                      {entry.notes && (
                        <small className="earnings-notes">
                          {entry.notes}
                        </small>
                      )}
                    </td>
                    <td>{formatDate(entry.receivedAt)}</td>
                    <td>{entry.paymentMethod}</td>
                    <td className="earnings-amount-cell">
                      {formatMoney(entry.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
