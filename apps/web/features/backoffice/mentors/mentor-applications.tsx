"use client";

import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, FileText, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/base/card";

type MentorApplication = {
  id: string;
  name: string;
  email: string;
  currentRole: string | null;
  company: string | null;
  industry: string;
  experience: string;
  motivation: string | null;
  linkedinUrl: string | null;
  /** Signed link to the CV, valid for an hour */
  cvUrl: string | null;
  appliedAt: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "v1";
const ADMIN_URL = `${API_BASE_URL}/api/${API_VERSION}/admin/mentors`;

async function adminRequest<T>(accessKey: string, url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-backoffice-key": accessKey,
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message ?? "Request failed.");
  }
  return payload.data as T;
}

/** Applications waiting for review; approving makes the mentor bookable, rejecting emails them */
export function MentorApplications({ accessKey }: { accessKey: string }) {
  const [applications, setApplications] = useState<MentorApplication[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    try {
      setErrorMessage(null);
      setApplications(await adminRequest<MentorApplication[]>(accessKey, ADMIN_URL));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load applications.");
    }
  }, [accessKey]);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(id: string, decision: "approve" | "reject") {
    setBusyId(id);
    try {
      await adminRequest(accessKey, `${ADMIN_URL}/${id}/${decision}`, {
        method: "PATCH",
        body: JSON.stringify(decision === "reject" ? { reason: rejectReason } : {}),
      });
      setApplications((prev) => prev?.filter((app) => app.id !== id) ?? null);
      setRejectingId(null);
      setRejectReason("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save the decision.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="border-text-200 bg-white shadow-none">
      <CardHeader className="p-4 sm:p-5">
        <CardTitle className="text-base font-semibold text-text-900">
          Mentor applications
          {applications && applications.length > 0 && (
            <span className="ml-2 rounded-full bg-[#FFEEE8] px-2 py-0.5 text-xs font-medium text-[#FF5500]">
              {applications.length} waiting
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0 sm:p-5 sm:pt-0">
        {errorMessage && <p className="text-sm text-[#B42318]">{errorMessage}</p>}

        {applications === null && !errorMessage && (
          <SkeletonGroup label="Loading applications" className="space-y-3">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex items-start justify-between rounded-xl border border-text-200 p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-56" />
                  <Skeleton className="h-3 w-44" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </SkeletonGroup>
        )}

        {applications?.length === 0 && (
          <p className="text-sm text-text-600">No applications are waiting for review.</p>
        )}

        {applications?.map((app) => (
          <div key={app.id} className="rounded-xl border border-text-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-900">{app.name}</p>
                <p className="text-xs text-text-600">
                  {[app.currentRole, app.company].filter(Boolean).join(" @ ") || "Role not given"} ·{" "}
                  {app.industry} · {app.experience}
                </p>
                <p className="mt-1 break-all text-xs text-text-600">{app.email}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium">
                  {app.cvUrl && (
                    <a
                      href={app.cvUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#FF5500] hover:underline"
                    >
                      <FileText className="size-3.5" /> View CV
                    </a>
                  )}
                  {app.linkedinUrl && (
                    <a
                      href={app.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#FF5500] hover:underline"
                    >
                      LinkedIn <ArrowUpRight className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={busyId === app.id}
                  onClick={() => setRejectingId(rejectingId === app.id ? null : app.id)}
                  className="rounded-full border border-text-200 px-4 py-2 text-xs font-semibold text-text-700 hover:bg-[#f6f7f9] disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={busyId === app.id}
                  onClick={() => void decide(app.id, "approve")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#FF5500] px-4 py-2 text-xs font-semibold text-white hover:bg-[#E04B00] disabled:opacity-60"
                >
                  {busyId === app.id && <Loader2 className="size-3.5 animate-spin" />}
                  Approve
                </button>
              </div>
            </div>

            {app.motivation && (
              <p className="mt-3 rounded-lg bg-[#f6f7f9] p-3 text-xs leading-relaxed text-text-700">
                <span className="font-semibold">Why they want to mentor: </span>
                {app.motivation}
              </p>
            )}

            {rejectingId === app.id && (
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Feedback for the applicant (optional, included in the email)"
                  className="flex-1 rounded-lg border border-text-200 px-3 py-2 text-xs focus:border-[#FF5500] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={busyId === app.id}
                  onClick={() => void decide(app.id, "reject")}
                  className="rounded-full bg-[#D92D20] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B42318] disabled:opacity-60"
                >
                  Confirm rejection
                </button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
