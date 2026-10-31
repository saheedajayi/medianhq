"use client";

import * as React from "react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import { Plus, Link2, Check, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { formatAmount } from "@/lib/currency";
import { useCurrentUser } from "@/services/auth/queries/auth.queries";
import type { MentorSessionDto, MentorSessionInput } from "@/services/mentor-sessions";
import {
  useCreateMentorSession,
  useDeleteMentorSession,
  useMentorSessions,
  useUpdateMentorSession,
} from "@/services/mentor-sessions/queries/mentor-sessions.queries";
import { mentorSessionsQueryKeys } from "@/services/mentor-sessions/queries/query-keys";
import { MentorSessionDrawer } from "./mentor-session-drawer";
import { MentorSessionDetails } from "./mentor-session-details";
import {
  DeleteSessionModal,
  SessionSuccessModal,
} from "./mentor-session-modals";

const APPROVAL_REQUIRED_MESSAGE = "You can create sessions once your mentor application is approved.";
const CREATE_BUTTON_LOCKED_CLASS = "disabled:cursor-not-allowed disabled:bg-[#F2F4F7] disabled:text-[#98A2B3]";

export function MentorSessionsView() {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  // The API enforces this too; here it's so mentors know why they can't create yet
  const isAwaitingApproval = !!user && user.mentorStatus !== "APPROVED";
  const sessionsQuery = useMentorSessions();
  const sessions = sessionsQuery.data ?? [];
  // Show the loader on retry too, not just the first load
  const isLoading =
    sessionsQuery.isLoading || (sessionsQuery.isError && sessionsQuery.isFetching);
  const error = sessionsQuery.isError
    ? "We couldn't load your sessions. Please try again."
    : null;
  const fetchSessions = () => sessionsQuery.refetch();

  // Local edits go straight into the cached list; mutations refetch it afterwards
  const setSessions = (update: (prev: MentorSessionDto[]) => MentorSessionDto[]) =>
    queryClient.setQueryData<MentorSessionDto[]>(
      mentorSessionsQueryKeys.list(),
      (prev) => update(prev ?? [])
    );

  const createSessionMutation = useCreateMentorSession();
  const updateSessionMutation = useUpdateMentorSession();
  const deleteSessionMutation = useDeleteMentorSession();

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

  const handleCreateOpen = () => {
    if (isAwaitingApproval) {
      toast.error(APPROVAL_REQUIRED_MESSAGE);
      return;
    }
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
        const updated = await updateSessionMutation.mutateAsync({
          id: editingSession.id,
          payload,
        });
        setSessions((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
        if (selectedSession?.id === updated.id) {
          setSelectedSession(updated);
        }
        setIsDrawerOpen(false);
        setSuccessModal({ type: "updated", session: updated });
      } else {
        const created = await createSessionMutation.mutateAsync(payload);
        // Newly created session is set to live per design flow
        await updateSessionMutation.mutateAsync({
          id: created.id,
          payload: { isLive: true },
        });
        const liveCreated = { ...created, isLive: true };
        setSessions((prev) => [liveCreated, ...prev.filter((s) => s.id !== liveCreated.id)]);
        setIsDrawerOpen(false);
        setSuccessModal({ type: "live", session: liveCreated });
      }
    } catch (err) {
      console.error(err);
      const { status, message } = err as { status?: number; message?: string };
      toast.error(
        status && status >= 400 && status < 500 && message
          ? message
          : "Failed to save session. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLive = async (session: MentorSessionDto) => {
    const nextLive = !session.isLive;
    if (nextLive && isAwaitingApproval) {
      toast.error("You can put sessions live once your mentor application is approved.");
      return;
    }
    // Optimistic UI update
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? { ...s, isLive: nextLive } : s))
    );
    if (selectedSession?.id === session.id) {
      setSelectedSession({ ...session, isLive: nextLive });
    }

    try {
      await updateSessionMutation.mutateAsync({
        id: session.id,
        payload: { isLive: nextLive },
      });
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
      await deleteSessionMutation.mutateAsync(deletingSession.id);
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
        /* Mirrors the sessions page: header row, then a grid of session cards */
        <SkeletonGroup label="Loading sessions">
          <div className="flex flex-col justify-between gap-4 pb-6 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
          <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-[20px] border border-[#F2F2F7] bg-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-9 rounded-full" />
                </div>
                <Skeleton className="mt-5 h-5 w-40" />
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <div className="mt-6 flex gap-3">
                  <Skeleton className="h-9 flex-1 rounded-full" />
                  <Skeleton className="h-9 flex-1 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonGroup>
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
          <div className="flex size-14 items-center justify-center rounded-full bg-[#FFF1ED] text-[#FF5514] mb-4">
            <Calendar className="size-6" />
          </div>

          <h2 className="text-xl font-bold text-[#101828]">
            No sessions created yet
          </h2>

          <p className="mt-2.5 max-w-md text-sm text-[#475467] leading-relaxed">
            {isAwaitingApproval
              ? APPROVAL_REQUIRED_MESSAGE
              : "Create your first session offering so mentees can book time with you. You can offer free intro calls, paid sessions, or both."}
          </p>

          <button
            type="button"
            onClick={handleCreateOpen}
            disabled={isAwaitingApproval}
            className={`mt-6 inline-flex items-center gap-2 rounded-full bg-[#FF5514] px-6 py-3 text-sm font-semibold text-white transition enabled:hover:bg-[#E0480F] ${CREATE_BUTTON_LOCKED_CLASS}`}
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
                {isAwaitingApproval
                  ? APPROVAL_REQUIRED_MESSAGE
                  : "Set up times when you're available for bookings during the week."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateOpen}
              disabled={isAwaitingApproval}
              className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5514] px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-[#E0480F] shrink-0 ${CREATE_BUTTON_LOCKED_CLASS}`}
            >
              <Plus className="size-4" />
              <span>Create session</span>
            </button>
          </div>

          {/* Cards Grid: 3 columns matching Figma */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
            {sessions.map((session) => {
              const formattedPrice = formatAmount(session.price, session.currency);
              const isCopied = copiedId === session.id;

              return (
                <article
                  key={session.id}
                  className="flex flex-col justify-between rounded-[20px] border border-[#F2F2F7] bg-white p-6 transition hover:border-[#D0D5DD]"
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
                          className={`pointer-events-none inline-block size-4 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out ${
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
                      className="h-9 px-5 rounded-full border border-[#D0D5DD] bg-white text-xs font-semibold text-[#344054] hover:bg-[#F9FAFB] transition text-center"
                    >
                      Edit session
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSession(session)}
                      className="h-9 px-5 rounded-full bg-[#FF5514] text-xs font-semibold text-white hover:bg-[#E0480F] transition text-center"
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
