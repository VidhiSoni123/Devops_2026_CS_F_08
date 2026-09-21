import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
function RecruiterLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    // Check email
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!email.includes("@")) {
      newErrors.email = "Enter a valid email address";
    }

    // Check password
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    // Continue only when there are no errors
    if (Object.keys(newErrors).length === 0) {
  console.log("Recruiter Login:", {
    email,
    password,
  });

  login("recruiter");
  navigate("/recruiter");
}
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Recruiter Login</h1>

        <p>Sign in to access your recruiter dashboard.</p>

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
  <Link to="/recruiter/signup">Sign up</Link>
</p>
      </div>
    </div>
  );
}

export default RecruiterLogin;