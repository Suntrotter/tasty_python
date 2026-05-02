import type { Track } from "../types/curriculum";
import { API_BASE_URL } from "./apiConfig";

interface BackendTrack {
  slug: string;
  title: string;
  description: string;
  status: Track["status"];
  lesson_count: number;
}

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

export async function fetchTrackBySlug(slug: string): Promise<Track> {
  const response = await fetch(`${API_BASE_URL}/api/tracks/${slug}`);

  if (!response.ok) {
    throw new Error("Failed to fetch track");
  }

  const data = (await response.json()) as BackendTrack;

  return mapBackendTrack(data);
}