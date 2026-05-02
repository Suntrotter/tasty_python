import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ApiStatusProvider } from "./features/apiStatus/ApiStatusContext";
import { ProgressProvider } from "./features/progress/ProgressContext";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ApiStatusProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </ApiStatusProvider>
    </BrowserRouter>
  </StrictMode>
);