import React, { useState } from "react";
import { login, register } from "../api";
import './LoginRegister.css';

export default function LoginRegister({ onLogin }) {
  const [username, setUsername] = useState(""); 
  const [email, setEmail] = useState("");       
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); 
  const [mode, setMode] = useState("login");    
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        const data = await login(email, password);
        onLogin(data.access_token, data.is_admin);
      } else {
     
        await register(username, email, password, isAdmin);
        alert("User registered successfully. Please login.");
        setMode("login");
      }
    } catch (err) {
      console.error(err);

      if (err?.detail && Array.isArray(err.detail)) {
        setError(err.detail.map(e => e.msg).join("\n"));
      } else {
        setError(err.detail || "Something went wrong");
      }
    }
  };

  return (
    <div className="login-box">
      <h2>{mode === "login" ? "Login" : "Register"}</h2>

      <form onSubmit={handleSubmit}>
        {/* Username only in register mode */}
        {mode === "register" && (
          <input
            placeholder="Username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        )}

        {/* Email */}
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {/* Admin checkbox only in register */}
        {mode === "register" && (
        <label style={{ display: "inline-flex", alignItems: "center", marginTop: "10px" }}>
  <input
    type="checkbox"
    checked={isAdmin}
    onChange={(e) => setIsAdmin(e.target.checked)}
    style={{ marginRight: "5px" }} 
  />
  Register as Admin
</label>

        )}

        <button type="submit">
          {mode === "login" ? "Login" : "Register"}
        </button>
      </form>

      {/* Error Display */}
      {error && <div className="error">{error}</div>}

      <div className="toggle-mode">
        {mode === "login" ? (
          <span onClick={() => { setMode("register"); setError(null); }}>
            New user? Register
          </span>
        ) : (
          <span onClick={() => { setMode("login"); setError(null); }}>
            Already registered? Login
          </span>
        )}
      </div>
    </div>
  );
}
