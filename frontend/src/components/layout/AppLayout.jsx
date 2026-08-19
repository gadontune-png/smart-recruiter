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
      <Navbar
        onToggleSidebar={() => dispatch(toggleSidebar())}
      />
      <div className="layout-body">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() =>
            isSidebarOpen &&
            dispatch(toggleSidebar())
          }
        />
        <main className="main-content" style={{ marginTop: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;