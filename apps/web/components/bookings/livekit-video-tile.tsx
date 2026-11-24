"use client";

/**
 * LiveKitVideoTile
 * ----------------
 * Renders a single participant's video (and audio) tile using
 * livekit-client track APIs. Falls back to a placeholder when
 * the camera is off or no video track exists.
 *
 * Usage:
 *   <LiveKitVideoTile participant={localParticipant} mirror label="You" />
 *   <LiveKitVideoTile participant={remoteParticipants[0]} label="Mentor" />
 *
 * Must be rendered inside a <LiveKitRoomProvider> for live sessions.
 * For lobby preview, use the raw <video> element directly via createLocalTracks.
 */

import { useEffect, useRef } from "react";
import { Track } from "livekit-client";
import type { Participant } from "livekit-client";
import { VideoOff } from "lucide-react";

interface LiveKitVideoTileProps {
  /** LiveKit Participant object (LocalParticipant or RemoteParticipant) */
  participant: Participant | null;
  /** Flip horizontally for self-view */
  mirror?: boolean;
  /** Optional name badge */
  label?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Show a small muted badge overlay */
  isMuted?: boolean;
  /** Placeholder fallback variant */
  placeholderVariant?: "dark" | "light";
}

export function LiveKitVideoTile({
  participant,
  mirror = false,
  label,
  className = "",
  isMuted = false,
  placeholderVariant = "dark",
}: LiveKitVideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const cameraPub = participant?.getTrackPublication(Track.Source.Camera);
  const micPub = participant?.getTrackPublication(Track.Source.Microphone);

  const hasVideo = !!(cameraPub?.track && !cameraPub.isMuted);
  const hasAudio = !!(micPub?.track && !micPub.isMuted);

  // Attach/detach video track
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const mediaTrack = cameraPub?.track?.mediaStreamTrack;
    if (hasVideo && mediaTrack) {
      el.srcObject = new MediaStream([mediaTrack]);
    } else {
      el.srcObject = null;
    }
  }, [hasVideo, cameraPub?.track]);

  // Attach/detach audio track (skip for self-view to avoid echo)
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const mediaTrack = micPub?.track?.mediaStreamTrack;
    if (!mirror && hasAudio && mediaTrack) {
      el.srcObject = new MediaStream([mediaTrack]);
    } else {
      el.srcObject = null;
    }
  }, [mirror, hasAudio, micPub?.track]);

  const placeholderBg =
    placeholderVariant === "dark" ? "bg-[#1D2939]" : "bg-[#F2F4F7]";
  const placeholderIconColor =
    placeholderVariant === "dark" ? "text-[#98A2B3]" : "text-[#667085]";

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {/* Hidden audio element for remote participant */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} autoPlay playsInline className="hidden" />

      {hasVideo ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={mirror} // self-view must be muted to avoid echo
          className={`h-full w-full object-cover ${mirror ? "-scale-x-100" : ""}`}
        />
      ) : (
        <div
          className={`flex h-full w-full flex-col items-center justify-center ${placeholderBg}`}
        >
          <div
            className={`flex size-12 items-center justify-center rounded-full ${
              placeholderVariant === "dark" ? "bg-[#101828]" : "bg-[#EAECF0]"
            }`}
          >
            <VideoOff className={`size-6 ${placeholderIconColor}`} />
          </div>
          {label && (
            <p
              className={`mt-2 text-xs font-medium ${
                placeholderVariant === "dark"
                  ? "text-[#98A2B3]"
                  : "text-[#667085]"
              }`}
            >
              {label}&apos;s camera is off
            </p>
          )}
        </div>
      )}

      {/* Name / Muted badge */}
      {(label || isMuted) && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-[#101828]/75 px-2.5 py-1 backdrop-blur-sm">
          {label && (
            <span className="text-[11px] font-medium text-white">
              {label}
              {isMuted && " (Muted)"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
