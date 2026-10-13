
import { useNavigate } from "react-router-dom";

export default function BookingHistory() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <button onClick={() => navigate("/customer/dashboard")}>
        Back to Dashboard
      </button>

      <h1>Booking History</h1>
      <p>View your previous and current service bookings.</p>

      <div style={{ padding: "20px", background: "#f1f7f2", borderRadius: "10px" }}>
        <h3>Your bookings</h3>
        <p>Your saved bookings will appear here once connected to the backend.</p>
      </div>
    </div>
  );
}
