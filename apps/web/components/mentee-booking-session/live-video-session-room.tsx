"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
} from "lucide-react";
import { Booking, RecordingOption } from "./types";

interface LiveVideoSessionRoomProps {
  booking: Booking;
  recordingOption: RecordingOption;
  initialMicOn?: boolean;
  initialCameraOn?: boolean;
  onEndCall: () => void;
}

export function LiveVideoSessionRoom({
  booking,
  recordingOption,
  initialMicOn = true,
  initialCameraOn = true,
  onEndCall,
}: LiveVideoSessionRoomProps) {
  const [isMicOn, setIsMicOn] = useState(initialMicOn);
  const [isCameraOn, setIsCameraOn] = useState(initialCameraOn);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(recordingOption === "record");
  const [secondsElapsed, setSecondsElapsed] = useState(12 * 60 + 34); // starts at 12:34 matching design screenshot
  const totalDurationSeconds = (booking.durationMinutes || 30) * 60;

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

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0E1015] text-white">
      {/* Top Navigation Bar */}
      <header className="flex h-18 shrink-0 items-center justify-between px-6 sm:px-10">
        {/* Median Brand */}
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#FF5514]">
            <span className="font-black text-white text-base">m</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">median</span>
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
          {/* Mentor Live Video Feed */}
          <div className="relative h-full w-full">
            <Image
              src="/sessions/mentor-stream.png"
              alt={`${booking.mentorName} Video Feed`}
              fill
              className="object-cover"
              priority
            />

            {/* Name Tag Overlay (Top Left) */}
            <div className="absolute left-6 top-6 z-10 rounded-lg bg-[#101828]/80 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-md">
              {booking.mentorName}
            </div>

            {/* Floating Picture-in-Picture Feed (Bottom Right) */}
            <div className="absolute bottom-6 right-6 z-20 aspect-[16/10] w-48 sm:w-60 overflow-hidden rounded-xl border border-white/20 bg-[#1D2939] shadow-2xl transition hover:scale-105">
              {isCameraOn ? (
                <div className="relative h-full w-full">
                  <Image
                    src="/sessions/mentee-stream.png"
                    alt="Self View"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 rounded-md bg-[#101828]/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                    You {!isMicOn && "(Muted)"}
                  </div>
                </div>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-center text-white p-2">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#344054]">
                    <VideoOff className="size-5 text-[#98A2B3]" />
                  </div>
                  <span className="mt-1 text-[11px] font-medium text-[#98A2B3]">Camera off</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Floating Control Dock */}
      <footer className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 sm:gap-4 rounded-full bg-[#1A1D24]/90 p-2 sm:p-2.5 backdrop-blur-md shadow-2xl ring-1 ring-white/10">
        {/* Mic Toggle */}
        <button
          type="button"
          aria-label={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
          onClick={() => setIsMicOn((v) => !v)}
          className={`flex size-12 items-center justify-center rounded-full transition ${
            isMicOn
              ? "bg-[#252A34] text-white hover:bg-[#343B48]"
              : "bg-[#F04438] text-white hover:bg-[#D92D20]"
          }`}
        >
          {isMicOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
        </button>

        {/* Camera Toggle */}
        <button
          type="button"
          aria-label={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
          onClick={() => setIsCameraOn((v) => !v)}
          className={`flex size-12 items-center justify-center rounded-full transition ${
            isCameraOn
              ? "bg-[#252A34] text-white hover:bg-[#343B48]"
              : "bg-[#F04438] text-white hover:bg-[#D92D20]"
          }`}
        >
          {isCameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          type="button"
          aria-label="Share screen"
          onClick={() => setIsScreenSharing((v) => !v)}
          className={`flex size-12 items-center justify-center rounded-full transition ${
            isScreenSharing
              ? "bg-[#FF5514] text-white hover:bg-[#E04406]"
              : "bg-[#252A34] text-white hover:bg-[#343B48]"
          }`}
        >
          <ScreenShare className="size-5" />
        </button>

        {/* Recording Pill Indicator */}
        <button
          type="button"
          onClick={() => setIsRecording((v) => !v)}
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

        {/* End Call / Leave Button */}
        <button
          type="button"
          onClick={onEndCall}
          aria-label="End call"
          className="flex size-12 items-center justify-center rounded-full bg-[#D92D20] text-white shadow-lg transition hover:bg-[#B42318] active:scale-95"
        >
          <PhoneOff className="size-5" />
        </button>
      </footer>
    </div>
  );
}
