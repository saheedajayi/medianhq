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

interface LiveKitCallControlsProps {
  /** Called when the user clicks "End call" — caller handles modal/routing */
  onLeave: () => void;
  /** Optional: whether recording was requested at lobby (UI only pill) */
  isRecording?: boolean;
  /** Called when user toggles recording pill */
  onToggleRecording?: () => void;
}

export function LiveKitCallControls({
  onLeave,
  isRecording = false,
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
    await room.disconnect();
    onLeave();
  }, [room, onLeave]);

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
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition ${
            isRecording
              ? "border border-[#FF5514]/40 bg-[#FF5514]/15 text-[#FF5514]"
              : "bg-[#252A34] text-[#98A2B3] hover:text-white"
          }`}
        >
          <span
            className={`size-2.5 rounded-full ${
              isRecording ? "animate-pulse bg-[#FF5514]" : "bg-[#98A2B3]"
            }`}
          />
          {isRecording ? "Recording" : "Record"}
        </button>
      )}

      {/* End Call Button */}
      <button
        type="button"
        onClick={() => void handleLeave()}
        aria-label="End call"
        className="flex size-12 items-center justify-center rounded-full bg-[#D92D20] text-white shadow-lg transition hover:bg-[#B42318] active:scale-95"
      >
        <PhoneOff className="size-5" />
      </button>
    </div>
  );
}
