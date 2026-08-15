import {
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router";
import ForgotPassword from "./components/ForgotPassword";
import Home from "./components/Home";
import Leaderboard from "./components/Leaderboard";
import Play from "./components/game/Play";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Stats from "./components/Stats";

function Layout() {
  return <Outlet />;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Navigate to="/home" replace />} />
      <Route element={<PublicOnlyRoute />}>
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="home" element={<Home />} />
        <Route path="play" element={<Play />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="stats" element={<Stats />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Route>,
  ),
);

export default function App() {
  return <RouterProvider router={router} />;
}
