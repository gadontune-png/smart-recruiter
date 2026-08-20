import { RouterProvider } from "react-router-dom";
import { ToastProvider } from "./components/common";
import { router } from "./routes/AppRoutes";

function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}

export default App;