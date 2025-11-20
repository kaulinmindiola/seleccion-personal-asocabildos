import NavbarPublic from "../components/NavbarPublic";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <>
      <NavbarPublic />
      <div className="pt-24">
        <Outlet />
      </div>
    </>
  );
}
