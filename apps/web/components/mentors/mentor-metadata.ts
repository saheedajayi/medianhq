import type { Metadata } from "next";
import { API_URL } from "@/services/api-client";

/** Page title from the real mentor; falls back to a generic title if the API can't be reached */
export async function getMentorMetadata(id: string): Promise<Metadata> {
  try {
    const response = await fetch(`${API_URL}/mentors/${encodeURIComponent(id)}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return { title: "Mentor Profile" };
    const payload = (await response.json()) as {
      data?: { name?: string; role?: string; company?: string; bio?: string };
    };
    const mentor = payload.data;
    if (!mentor?.name) return { title: "Mentor Profile" };
    return {
      title: `${mentor.name} - ${mentor.role} @ ${mentor.company}`,
      description: mentor.bio || undefined,
    };
  } catch {
    return { title: "Mentor Profile" };
  }
}
