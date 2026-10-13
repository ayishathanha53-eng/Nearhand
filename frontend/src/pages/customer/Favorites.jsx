
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

export default function Favorites() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <button onClick={() => navigate("/customer/dashboard")}>
        Back to Dashboard
      </button>

      <h1><Heart size={24} /> Favorite Providers</h1>
      <p>Keep your preferred service providers in one place.</p>

      <div style={{ padding: "20px", background: "#f1f7f2", borderRadius: "10px" }}>
        <p>You haven't added any favorite providers yet.</p>
        <button onClick={() => navigate("/customer/search-providers")}>
          Find Providers
        </button>
      </div>
    </div>
  );
}
