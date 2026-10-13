
import { useNavigate } from "react-router-dom";

export default function BookService() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <button onClick={() => navigate("/customer/dashboard")}>
        Back to Dashboard
      </button>

      <h1>Book a Service</h1>
      <p>Book a trusted service provider through NearHand.</p>

      <form onSubmit={(e) => {
        e.preventDefault();
        alert("Booking form is ready for backend integration.");
      }}>
        <p>
          <label>Service name</label><br />
          <input required placeholder="e.g. Plumbing" />
        </p>

        <p>
          <label>Preferred date</label><br />
          <input required type="date" min={new Date().toLocaleDateString("en-CA")} />
        </p>

        <p>
          <label>Service address</label><br />
          <textarea required placeholder="Enter your address" />
        </p>

        <p>
          <label>Describe your requirements</label><br />
          <textarea placeholder="Describe the service you need" />
        </p>

        <button type="submit">Continue Booking</button>
      </form>
    </div>
  );
}
