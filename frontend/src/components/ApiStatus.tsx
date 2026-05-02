import { useEffect, useState } from "react";
import { fetchApiHealth } from "../api/healthApi";

type ApiStatusValue = "checking" | "online" | "offline";

function ApiStatus() {
  const [status, setStatus] = useState<ApiStatusValue>("checking");

  useEffect(() => {
    async function checkApiStatus() {
      try {
        await fetchApiHealth();
        setStatus("online");
      } catch {
        setStatus("offline");
      }
    }

    checkApiStatus();
  }, []);

  const label =
    status === "checking"
      ? "Checking API..."
      : status === "online"
      ? "API online"
      : "Demo mode";

  return (
    <span className={`api-status api-status-${status}`}>
      <span className="api-status-dot" />
      {label}
    </span>
  );
}

export default ApiStatus;