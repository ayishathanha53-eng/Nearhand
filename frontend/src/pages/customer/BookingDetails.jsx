
import { useNavigate } from "react-router-dom";

export default function BookingDetails() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <button onClick={() => navigate("/customer/booking-history")}>
        Back to Booking History
      </button>

      <h1>Booking Details</h1>
      <p>View your service appointment information.</p>

      <div style={{ padding: "20px", background: "#f1f7f2", borderRadius: "10px" }}>
        <p>Service: Not selected</p>
        <p>Provider: Not selected</p>
        <p>Date: Not scheduled</p>
        <p>Address: Not provided</p>
        <p>Status: No booking selected</p>
      </div>
    </div>
  );
}
