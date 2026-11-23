"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { Clock } from "iconsax-react";
import {
  useLocalParticipant,
  useRemoteParticipants,
  useRoomContext,
} from "@livekit/components-react";
import { Booking } from "./types";
import type { MeetingEntry } from "./session-lobby";
import { LiveKitRoomProvider } from "@/components/ui/custom/livekit-room-provider";
import { LiveKitVideoTile } from "@/components/ui/custom/livekit-video-tile";
import { LiveKitCallControls } from "@/components/ui/custom/livekit-call-controls";
import { stopAllMediaTracks } from "./media-utils";
import { toast } from "sonner";
import {
  useBookingRecording,
  useSetRecordingConsent,
} from "@/services/bookings/queries/bookings.queries";

// --------------------------------------------------------------------------
// Inner room — must be rendered inside <LiveKitRoomProvider>
// --------------------------------------------------------------------------

/** The last stretch of a session, when both people are warned it is about to end */
const ENDING_SOON_SECONDS = 5 * 60;

interface RoomInnerProps {
  booking: Booking;
  entry: MeetingEntry;
  onEndCall: () => void;
}

function RoomInner({ booking, entry, onEndCall }: RoomInnerProps) {
  const { recordingOption, clockOffsetMs } = entry;
  const room = useRoomContext();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const { data: recording } = useBookingRecording(booking.id, { poll: true });
  const recordingConsentMutation = useSetRecordingConsent();
  // Recording only runs once both people have agreed and joined, so this follows the server
  const isRecording = recording?.isRecording ?? false;
  const isRecordingUnavailable = recording?.available === false;
  const myConsent = recording?.myConsent ?? recordingOption === "record";
  const otherConsent = recording?.otherConsent ?? null;
  const totalDurationSeconds = (booking.durationMinutes || 30) * 60;

  // The clock runs from the booked start on the API's time, so both people see the
  // same timer whenever they joined. Without a start time it falls back to joining.
  const [nowMs, setNowMs] = useState(() => Date.now() + clockOffsetMs);
  const [joinedAtMs] = useState(() => Date.now() + clockOffsetMs);
  const startsAtMs = booking.startsAt ? new Date(booking.startsAt).getTime() : joinedAtMs;
  const secondsToStart = Math.max(0, Math.ceil((startsAtMs - nowMs) / 1000));
  const secondsElapsed = Math.min(
    totalDurationSeconds,
    Math.max(0, Math.floor((nowMs - startsAtMs) / 1000))
  );
  const secondsLeft = totalDurationSeconds - secondsElapsed;
  const hasStarted = secondsToStart === 0;
  const isEndingSoon = hasStarted && secondsLeft <= ENDING_SOON_SECONDS && secondsLeft > 0;
  const isOver = hasStarted && secondsLeft <= 0;

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now() + clockOffsetMs), 1000);
    return () => clearInterval(timer);
  }, [clockOffsetMs]);

  // One warning as the session enters its last five minutes
  const minutesLeftRef = useRef(0);
  minutesLeftRef.current = Math.max(1, Math.ceil(secondsLeft / 60));
  useEffect(() => {
    if (!isEndingSoon) return;
    const minutes = minutesLeftRef.current;
    toast.warning(`${minutes} ${minutes === 1 ? "minute" : "minutes"} left`, {
      description: "The call ends automatically at the booked end time.",
      duration: 10_000,
    });
  }, [isEndingSoon]);

  // The call ends for both people at the booked end; the API also closes the room
  const onEndCallRef = useRef(onEndCall);
  onEndCallRef.current = onEndCall;
  useEffect(() => {
    if (!isOver) return;
    toast("Session time is up", { description: "The call has ended." });
    void room
      .disconnect(true)
      .catch(() => {})
      .finally(() => {
        stopAllMediaTracks();
        onEndCallRef.current();
      });
  }, [isOver, room]);

  // If the other person asks to record after we said no, say so once
  useEffect(() => {
    if (otherConsent !== true || myConsent || isRecording || isRecordingUnavailable) return;
    toast.info(`${booking.participantName} would like to record this session`, {
      description: "Click Record if you agree.",
    });
    // Only when their answer changes, not when ours does
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherConsent]);

  // Ensure all media tracks and camera hardware are released on unmount
  useEffect(() => {
    return () => {
      try {
        localParticipant.setCameraEnabled(false).catch(() => {});
        localParticipant.setMicrophoneEnabled(false).catch(() => {});
        localParticipant.trackPublications.forEach((pub) => {
          try {
            pub.track?.stop();
            if (pub.track && "mediaStreamTrack" in pub.track) {
              (pub.track as any).mediaStreamTrack?.stop();
            }
          } catch {}
        });
      } catch {}
      stopAllMediaTracks();
    };
  }, [localParticipant]);

  const handleToggleRecording = () => {
    if (recordingConsentMutation.isPending) return;
    const consent = !myConsent;
    recordingConsentMutation.mutate(
      { bookingId: booking.id, consent },
      {
        onSuccess: (status) => {
          if (consent && !status.isRecording && status.otherConsent !== true) {
            toast.info("Recording starts once the other person agrees too.");
          }
        },
        onError: () => toast.error("We couldn't update recording. Please try again."),
      }
    );
  };

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
        <div className="flex items-center">
          <Image
            src="/median-logo-light.svg"
            alt="Median Logo"
            width={115}
            height={28}
            className="h-7 w-auto object-contain"
            priority
          />
        </div>

        {/* Center / Right: Session Title & Timer */}
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-semibold text-[#D0D5DD] sm:inline-block">
            {booking.title} Session with {booking.participantName}
          </span>

          <div
            className={`flex items-center rounded-full px-3.5 py-1.5 text-xs font-mono font-medium ring-1 ${
              isEndingSoon
                ? "bg-[#FF5514]/15 text-[#FF5514] ring-[#FF5514]/40"
                : "bg-[#1D2939] text-[#F9FAFB] ring-white/10"
            }`}
          >
            {hasStarted
              ? `${formatTime(secondsElapsed)} / ${formatTime(totalDurationSeconds)}`
              : `Starts in ${formatTime(secondsToStart)}`}
          </div>
        </div>
      </header>

      {/* Main Video Presentation Stage */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-24 sm:px-8">
        <div className="relative aspect-[16/10] max-h-[82vh] w-full max-w-[1320px] overflow-hidden rounded-[24px] bg-[#1A1D24]">
          {/* Featured remote participant (mentor) — full stage */}
          {featuredRemote ? (
            <>
              <LiveKitVideoTile
                participant={featuredRemote}
                label={booking.participantName}
                className="h-full w-full"
              />
              {/* Name Tag Overlay */}
              <div className="absolute left-6 top-6 z-10 rounded-lg bg-[#101828]/80 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-md">
                {booking.participantName}
              </div>
            </>
          ) : (
            // Waiting for mentor to join
            <div className="flex h-full w-full flex-col items-center justify-center gap-3">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#1D2939]">
                <Clock size="28" variant="Outline" color="#98A2B3" />
              </div>
              <p className="text-sm font-medium text-[#98A2B3]">
                Waiting for {booking.participantName} to join…
              </p>
            </div>
          )}

          {/* Floating Picture-in-Picture — self view */}
          <div className="absolute bottom-6 right-6 z-20 aspect-[16/10] w-48 sm:w-60 overflow-hidden rounded-xl border border-white/20 bg-[#1D2939] transition hover:scale-105">
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
      <footer className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#1A1D24]/90 p-2 sm:p-2.5 backdrop-blur-md ring-1 ring-white/10">
        <LiveKitCallControls
          onLeave={onEndCall}
          recordingState={
            isRecording
              ? "recording"
              : isRecordingUnavailable
                ? "unavailable"
                : myConsent
                  ? "waiting"
                  : "off"
          }
          onToggleRecording={handleToggleRecording}
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
  /** The lobby's choices plus the LiveKit pass for this call */
  entry: MeetingEntry;
  onEndCall: () => void;
}

export function LiveVideoSessionRoom({ booking, entry, onEndCall }: LiveVideoSessionRoomProps) {
  const { micDeviceId, cameraDeviceId, speakerDeviceId } = entry;
  // The devices picked in the lobby, also used when a muted mic or camera is turned on later
  const roomOptions = useMemo(
    () => ({
      ...(micDeviceId ? { audioCaptureDefaults: { deviceId: micDeviceId } } : {}),
      ...(cameraDeviceId ? { videoCaptureDefaults: { deviceId: cameraDeviceId } } : {}),
      ...(speakerDeviceId ? { audioOutput: { deviceId: speakerDeviceId } } : {}),
    }),
    [micDeviceId, cameraDeviceId, speakerDeviceId]
  );

  return (
    <LiveKitRoomProvider
      serverUrl={entry.livekitServerUrl}
      token={entry.livekitToken}
      audio={entry.micOn}
      video={entry.cameraOn}
      options={roomOptions}
      onDisconnected={onEndCall}
    >
      <RoomInner booking={booking} entry={entry} onEndCall={onEndCall} />
    </LiveKitRoomProvider>
  );
}
