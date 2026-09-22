"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Plus, Link2, Check, AlertCircle, Calendar } from "lucide-react";
import {
  mentorSessionsService,
  type MentorSessionDto,
  type MentorSessionInput,
} from "@/services/mentor-sessions";
import { MentorSessionDrawer } from "./mentor-session-drawer";
import { MentorSessionDetails } from "./mentor-session-details";
import {
  DeleteSessionModal,
  SessionSuccessModal,
} from "./mentor-session-modals";

export function MentorSessionsView() {
  const [sessions, setSessions] = useState<MentorSessionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected session for detail page view (Available Sessions-1.svg)
  const [selectedSession, setSelectedSession] = useState<MentorSessionDto | null>(null);

  // Drawer state for Create / Edit
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<MentorSessionDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deletingSession, setDeletingSession] = useState<MentorSessionDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success modal state ("live" | "updated" | null)
  const [successModal, setSuccessModal] = useState<{
    type: "live" | "updated";
    session: MentorSessionDto;
  } | null>(null);

  // Copied session link feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await mentorSessionsService.list();
      setSessions(res.data || []);
    } catch (err: any) {
      console.error("Failed to load sessions:", err);
      setError("We couldn't load your sessions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOpen = () => {
    setEditingSession(null);
    setIsDrawerOpen(true);
  };

  const handleEditOpen = (session: MentorSessionDto) => {
    setEditingSession(session);
    setIsDrawerOpen(true);
  };

  const handleSaveSession = async (payload: MentorSessionInput) => {
    setIsSaving(true);
    try {
      if (editingSession) {
        const res = await mentorSessionsService.update(editingSession.id, payload);
        const updated = res.data;
        setSessions((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
        if (selectedSession?.id === updated.id) {
          setSelectedSession(updated);
        }
        setIsDrawerOpen(false);
        setSuccessModal({ type: "updated", session: updated });
      } else {
        const res = await mentorSessionsService.create(payload);
        const created = res.data;
        // Newly created session is set to live per design flow
        await mentorSessionsService.update(created.id, { isLive: true });
        const liveCreated = { ...created, isLive: true };
        setSessions((prev) => [liveCreated, ...prev]);
        setIsDrawerOpen(false);
        setSuccessModal({ type: "live", session: liveCreated });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save session. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLive = async (session: MentorSessionDto) => {
    const nextLive = !session.isLive;
    // Optimistic UI update
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? { ...s, isLive: nextLive } : s))
    );
    if (selectedSession?.id === session.id) {
      setSelectedSession({ ...session, isLive: nextLive });
    }

    try {
      await mentorSessionsService.update(session.id, { isLive: nextLive });
    } catch {
      // Revert on error
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, isLive: !nextLive } : s))
      );
      if (selectedSession?.id === session.id) {
        setSelectedSession({ ...session, isLive: !nextLive });
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSession) return;
    setIsDeleting(true);
    try {
      await mentorSessionsService.remove(deletingSession.id);
      setSessions((prev) => prev.filter((s) => s.id !== deletingSession.id));
      if (selectedSession?.id === deletingSession.id) {
        setSelectedSession(null);
      }
      setDeletingSession(null);
    } catch {
      alert("Failed to delete session. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = (session: MentorSessionDto, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/sessions/${session.id}`;
      navigator.clipboard.writeText(url);
      setCopiedId(session.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // If viewing details of a specific session (Available Sessions-1.svg)
  if (selectedSession) {
    return (
      <div className="w-full flex-1 flex flex-col min-h-full">
        <MentorSessionDetails
          session={selectedSession}
          onBack={() => setSelectedSession(null)}
          onEdit={(s) => handleEditOpen(s)}
          onDelete={(s) => setDeletingSession(s)}
        />

        <MentorSessionDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onSave={handleSaveSession}
          editingSession={editingSession}
          isSaving={isSaving}
        />

        <DeleteSessionModal
          isOpen={Boolean(deletingSession)}
          onClose={() => setDeletingSession(null)}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
          sessionTitle={deletingSession?.title}
        />

        <SessionSuccessModal
          isOpen={Boolean(successModal)}
          onClose={() => setSuccessModal(null)}
          type={successModal?.type || "live"}
          onViewSession={() => {
            if (successModal?.session) {
              setSelectedSession(successModal.session);
            }
            setSuccessModal(null);
          }}
          onSecondaryAction={() => {
            setSuccessModal(null);
            if (successModal?.type === "live") {
              handleCreateOpen();
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center text-sm font-medium text-[#667085]">
          Loading sessions...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-[#FDA29B] bg-[#FEF3F2] p-8 text-center text-sm text-[#B42318]">
          <AlertCircle className="mx-auto mb-2 size-6" />
          <p className="font-medium">{error}</p>
          <button
            onClick={fetchSessions}
            className="mt-4 rounded-full bg-[#B42318] px-5 py-2 text-xs font-semibold text-white hover:bg-[#912018] transition"
          >
            Retry
          </button>
        </div>
      ) : sessions.length === 0 ? (
        /* Empty State exactly matching Session not set.svg */
        <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#FFF1ED] text-[#FF5514] shadow-xs mb-4">
            <Calendar className="size-6" />
          </div>

          <h2 className="text-xl font-bold text-[#101828]">
            No sessions created yet
          </h2>

          <p className="mt-2.5 max-w-md text-sm text-[#475467] leading-relaxed">
            Create your first session offering so mentees can book time with you.
            You can offer free intro calls, paid sessions, or both.
          </p>

          <button
            type="button"
            onClick={handleCreateOpen}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FF5514] px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#E0480F]"
          >
            <Plus className="size-4" />
            <span>Create session</span>
          </button>
        </div>
      ) : (
        /* Populated Sessions Grid exactly matching Available Sessions.svg */
        <div>
          {/* Header Row: Title & Subtitle on Left, + Create session Button on Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#101828]">Sessions</h1>
              <p className="mt-1 text-sm text-[#475467]">
                Set up times when you're available for bookings during the week.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateOpen}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5514] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#E0480F] shrink-0"
            >
              <Plus className="size-4" />
              <span>Create session</span>
            </button>
          </div>

          {/* Cards Grid: 3 columns matching Figma */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
            {sessions.map((session) => {
              const formattedPrice =
                session.price && session.price > 0
                  ? `₦${session.price.toLocaleString()}`
                  : "Free";
              const isCopied = copiedId === session.id;

              return (
                <article
                  key={session.id}
                  className="flex flex-col justify-between rounded-[20px] border border-[#F2F2F7] bg-white p-6 shadow-xs transition hover:border-[#D0D5DD] hover:shadow-md"
                >
                  <div>
                    {/* Top Row: Duration badge, Price badge, Live Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#F7F8FB] px-3.5 py-1 text-xs font-semibold text-[#344054]">
                          {session.durationMinutes}mins
                        </span>
                        <span className="rounded-full bg-[#F7F8FB] px-3.5 py-1 text-xs font-semibold text-[#344054]">
                          {formattedPrice}
                        </span>
                      </div>

                      {/* Live Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleLive(session)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          session.isLive ? "bg-[#FF5514]" : "bg-[#EAECF0]"
                        }`}
                        role="switch"
                        aria-checked={session.isLive}
                        title={session.isLive ? "Session is Live" : "Session is Inactive"}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            session.isLive ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Title with Copy Link Button */}
                    <div className="mt-4 flex items-center gap-2">
                      <h3
                        onClick={() => setSelectedSession(session)}
                        className="text-lg font-bold text-[#101828] hover:text-[#FF5514] cursor-pointer transition line-clamp-1"
                      >
                        {session.title}
                      </h3>
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(session, e)}
                        className="text-[#667085] hover:text-[#FF5514] transition p-1"
                        title={isCopied ? "Link copied!" : "Copy session link"}
                      >
                        {isCopied ? (
                          <Check className="size-4 text-[#12B76A]" />
                        ) : (
                          <Link2 className="size-4" />
                        )}
                      </button>
                    </div>

                    {/* Description preview */}
                    <p className="mt-2 text-sm leading-relaxed text-[#475467] line-clamp-2 min-h-10">
                      {session.description || "No description provided."}
                    </p>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="mt-6 flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleEditOpen(session)}
                      className="h-9 px-5 rounded-full border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] hover:bg-[#F9FAFB] transition shadow-2xs text-center"
                    >
                      Edit session
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSession(session)}
                      className="h-9 px-5 rounded-full bg-[#FF5514] text-xs font-semibold text-white hover:bg-[#E0480F] transition shadow-2xs text-center"
                    >
                      View details
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals & Drawer */}
      <MentorSessionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveSession}
        editingSession={editingSession}
        isSaving={isSaving}
      />

      <DeleteSessionModal
        isOpen={Boolean(deletingSession)}
        onClose={() => setDeletingSession(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        sessionTitle={deletingSession?.title}
      />

      <SessionSuccessModal
        isOpen={Boolean(successModal)}
        onClose={() => setSuccessModal(null)}
        type={successModal?.type || "live"}
        onViewSession={() => {
          if (successModal?.session) {
            setSelectedSession(successModal.session);
          }
          setSuccessModal(null);
        }}
        onSecondaryAction={() => {
          setSuccessModal(null);
          if (successModal?.type === "live") {
            handleCreateOpen();
          }
        }}
      />
    </div>
  );
}
