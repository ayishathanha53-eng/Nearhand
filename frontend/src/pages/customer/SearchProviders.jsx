
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";

export default function SearchProviders() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <button onClick={() => navigate("/customer/dashboard")}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <h1>Search Service Providers</h1>
      <p>Find professionals for your everyday needs.</p>

      <input
        type="text"
        placeholder="Search electrician, plumber, tutor..."
        style={{ padding: "12px", width: "min(100%, 400px)" }}
      />
      <button style={{ padding: "12px" }}>
        <Search size={16} /> Search
      </button>

      <p>Provider search results will appear here.</p>
    </div>
  );
}
