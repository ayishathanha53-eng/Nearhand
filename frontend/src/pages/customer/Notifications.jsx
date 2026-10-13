
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

export default function Notifications() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <button onClick={() => navigate("/customer/dashboard")}>
        Back to Dashboard
      </button>

      <h1><Bell size={24} /> Notifications</h1>
      <p>Stay updated about your bookings.</p>

      <div style={{ padding: "20px", background: "#f1f7f2", borderRadius: "10px" }}>
        <p>You have no new notifications.</p>
      </div>
    </div>
  );
}
