import {
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router";
import SignIn from "./components/SignIn";

function Layout() {
  return <Outlet />;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<div>Hello World</div>} />
      <Route path="sign-in" element={<SignIn />} />
    </Route>,
  ),
);

export default function App() {
  return <RouterProvider router={router} />;
}
