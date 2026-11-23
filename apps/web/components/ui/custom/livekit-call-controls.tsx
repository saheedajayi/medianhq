"use client";

/**
 * LiveKitCallControls
 * -------------------
 * Reusable call control bar that reads live LiveKit state from hooks and
 * delegates media mutations to the local participant / room object.
 *
 * Usage:
 *   <LiveKitCallControls onLeave={handleEndCall} />
 *
 * Must be rendered inside a <LiveKitRoomProvider>.
 */

import { useCallback, useState } from "react";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff } from "lucide-react";
import { stopAllMediaTracks } from "@/components/bookings/media-utils";

/**
 * off: not asked for · waiting: you agreed, the other person hasn't yet ·
 * recording: live · unavailable: recording isn't set up, so it can't be asked for
 */
export type RecordingState = "off" | "waiting" | "recording" | "unavailable";

const RECORDING_LABELS: Record<RecordingState, string> = {
  off: "Record",
  waiting: "Waiting to record",
  recording: "Recording",
  unavailable: "Recording unavailable",
};

interface LiveKitCallControlsProps {
  /** Called when the user clicks "End call" — caller handles modal/routing */
  onLeave: () => void;
  /** Where recording stands for this participant */
  recordingState?: RecordingState;
  /** Called when user toggles recording pill */
  onToggleRecording?: () => void;
}

export function LiveKitCallControls({
  onLeave,
  recordingState = "off",
  onToggleRecording,
}: LiveKitCallControlsProps) {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } =
    useLocalParticipant();
  const room = useRoomContext();
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const toggleMic = useCallback(() => {
    void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  }, [localParticipant, isMicrophoneEnabled]);

  const toggleCamera = useCallback(() => {
    void localParticipant.setCameraEnabled(!isCameraEnabled);
  }, [localParticipant, isCameraEnabled]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      await localParticipant.setScreenShareEnabled(false);
      setIsScreenSharing(false);
    } else {
      await localParticipant.setScreenShareEnabled(true);
      setIsScreenSharing(true);
    }
  }, [localParticipant, isScreenSharing]);

  const handleLeave = useCallback(async () => {
    try {
      // 1. Explicitly turn off devices in LiveKit so hardware release is triggered
      await localParticipant.setCameraEnabled(false).catch(() => {});
      await localParticipant.setMicrophoneEnabled(false).catch(() => {});
      await localParticipant.setScreenShareEnabled(false).catch(() => {});

      // 2. Stop all published local tracks directly
      localParticipant.trackPublications.forEach((pub) => {
        try {
          pub.track?.stop();
          if (pub.track && "mediaStreamTrack" in pub.track) {
            (pub.track as any).mediaStreamTrack?.stop();
          }
        } catch {}
      });

      // 3. Disconnect from room with stopTracks = true
      await room.disconnect(true);
    } catch (err) {
      console.warn("Error releasing media tracks on leave:", err);
    } finally {
      // 4. Force browser DOM cleanup to immediately shut down webcam light
      stopAllMediaTracks();
      onLeave();
    }
  }, [localParticipant, room, onLeave]);

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* Mic Toggle */}
      <button
        type="button"
        aria-label={isMicrophoneEnabled ? "Mute Microphone" : "Unmute Microphone"}
        onClick={toggleMic}
        className={`flex size-12 items-center justify-center rounded-full transition ${
          isMicrophoneEnabled
            ? "bg-[#252A34] text-white hover:bg-[#343B48]"
            : "bg-[#F04438] text-white hover:bg-[#D92D20]"
        }`}
      >
        {isMicrophoneEnabled ? (
          <Mic className="size-5" />
        ) : (
          <MicOff className="size-5" />
        )}
      </button>

      {/* Camera Toggle */}
      <button
        type="button"
        aria-label={isCameraEnabled ? "Turn Camera Off" : "Turn Camera On"}
        onClick={toggleCamera}
        className={`flex size-12 items-center justify-center rounded-full transition ${
          isCameraEnabled
            ? "bg-[#252A34] text-white hover:bg-[#343B48]"
            : "bg-[#F04438] text-white hover:bg-[#D92D20]"
        }`}
      >
        {isCameraEnabled ? (
          <Video className="size-5" />
        ) : (
          <VideoOff className="size-5" />
        )}
      </button>

      {/* Screen Share Toggle */}
      <button
        type="button"
        aria-label="Share screen"
        onClick={() => void toggleScreenShare()}
        className={`flex size-12 items-center justify-center rounded-full transition ${
          isScreenSharing
            ? "bg-[#FF5514] text-white hover:bg-[#E04406]"
            : "bg-[#252A34] text-white hover:bg-[#343B48]"
        }`}
      >
        <ScreenShare className="size-5" />
      </button>

      {/* Recording Pill */}
      {onToggleRecording && (
        <button
          type="button"
          onClick={onToggleRecording}
          disabled={recordingState === "unavailable"}
          title={
            recordingState === "waiting"
              ? "Recording starts once the other person agrees. Click to cancel."
              : undefined
          }
          className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-semibold transition ${
            recordingState === "recording"
              ? "border border-[#FF5514]/40 bg-[#FF5514]/15 text-[#FF5514]"
              : recordingState === "waiting"
                ? "border border-white/15 bg-[#252A34] text-white"
                : "bg-[#252A34] text-[#98A2B3] enabled:hover:text-white disabled:opacity-60"
          }`}
        >
          <span
            className={`size-2.5 rounded-full ${
              recordingState === "recording"
                ? "animate-pulse bg-[#FF5514]"
                : recordingState === "waiting"
                  ? "animate-pulse bg-[#98A2B3]"
                  : "bg-[#98A2B3]"
            }`}
          />
          {RECORDING_LABELS[recordingState]}
        </button>
      )}

      {/* End Call Button */}
      <button
        type="button"
        onClick={() => void handleLeave()}
        aria-label="End call"
        className="flex size-12 items-center justify-center rounded-full bg-[#D92D20] text-white transition hover:bg-[#B42318] active:scale-95"
      >
        <PhoneOff className="size-5" />
      </button>
    </div>
  );
}
