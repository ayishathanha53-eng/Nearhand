
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export default function Chat() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <button onClick={() => navigate("/customer/dashboard")}>
        Back to Dashboard
      </button>

      <h1><MessageCircle size={24} /> Messages</h1>
      <p>Communicate with your service providers.</p>

      <div style={{ padding: "20px", background: "#f1f7f2", borderRadius: "10px" }}>
        <p>No conversations available yet.</p>
        <p>Chat will be enabled when messaging is connected to the backend.</p>
      </div>
    </div>
  );
}
