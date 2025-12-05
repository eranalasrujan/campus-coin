import React, { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      // 🟢 FIX: Use 127.0.0.1 instead of localhost
      const res = await fetch("http://127.0.0.1:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) onLogin(data.user);
      else alert(data.error);
    } catch (e) {
      alert(
        "Backend is offline. Please run 'node index.js' in the backend folder."
      );
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ color: "#4F46E5", textAlign: "center" }}>Campus Coin</h1>
      <p style={{ textAlign: "center", color: "#666" }}>
        Blockchain Reward System
      </p>
      <div className="card">
        <h3>Login</h3>
        <input
          className="input"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn" onClick={handleLogin}>
          Sign In
        </button>
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#999",
          marginTop: "20px",
        }}
      >
        Demo Users: <br /> admin/123 • faculty/123 • student/123
      </div>
    </div>
  );
}
export default Login;
