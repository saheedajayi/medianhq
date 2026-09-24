"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createLocalTracks, Track } from "livekit-client";
import type { LocalVideoTrack, LocalAudioTrack } from "livekit-client";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Clock,
  X,
  Volume2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Booking, RecordingOption } from "./types";
import { stopAllMediaTracks } from "./media-utils";

interface SessionLobbyProps {
  booking: Booking;
  onBack?: () => void;
  onEnterMeeting: (
    recordingOption: RecordingOption,
    initialMicOn: boolean,
    initialCameraOn: boolean,
    livekitToken: string,
    livekitServerUrl: string
  ) => void;
}

export function SessionLobby({
  booking,
  onBack: _onBack,
  onEnterMeeting,
}: SessionLobbyProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordingChoice, setRecordingChoice] =
    useState<RecordingOption>("do_not_record");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Acquire local camera + mic on mount for preview — no room joined yet
  // --------------------------------------------------------------------------
  useEffect(() => {
    let vid: LocalVideoTrack | null = null;
    let aud: LocalAudioTrack | null = null;

    createLocalTracks({ audio: true, video: true })
      .then((tracks) => {
        for (const track of tracks) {
          if (track.kind === Track.Kind.Video) {
            vid = track as LocalVideoTrack;
            setVideoTrack(vid);
            if (videoRef.current) vid.attach(videoRef.current);
          } else if (track.kind === Track.Kind.Audio) {
            aud = track as LocalAudioTrack;
            setAudioTrack(aud);
          }
        }
      })
      .catch(() => {
        // Camera / mic unavailable — the placeholder will render instead
      });

    return () => {
      vid?.stop();
      aud?.stop();
      if (vid && "mediaStreamTrack" in vid) {
        try { (vid as any).mediaStreamTrack?.stop(); } catch {}
      }
      if (aud && "mediaStreamTrack" in aud) {
        try { (aud as any).mediaStreamTrack?.stop(); } catch {}
      }
      stopAllMediaTracks();
    };
  }, []);

  // --------------------------------------------------------------------------
  // Mic & camera toggles (mute/unmute without stopping the track)
  // --------------------------------------------------------------------------
  const toggleMic = useCallback(() => {
    if (!audioTrack) return;
    if (isMicOn) {
      void audioTrack.mute();
      setIsMicOn(false);
    } else {
      void audioTrack.unmute();
      setIsMicOn(true);
    }
  }, [audioTrack, isMicOn]);

  const toggleCamera = useCallback(() => {
    if (!videoTrack) return;
    if (isCameraOn) {
      void videoTrack.mute();
      setIsCameraOn(false);
    } else {
      void videoTrack.unmute();
      setIsCameraOn(true);
    }
  }, [videoTrack, isCameraOn]);

  // --------------------------------------------------------------------------
  // Step 1: open recording consent modal
  // --------------------------------------------------------------------------
  const handleStartJoin = () => setShowRecordingModal(true);

  // --------------------------------------------------------------------------
  // Step 2: get LiveKit token then hand off to the live room
  // --------------------------------------------------------------------------
  const handleConfirmRecording = async () => {
    setIsCreatingRoom(true);
    setRoomError(null);
    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          participantName: "Mentee",
          enableRecording: recordingChoice === "record",
        }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to get session token");
      }

      const { token, serverUrl } = (await res.json()) as {
        token: string;
        roomName: string;
        serverUrl: string;
      };

      // Stop preview tracks before the real room publishes its own
      videoTrack?.stop();
      audioTrack?.stop();
      if (videoTrack && "mediaStreamTrack" in videoTrack) {
        try { (videoTrack as any).mediaStreamTrack?.stop(); } catch {}
      }
      if (audioTrack && "mediaStreamTrack" in audioTrack) {
        try { (audioTrack as any).mediaStreamTrack?.stop(); } catch {}
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setShowRecordingModal(false);
      onEnterMeeting(recordingChoice, isMicOn, isCameraOn, token, serverUrl);
    } catch (err) {
      setRoomError(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setIsCreatingRoom(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col pb-12 sm:pb-16">
      {/* Header Row */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#101828]">
            Session lobby
          </h1>
          <p className="mt-1 text-sm text-[#475467]">
            Check your camera and microphone before joining.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-[#FFEEE8] px-3.5 py-1 text-xs font-semibold text-[#FF5514] w-fit">
          <span className="size-2 rounded-full bg-[#FF5514]" />
          <span>Session ready to join</span>
        </div>
      </div>

      {/* Main Video Stage — local preview via createLocalTracks */}
      <div className="relative mx-auto aspect-[16/9] max-h-[580px] w-full overflow-hidden rounded-xl bg-[#1D2939]">
        {isCameraOn ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover -scale-x-100"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#1D2939]">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#101828]">
              <VideoOff className="size-6 text-[#98A2B3]" />
            </div>
            <p className="mt-2 text-xs font-medium text-[#98A2B3]">
              Camera is off
            </p>
          </div>
        )}

        {/* Muted overlay badge */}
        {!isMicOn && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-[#101828]/75 px-2.5 py-1 backdrop-blur-sm">
            <MicOff className="size-3 text-white" />
            <span className="text-[11px] font-medium text-white">Muted</span>
          </div>
        )}
      </div>

      {/* Media Controls Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Mic Toggle */}
          <button
            type="button"
            onClick={toggleMic}
            className={`h-[43px] inline-flex items-center gap-2 rounded-full px-5 text-xs font-semibold transition cursor-pointer ${
              isMicOn
                ? "border border-[#FFCAB6] bg-[#FDF9F6] text-[#E84D12] hover:bg-[#FEE4E2]/40"
                : "border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
            }`}
          >
            {isMicOn ? (
              <Mic className="size-4 text-[#FF5514]" />
            ) : (
              <MicOff className="size-4 text-[#667085]" />
            )}
            <span>{isMicOn ? "Mic on" : "Mic off"}</span>
          </button>

          {/* Camera Toggle */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`h-[43px] inline-flex items-center gap-2 rounded-full px-5 text-xs font-semibold transition cursor-pointer ${
              isCameraOn
                ? "border border-[#FFCAB6] bg-[#FDF9F6] text-[#E84D12] hover:bg-[#FEE4E2]/40"
                : "border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB]"
            }`}
          >
            {isCameraOn ? (
              <Video className="size-4 text-[#FF5514]" />
            ) : (
              <VideoOff className="size-4 text-[#667085]" />
            )}
            <span>{isCameraOn ? "Camera on" : "Camera off"}</span>
          </button>
        </div>

        {/* Speaker / Device Selector */}
        <div className="relative">
          <button
            type="button"
            className="h-[43px] rounded-lg border border-[#D0D5DD] bg-white px-4 text-xs font-medium text-[#344054] inline-flex items-center gap-2.5 hover:bg-[#F9FAFB] transition cursor-pointer"
          >
            <Volume2 className="size-4 text-[#667085]" />
            <span>Default Speakers</span>
            <ChevronDown className="size-3.5 text-[#667085]" />
          </button>
        </div>
      </div>

      {/* Session Details & Join CTA */}
      <div className="mt-8 mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#101828]">
            Session with {booking.mentorName}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#475467]">
            {booking.title}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#FF5514]">
            <Clock className="size-4 text-[#FF5514]" />
            <span>{booking.durationMinutes} Mins Duration</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartJoin}
          className="h-[43px] rounded-full bg-[#FF5514] px-6 text-xs font-semibold text-white shadow-xs transition hover:bg-[#E04406] active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer w-fit"
        >
          <span>Join session</span>
          <ChevronDown className="size-3.5 text-white" />
        </button>
      </div>

      {/* Recording Consent Modal */}
      {showRecordingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-[24px] bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowRecordingModal(false)}
              className="absolute right-6 top-6 rounded-full p-1 text-[#667085] hover:bg-[#F2F4F7] hover:text-[#101828]"
            >
              <X className="size-5" />
            </button>

            <h3 className="text-2xl font-bold tracking-tight text-[#55241B]">
              Session Recording
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#667085]">
              This session can be recorded for your reference. Both parties must
              consent to recording. The recording is encrypted and stored safely.
            </p>

            {/* Options */}
            <div className="mt-6">
              <span className="text-[11px] font-bold tracking-wider text-[#667085] uppercase">
                CHOOSE AN OPTION
              </span>

              <div className="mt-3 space-y-3">
                {/* Do not record */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                    recordingChoice === "do_not_record"
                      ? "border-[#FF5514] bg-[#FDF9F6]/60 ring-1 ring-[#FF5514]"
                      : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
                  }`}
                >
                  <input
                    type="radio"
                    name="recordingChoice"
                    value="do_not_record"
                    checked={recordingChoice === "do_not_record"}
                    onChange={() => setRecordingChoice("do_not_record")}
                    className="mt-1 size-4 accent-[#FF5514]"
                  />
                  <div>
                    <strong className="block text-sm font-semibold text-[#101828]">
                      Do not record
                    </strong>
                    <span className="mt-0.5 block text-xs text-[#667085]">
                      Proceed with a private live video call only.
                    </span>
                  </div>
                </label>

                {/* Record this session */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                    recordingChoice === "record"
                      ? "border-[#FF5514] bg-[#FDF9F6]/60 ring-1 ring-[#FF5514]"
                      : "border-[#EAECF0] bg-white hover:border-[#D0D5DD]"
                  }`}
                >
                  <input
                    type="radio"
                    name="recordingChoice"
                    value="record"
                    checked={recordingChoice === "record"}
                    onChange={() => setRecordingChoice("record")}
                    className="mt-1 size-4 accent-[#FF5514]"
                  />
                  <div>
                    <strong className="block text-sm font-semibold text-[#101828]">
                      Record this session
                    </strong>
                    <span className="mt-0.5 block text-xs text-[#667085]">
                      Recording stored securely for 30 days, encrypted, and
                      deletable anytime from your dashboard.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Error */}
            {roomError && (
              <p className="mt-4 rounded-lg bg-[#FEF3F2] px-4 py-2.5 text-xs font-medium text-[#B42318]">
                {roomError}
              </p>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={() => void handleConfirmRecording()}
              disabled={isCreatingRoom}
              className="mt-8 w-full rounded-full bg-[#FF5514] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E04406] active:scale-[0.99] disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {isCreatingRoom ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Setting up session…
                </>
              ) : (
                "Continue to session"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
