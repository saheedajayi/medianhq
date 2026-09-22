"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Mic, MicOff, Video, VideoOff, Clock, X, ArrowLeft } from "lucide-react";
import { Booking, RecordingOption } from "./types";

interface SessionLobbyProps {
  booking: Booking;
  onBack: () => void;
  onEnterMeeting: (recordingOption: RecordingOption, initialMicOn: boolean, initialCameraOn: boolean) => void;
}

export function SessionLobby({
  booking,
  onBack,
  onEnterMeeting,
}: SessionLobbyProps) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordingChoice, setRecordingChoice] = useState<RecordingOption>("do_not_record");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraStream, setHasCameraStream] = useState(false);

  // Attempt real camera preview if available
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isCancelled = false;

    if (isCameraOn && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((s) => {
          if (isCancelled) {
            s.getTracks().forEach((t) => t.stop());
            return;
          }
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            setHasCameraStream(true);
          }
        })
        .catch(() => {
          // Camera permission denied or not available; fallback to high-res photo preview
          setHasCameraStream(false);
        });
    } else {
      setHasCameraStream(false);
    }

    return () => {
      isCancelled = true;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isCameraOn]);

  const handleStartJoin = () => {
    setShowRecordingModal(true);
  };

  const handleConfirmRecording = () => {
    setShowRecordingModal(false);
    onEnterMeeting(recordingChoice, isMicOn, isCameraOn);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] rounded-[24px] border border-[#EAECF0] bg-white p-6 sm:p-10">
      {/* Back button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-[#475467] transition hover:bg-[#F9FAFB] hover:text-[#101828]"
        >
          <ArrowLeft className="size-4" />
          Back to Bookings
        </button>

        <span className="rounded-full bg-[#ECFDF3] px-3 py-1 text-xs font-semibold text-[#027A48]">
          Ready to join
        </span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#101828]">Session lobby</h1>
        <p className="mt-1 text-sm text-[#667085]">
          Set up times when you&apos;re available for bookings during the week.
        </p>
      </div>

      {/* Main Video Stage */}
      <div className="relative mx-auto aspect-[16/10] max-h-[580px] w-full overflow-hidden rounded-[20px] bg-[#101828]">
        {isCameraOn ? (
          hasCameraStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover -scale-x-100"
            />
          ) : (
            <div className="relative h-full w-full">
              <Image
                src="/sessions/lobby-preview.png"
                alt="Camera Preview"
                fill
                className="object-cover"
                priority
              />
            </div>
          )
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-center text-white">
            <div className="flex size-20 items-center justify-center rounded-full bg-[#1D2939] text-[#98A2B3]">
              <VideoOff className="size-10" />
            </div>
            <p className="mt-4 text-base font-semibold">Camera is turned off</p>
            <p className="mt-1 text-xs text-[#98A2B3]">Click &quot;Camera On&quot; below to turn it on</p>
          </div>
        )}

        {/* Floating User Badge */}
        <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-[#101828]/80 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
          {booking.mentorName} (You)
        </div>
      </div>

      {/* Media Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mic Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMicOn((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              isMicOn
                ? "border border-[#FFCAB6] bg-[#FDF9F6] text-[#E84D12] hover:bg-[#FEE4E2]/40"
                : "border border-[#D0D5DD] bg-white text-[#667085] hover:bg-[#F9FAFB]"
            }`}
          >
            {isMicOn ? <Mic className="size-4 text-[#FF5514]" /> : <MicOff className="size-4" />}
            {isMicOn ? "Mic On" : "Mic Off"}
          </button>

          {/* Camera Toggle Button */}
          <button
            type="button"
            onClick={() => setIsCameraOn((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              isCameraOn
                ? "border border-[#FFCAB6] bg-[#FDF9F6] text-[#E84D12] hover:bg-[#FEE4E2]/40"
                : "border border-[#D0D5DD] bg-white text-[#667085] hover:bg-[#F9FAFB]"
            }`}
          >
            {isCameraOn ? <Video className="size-4 text-[#FF5514]" /> : <VideoOff className="size-4" />}
            {isCameraOn ? "Camera On" : "Camera Off"}
          </button>
        </div>

        {/* Join CTA */}
        <button
          type="button"
          onClick={handleStartJoin}
          className="rounded-full bg-[#FF5514] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E04406] active:scale-[0.98]"
        >
          Join meeting
        </button>
      </div>

      {/* Session Details Footer */}
      <div className="mt-8 border-t border-[#EAECF0] pt-6">
        <h2 className="text-xl font-bold tracking-tight text-[#101828]">
          {booking.title} with {booking.mentorName}
        </h2>
        <p className="mt-1 text-sm text-[#667085]">
          Reviewing CV and portfolio for Senior Product Management roles in FinTech.
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#475467]">
          <Clock className="size-4 text-[#FF5514]" />
          <span>{booking.durationMinutes} Minutes Duration</span>
        </div>
      </div>

      {/* Recording Consent Modal (Join Session - Lobby-1.svg) */}
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
              This session can be recorded for your reference. Both parties must consent to recording. The recording is encrypted and stored safely.
            </p>

            {/* Options */}
            <div className="mt-6">
              <span className="text-[11px] font-bold tracking-wider text-[#667085] uppercase">
                REASON
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
                      Recording will be stored securely for 30 days, encrypted, and deletable anytime from your dashboard.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="button"
              onClick={handleConfirmRecording}
              className="mt-8 w-full rounded-full bg-[#FF5514] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E04406] active:scale-[0.99]"
            >
              Continue to session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
