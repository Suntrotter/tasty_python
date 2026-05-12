import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ApiStatusProvider } from "./features/apiStatus/ApiStatusContext";
import { ProgressProvider } from "./features/progress/ProgressContext";
import "./styles/index.css";
import { AuthProvider } from "./features/auth/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
      <ApiStatusProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
        </ApiStatusProvider>
        </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);