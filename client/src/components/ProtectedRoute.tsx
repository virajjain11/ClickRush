import { Navigate, Outlet } from "react-router";
import { useAccessToken } from "../hooks/useAccessToken";

export default function ProtectedRoute() {
  const accessToken = useAccessToken();

  if (!accessToken) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
}
