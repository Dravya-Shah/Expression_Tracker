import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css"; // Link the CSS file

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/login", {
        name: username,
        password: password,
      });

      const { redirectUrl } = response.data;
      if (redirectUrl) {
        // Save username in localStorage
        localStorage.setItem("username", username);
        navigate(redirectUrl);
      } else {
        alert("Invalid login response.");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Invalid username or password");
      } else {
        console.error("Error during login:", error.message);
      }
    }
  };

  return (
    <div className="background-container">
    <div className="outer-container">
      {/* Semi-transparent overlay */}
      <div className="overlay"></div>

      {/* Semicircular container */}
      <div className="semicircle">
        <div className="login-box">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            {/* Username Input */}
            <div className="input-field">
              <label htmlFor="username"></label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password Input */}
            <div className="input-field">
              <label htmlFor="password"></label>
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                {/* Toggle Button */}
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)} // Correctly use the toggle logic
                >
                  {showPassword ? "👀" : "😎"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}

export default LoginPage;
