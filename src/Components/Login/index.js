import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./indexLogin.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        "https://commandcenter.rivotmotors.com/logincredintial.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        // 🔐 server session is set here
        navigate("/dashboard", { replace: true });
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <img
          src="https://image2url.com/images/1755511837883-d480dc7d-7419-4341-acc6-decf0d6810b5.png"
          alt="Logo"
          className="logo"
        />
        <h2 className="hedif">RIVOT MOTORS COMMAND CENTER</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
