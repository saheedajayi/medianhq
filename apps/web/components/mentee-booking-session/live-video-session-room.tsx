"use client";

import { useState, useEffect } from "react";
import { useLocalParticipant, useRemoteParticipants } from "@livekit/components-react";
import { Booking, RecordingOption } from "./types";
import { LiveKitRoomProvider } from "@/components/ui/custom/livekit-room-provider";
import { LiveKitVideoTile } from "@/components/ui/custom/livekit-video-tile";
import { LiveKitCallControls } from "@/components/ui/custom/livekit-call-controls";

// --------------------------------------------------------------------------
// Inner room — must be rendered inside <LiveKitRoomProvider>
// --------------------------------------------------------------------------

interface RoomInnerProps {
  booking: Booking;
  recordingOption: RecordingOption;
  onEndCall: () => void;
}

function RoomInner({ booking, recordingOption, onEndCall }: RoomInnerProps) {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const [isRecording, setIsRecording] = useState(recordingOption === "record");
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const totalDurationSeconds = (booking.durationMinutes || 30) * 60;

  // Tick the session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // First remote participant is the featured mentor
  const featuredRemote = remoteParticipants[0] ?? null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0E1015] text-white">
      {/* Top Navigation Bar */}
      <header className="flex h-18 shrink-0 items-center justify-between px-6 sm:px-10">
        {/* Median Brand */}
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#FF5514]">
            <span className="font-black text-white text-base">m</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            median
          </span>
        </div>

        {/* Center / Right: Session Title & Timer */}
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-semibold text-[#D0D5DD] sm:inline-block">
            {booking.title} Session with {booking.mentorName}
          </span>

          <div className="flex items-center rounded-full bg-[#1D2939] px-3.5 py-1.5 text-xs font-mono font-medium text-[#F9FAFB] ring-1 ring-white/10">
            {formatTime(secondsElapsed)} / {formatTime(totalDurationSeconds)}
          </div>
        </div>
      </header>

      {/* Main Video Presentation Stage */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-24 sm:px-8">
        <div className="relative aspect-[16/10] max-h-[82vh] w-full max-w-[1320px] overflow-hidden rounded-[24px] bg-[#1A1D24] shadow-2xl">
          {/* Featured remote participant (mentor) — full stage */}
          {featuredRemote ? (
            <>
              <LiveKitVideoTile
                participant={featuredRemote}
                label={booking.mentorName}
                className="h-full w-full"
              />
              {/* Name Tag Overlay */}
              <div className="absolute left-6 top-6 z-10 rounded-lg bg-[#101828]/80 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-md">
                {booking.mentorName}
              </div>
            </>
          ) : (
            // Waiting for mentor to join
            <div className="flex h-full w-full flex-col items-center justify-center gap-3">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#1D2939]">
                <span className="text-2xl">⏳</span>
              </div>
              <p className="text-sm font-medium text-[#98A2B3]">
                Waiting for {booking.mentorName} to join…
              </p>
            </div>
          )}

          {/* Floating Picture-in-Picture — self view */}
          <div className="absolute bottom-6 right-6 z-20 aspect-[16/10] w-48 sm:w-60 overflow-hidden rounded-xl border border-white/20 bg-[#1D2939] shadow-2xl transition hover:scale-105">
            <LiveKitVideoTile
              participant={localParticipant}
              mirror
              label="You"
              isMuted={!isMicrophoneEnabled}
              className="h-full w-full"
            />
          </div>
        </div>
      </main>

      {/* Bottom Floating Control Dock */}
      <footer className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#1A1D24]/90 p-2 sm:p-2.5 backdrop-blur-md shadow-2xl ring-1 ring-white/10">
        <LiveKitCallControls
          onLeave={onEndCall}
          isRecording={isRecording}
          onToggleRecording={() => setIsRecording((v) => !v)}
        />
      </footer>
    </div>
  );
}

// --------------------------------------------------------------------------
// Public export — wraps with LiveKitRoomProvider
// --------------------------------------------------------------------------

interface LiveVideoSessionRoomProps {
  booking: Booking;
  recordingOption: RecordingOption;
  onEndCall: () => void;
  /** LiveKit JWT issued by /api/livekit/token */
  livekitToken: string;
  /** wss:// URL of the LiveKit server (NEXT_PUBLIC_LIVEKIT_URL) */
  livekitServerUrl: string;
}

export function LiveVideoSessionRoom({
  booking,
  recordingOption,
  onEndCall,
  livekitToken,
  livekitServerUrl,
}: LiveVideoSessionRoomProps) {
  return (
    <LiveKitRoomProvider
      serverUrl={livekitServerUrl}
      token={livekitToken}
      onDisconnected={onEndCall}
    >
      <RoomInner
        booking={booking}
        recordingOption={recordingOption}
        onEndCall={onEndCall}
      />
    </LiveKitRoomProvider>
  );
}
