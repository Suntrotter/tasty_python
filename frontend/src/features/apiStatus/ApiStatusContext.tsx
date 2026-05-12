import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchApiHealth } from "../../api/healthApi";

export type ApiStatusValue = "checking" | "online" | "offline";

interface ApiStatusContextValue {
  apiStatus: ApiStatusValue;
  isApiOnline: boolean;
  refreshApiStatus: () => Promise<void>;
}

const ApiStatusContext = createContext<ApiStatusContextValue | undefined>(
  undefined
);

interface ApiStatusProviderProps {
  children: ReactNode;
}

const shouldCheckApiHealth = import.meta.env.DEV;

export function ApiStatusProvider({ children }: ApiStatusProviderProps) {
  const [apiStatus, setApiStatus] = useState<ApiStatusValue>(
    shouldCheckApiHealth ? "checking" : "online"
  );

  async function refreshApiStatus() {
    if (!shouldCheckApiHealth) {
      setApiStatus("online");
      return;
    }

    try {
      await fetchApiHealth();
      setApiStatus("online");
    } catch {
      setApiStatus("offline");
    }
  }

  useEffect(() => {
    if (!shouldCheckApiHealth) {
      return;
    }

    refreshApiStatus();
  }, []);

  const value = {
    apiStatus,
    isApiOnline: apiStatus === "online",
    refreshApiStatus,
  };

  return (
    <ApiStatusContext.Provider value={value}>
      {children}
    </ApiStatusContext.Provider>
  );
}

export function useApiStatus() {
  const context = useContext(ApiStatusContext);

  if (!context) {
    throw new Error("useApiStatus must be used inside ApiStatusProvider");
  }

  return context;
}