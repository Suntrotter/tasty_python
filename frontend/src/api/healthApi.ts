import { API_BASE_URL } from "./apiConfig";

interface HealthResponse {
  status: string;
  service: string;
}

export async function fetchApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error("API health check failed");
  }

  return response.json() as Promise<HealthResponse>;
}