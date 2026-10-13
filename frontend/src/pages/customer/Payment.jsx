
import { useNavigate } from "react-router-dom";
import { CreditCard } from "lucide-react";

export default function Payment() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <button onClick={() => navigate("/customer/dashboard")}>
        Back to Dashboard
      </button>

      <h1><CreditCard size={24} /> Payments</h1>
      <p>View payment information for your service bookings.</p>

      <div style={{ padding: "20px", background: "#f1f7f2", borderRadius: "10px" }}>
        <h3>Payment History</h3>
        <p>No payment records are available yet.</p>
        <p>Payment processing must be connected before real transactions can be made.</p>
      </div>
    </div>
  );
}
