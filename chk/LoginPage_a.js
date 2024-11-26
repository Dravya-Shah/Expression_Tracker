import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../../services/api"; // Import login from api service
import "./LoginPage.css";

const LoginPage = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Clear error when inputs change
  useEffect(() => {
    if (error) setError("");
  }, [name, password]);

  // Check if user is already logged in
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const userName = localStorage.getItem("userName");

    if (userRole && userName) {
      navigateBasedOnRole(userRole);
    }
  }, []);

  const navigateBasedOnRole = (role) => {
    const from =
      location.state?.from?.pathname ||
      (role === "admin" ? "/admin" : "/start-game");
    navigate(from, { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await login(name, password);
      const { role, name: userName } = response;

      // Store user info in localStorage
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", userName);

      // Navigate based on role
      navigateBasedOnRole(role);
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 401) {
        setError(err.response.data.message || "Invalid credentials");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          "Unable to connect to server. Please check your internet connection."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Welcome Back!</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="form-input"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button
            type="submit"
            disabled={isLoading}
            className={`login-button ${isLoading ? "loading" : ""}`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="login-footer">
          <p>Default Credentials:</p>
          <ul>
            <li>Admin: admin / admin123</li>
            <li>User: user1 / user123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
