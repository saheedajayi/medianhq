import { cookies } from "next/headers";

export type SessionHint = {
  role: "MENTEE" | "MENTOR" | "ADMIN" | null;
  isApprovedMentor: boolean;
};

/**
 * Reads the role from the session cookie so the first paint shows the right layout.
 * The signature isn't checked here, so this only decides what to draw while loading;
 * the API still authorizes every request and the fetched user takes over once it arrives.
 */
export async function getSessionHint(): Promise<SessionHint> {
  const token = (await cookies()).get("median_session")?.value;
  try {
    const payload = JSON.parse(
      Buffer.from(token?.split(".")[0] ?? "", "base64url").toString("utf8"),
    );
    return {
      role: payload.role ?? null,
      isApprovedMentor: payload.role === "MENTOR" && payload.accountStage === "READY",
    };
  } catch {
    return { role: null, isApprovedMentor: false };
  }
}
