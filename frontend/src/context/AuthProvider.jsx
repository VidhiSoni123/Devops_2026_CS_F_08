import { useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("careerCompassUser");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
  const loggedInUser =
    typeof userData === "string"
      ? { type: userData }
      : {
          type: userData.role,
          id: userData.id,
          name: userData.name,
          email: userData.email,
        };

  setUser(loggedInUser);

  localStorage.setItem(
    "careerCompassUser",
    JSON.stringify(loggedInUser)
  );
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem("careerCompassUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}