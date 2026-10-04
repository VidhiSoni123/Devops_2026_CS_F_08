import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import API from "../../services/api";

function CandidateLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!email.includes("@")) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await API.post("/auth/candidate/login", {
          email,
          password,
        });

        console.log(response.data);

        login("candidate");
        navigate("/candidate");
      } catch (error) {
        const message =
          error.response?.data?.message ||
          "Login failed. Please try again.";

        setErrors({
          email: message,
        });
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Candidate Login</h1>

        <p>Login to continue your career journey.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {errors.email && (
              <small className="form-error">{errors.email}</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {errors.password && (
              <small className="form-error">{errors.password}</small>
            )}
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/candidate/signup">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default CandidateLogin;