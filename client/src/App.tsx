import {
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router";
import ForgotPassword from "./components/ForgotPassword";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";

function Layout() {
  return <Outlet />;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<div>Hello World</div>} />
      <Route path="sign-in" element={<SignIn />} />
      <Route path="sign-up" element={<SignUp />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
    </Route>,
  ),
);

export default function App() {
  return <RouterProvider router={router} />;
}
