"use client";

/**
 * LiveKitRoomProvider
 * -------------------
 * Reusable wrapper around @livekit/components-react's <LiveKitRoom>.
 * Place this around any component that needs LiveKit hooks.
 *
 * Usage:
 *   <LiveKitRoomProvider serverUrl={url} token={token} onDisconnected={onLeave}>
 *     <LiveVideoSessionRoom ... />
 *   </LiveKitRoomProvider>
 *
 * NOTE: audio/video props control whether local tracks are auto-published
 * on connect. Set them based on the user's lobby choices.
 */

import { LiveKitRoom } from "@livekit/components-react";
import type { ReactNode } from "react";

interface LiveKitRoomProviderProps {
  /** wss:// URL of the LiveKit server (from NEXT_PUBLIC_LIVEKIT_URL) */
  serverUrl: string;
  /** Short-lived JWT issued by /api/livekit/token */
  token: string;
  /** Called when the participant disconnects or is ejected */
  onDisconnected?: () => void;
  /** Auto-publish microphone track on connect (default: true) */
  audio?: boolean;
  /** Auto-publish camera track on connect (default: true) */
  video?: boolean;
  children: ReactNode;
}

export function LiveKitRoomProvider({
  serverUrl,
  token,
  onDisconnected,
  audio = true,
  video = true,
  children,
}: LiveKitRoomProviderProps) {
  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect={true}
      audio={audio}
      video={video}
      onDisconnected={onDisconnected}
    >
      {children}
    </LiveKitRoom>
  );
}
