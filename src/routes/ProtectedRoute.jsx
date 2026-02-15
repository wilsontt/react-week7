import { Navigate } from "react-router-dom";

/** 後台保護層：未登入則導向 /Admin/Login */
export default function ProtectedRoute({ isAuth, children }) {
  if (!isAuth) 
    return <Navigate to="/Admin/Login" replace />;
  return children;
}
