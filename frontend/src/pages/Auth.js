import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleEnter = () => {
  if (!email.trim()) {
    alert("Email is required");
    return;
  }

  // ✅ Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    alert("Enter a valid email (example: name@gmail.com)");
    return;
  }

  // ✅ Optional name validation (only letters)
  if (name && !/^[a-zA-Z ]+$/.test(name)) {
    alert("Name should contain only letters");
    return;
  }

  localStorage.setItem("userEmail", email);
  localStorage.setItem("userName", name || "User");

  setLoading(true);

  setTimeout(() => {
    navigate("/dashboard");
  }, 1500);
};

  return (
    <div>
      <div className="navbar">
        🏢 Apartment Sales AI Agent
      </div>

      <div className="main">
        <div className="container">
          <h1>Welcome</h1>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br /><br />

          <input
            type="text"
            placeholder="Enter Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <br /><br />

          <button onClick={handleEnter} disabled={loading}>
            {loading ? "Initializing AI Agent..." : "Enter Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;