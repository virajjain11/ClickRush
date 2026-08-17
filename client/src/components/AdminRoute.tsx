import { Navigate, Outlet } from "react-router";
import { useCurrentUserQuery } from "../hooks/useCurrentUserQuery";
import styles from "./AdminRoute.module.css";

export default function AdminRoute() {
  const { data: user, isPending } = useCurrentUserQuery();

  if (isPending) {
    return (
      <div className={styles.page}>
        <p className={styles.status} role="status">
          Checking access…
        </p>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
