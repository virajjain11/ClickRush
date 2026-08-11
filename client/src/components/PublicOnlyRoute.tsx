import { Navigate, Outlet } from "react-router";
import { useAccessToken } from "../hooks/useAccessToken";

export default function PublicOnlyRoute() {
  const accessToken = useAccessToken();

  if (accessToken) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
