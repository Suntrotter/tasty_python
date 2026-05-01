import type { Track } from "../types/curriculum";

interface BackendTrack {
  slug: string;
  title: string;
  description: string;
  status: Track["status"];
  lesson_count: number;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

function mapBackendTrack(track: BackendTrack): Track {
  return {
    slug: track.slug,
    title: track.title,
    description: track.description,
    status: track.status,
    lessonCount: track.lesson_count,
  };
}

export async function fetchTracks(): Promise<Track[]> {
  const response = await fetch(`${API_BASE_URL}/api/tracks`);

  if (!response.ok) {
    throw new Error("Failed to fetch tracks");
  }

  const data = (await response.json()) as BackendTrack[];

  return data.map(mapBackendTrack);
}