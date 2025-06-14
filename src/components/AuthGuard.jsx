import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AuthGuard = ({ children }) => {
  const { access_token } = useSelector((state) => state.user);
  
  // If user is already logged in, redirect to dashboard
  return access_token ? <Navigate to="/dashboard" replace /> : children;
};

export default AuthGuard; 