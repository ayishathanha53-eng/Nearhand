
import { useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <button onClick={() => navigate("/customer/dashboard")}>
        Back to Dashboard
      </button>

      <h1><UserRound size={24} /> My Profile</h1>
      <p>Manage your NearHand account information.</p>

      <div style={{ padding: "20px", background: "#f1f7f2", borderRadius: "10px" }}>
        <p>Customer profile information will appear here.</p>
        <p>Profile editing and saving will be connected to your account API.</p>
      </div>
    </div>
  );
}
