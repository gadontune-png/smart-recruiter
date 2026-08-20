import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { toggleSidebar } from "../../features/ui/uiSlice";
import "./layout.css";

function AppLayout() {
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen);

  return (
    <div className="app-shell">
      <div className="app-shell-inner">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() =>
            isSidebarOpen && dispatch(toggleSidebar())
          }
        />
        <div className="app-main">
          <Navbar onToggleSidebar={() => dispatch(toggleSidebar())} />
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;