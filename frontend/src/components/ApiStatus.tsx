import { useApiStatus } from "../features/apiStatus/ApiStatusContext";

function ApiStatus() {
  const { apiStatus, refreshApiStatus } = useApiStatus();

  const label =
    apiStatus === "checking"
      ? "Checking API..."
      : apiStatus === "online"
      ? "API online"
      : "Demo mode";

  return (
    <button
      type="button"
      className={`api-status api-status-${apiStatus}`}
      onClick={refreshApiStatus}
      title="Click to recheck backend API status"
    >
      <span className="api-status-dot" />
      {label}
    </button>
  );
}

export default ApiStatus;