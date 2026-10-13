
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

export default function LiveTracking() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <button onClick={() => navigate("/customer/dashboard")}>
        Back to Dashboard
      </button>

      <h1><MapPin size={24} /> Live Tracking</h1>
      <p>Track the progress of your service appointment.</p>

      <div style={{
        padding: "30px",
        background: "#f1f7f2",
        borderRadius: "10px",
        textAlign: "center"
      }}>
        <MapPin size={40} />
        <h3>No active booking to track</h3>
        <p>Live location tracking requires a connected booking and location service.</p>
      </div>
    </div>
  );
}
