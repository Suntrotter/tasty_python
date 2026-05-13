import { API_BASE_URL } from "./apiConfig";

export interface TrackSummaryCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  totalLessonsCount: number;
  readyLessonsCount: number;
  completedLessonsCount: number;
  progressPercent: number;
  ctaLabel: string;
  ctaTo: string;
}

export interface TracksSummary {
  completedTracks: TrackSummaryCard[];
  currentTrack: TrackSummaryCard | null;
  upNextTracks: TrackSummaryCard[];
  moreTracks: TrackSummaryCard[];
}

export async function fetchTracksSummary(
  idToken: string
): Promise<TracksSummary> {
  const response = await fetch(
    `${API_BASE_URL}/api/progress/me/tracks-summary`,
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tracks summary");
  }

  return response.json() as Promise<TracksSummary>;
}