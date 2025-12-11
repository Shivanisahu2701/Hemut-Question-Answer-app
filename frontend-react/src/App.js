import React, { useState } from "react";
import Dashboard from "./components/Dashboard";
import QuestionForm from "./components/QuestionForm";
import LoginRegister from "./components/LoginRegister";
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem("adminToken") || null);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");
console.log(token);
 const onLogin = (token, admin) => {
  const adminBool = admin === 1 || admin === true;
  localStorage.setItem("adminToken", token);
  localStorage.setItem("isAdmin", adminBool);
  setToken(token);
  setIsAdmin(adminBool);
};

  const onLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    setToken(null);
    setIsAdmin(false);
  };

  return (
    <div className="app-container">
      <h1>Q&A Dashboard</h1>
      
      {!token ? (
        <LoginRegister onLogin={onLogin} />
      ) : (
        <div className="dashboard-wrapper">
          {/* Only show QuestionForm to guests */}
          {!isAdmin && <QuestionForm />}
          
          {/* Dashboard shows all questions */}
          <div className="dashboard-box">
            {isAdmin && (
              <div className="admin-header">
                Admin logged in
                <button className="logout-btn" onClick={onLogout}>Logout</button>
              </div>
            )}
            <Dashboard adminToken={isAdmin ? token : null} isAdmin={isAdmin} />
          </div>

          {/* Logout button for guest */}
          {!isAdmin && (
            <button className="logout-btn guest-logout" onClick={onLogout}>Logout</button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
