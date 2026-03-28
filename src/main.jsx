import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AdminQuoteCreatedNotifications from "./realtime/AdminQuoteCreatedNotifications.jsx";
import { Toaster } from "@/components/ui/sonner";
import "./state/authStore";
// import { config } from "dotenv";
// config();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AdminQuoteCreatedNotifications />
    <App />
    <Toaster
      position="top-center"
      expand={false}
      closeButton
      toastOptions={{ style: { width: "400px", textAlign: "center" } }}
    />
  </StrictMode>
);
