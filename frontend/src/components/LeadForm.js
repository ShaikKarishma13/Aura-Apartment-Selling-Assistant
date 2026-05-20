import { useState } from "react";

function LeadForm({ onAddLead }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isValid = name.trim() !== "" && /^[0-9]{10}$/.test(phone);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !phone) {
      setError("Please fill all fields");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(phone)) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    setError("");

    // 🔥 CALL APP FUNCTION
    const result = onAddLead({ name, phone });

    // 🔥 HANDLE DUPLICATE ERROR
    if (result?.error) {
      setError(result.error);
      return;
    }

    // 🔥 SUCCESS TOAST
    setSuccess("Lead added successfully ✅");

    setTimeout(() => {
      setSuccess("");
    }, 2000);

    setName("");
    setPhone("");
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>Add New Lead</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))
          }
        />
        <br /><br />

        <input
          type="text"
          placeholder="Enter Phone"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, ""))
          }
        />
        <br /><br />

        {/* 🔴 ERROR */}
        {error && (
          <p style={{ color: "red", fontSize: "14px" }}>
            {error}
          </p>
        )}

        {/* 🟢 SUCCESS */}
        {success && (
          <p style={{ color: "green", fontSize: "14px" }}>
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid}
          style={{
            opacity: isValid ? 1 : 0.5,
            cursor: isValid ? "pointer" : "not-allowed"
          }}
        >
          Add Lead
        </button>
      </form>
    </div>
  );
}

export default LeadForm;
