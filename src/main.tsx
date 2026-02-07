import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/globals.css";
import { initializeNotifications } from "./utils/notifications";

// Initialize notifications when app loads
initializeNotifications().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
  