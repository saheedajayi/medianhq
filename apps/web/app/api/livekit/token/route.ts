import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY ?? "";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET ?? "";
const LIVEKIT_SERVER_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";

interface TokenRequestBody {
  bookingId: string;
  participantName?: string;
  enableRecording?: boolean;
}

export async function POST(req: NextRequest) {
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_SERVER_URL) {
    return NextResponse.json(
      { error: "LiveKit credentials are not configured on the server." },
      { status: 500 }
    );
  }

  const body = (await req.json()) as TokenRequestBody;
  const { bookingId, participantName = "Participant" } = body;

  // Room name is deterministic by bookingId so re-joins work
  const roomName = `median-session-${bookingId}`;

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: participantName,
    // Token is valid for the session duration + a generous buffer
    ttl: "3h",
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  // livekit-server-sdk v2 returns a Promise; v1 is sync — await covers both
  const token = await at.toJwt();

  return NextResponse.json({
    token,
    roomName,
    serverUrl: LIVEKIT_SERVER_URL,
  });
}
