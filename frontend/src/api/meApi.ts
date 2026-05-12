import { API_BASE_URL } from "./apiConfig";

export interface BackendUserProfile {
  id: number;
  firebase_uid: string;
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
}

export async function fetchCurrentBackendUser(
  idToken: string
): Promise<BackendUserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/me`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch current backend user");
  }

  return response.json() as Promise<BackendUserProfile>;
}