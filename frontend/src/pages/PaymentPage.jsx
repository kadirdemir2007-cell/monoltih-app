import { useState } from "react";

function PaymentPage() {
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");

  const handlePayment = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    setMsg(data.message);
  };

  return (
    <div>
      <h2>Payment</h2>
      <form onSubmit={handlePayment}>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
        <button type="submit">Pay</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}

export default PaymentPage;
