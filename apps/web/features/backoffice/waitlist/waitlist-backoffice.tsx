"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/base/card";
import { verifyBackofficeAccessKey } from "@/features/backoffice/actions";
import { useBackofficeStore } from "@/features/backoffice/store";

type WaitlistAudience = "MENTEE" | "MENTOR";

type WaitlistEntry = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  audience: WaitlistAudience;
  location: string | null;
  expertise: string | null;
  currentRole: string;
  company: string | null;
  levelOfExperience: string | null;
  createdAt: string;
  updatedAt: string;
};

type WaitlistPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type WaitlistDashboard = {
  summary: {
    total: number;
    mentees: number;
    mentors: number;
    latestSignupAt: string | null;
  };
  pagination: WaitlistPagination;
  entries: WaitlistEntry[];
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

const API_BASE_URL = "";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "v1";
const PAGE_SIZE = 20;

async function getWaitlistDashboard(
  page: number,
  signal?: AbortSignal,
): Promise<WaitlistDashboard> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });
  const response = await fetch(
    `${API_BASE_URL}/api/${API_VERSION}/waitlist/entries?${params}`,
    {
      cache: "no-store",
      signal,
    },
  );

  if (!response.ok) {
    throw new Error("Unable to load waitlist data.");
  }

  const payload = (await response.json()) as ApiEnvelope<WaitlistDashboard>;

  if (!payload.success || !payload.data) {
    throw new Error(payload.message ?? "Unable to load waitlist data.");
  }

  return payload.data;
}

const formatDate = (value: string | null) => {
  if (!value) {
    return "No signups yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const getAudienceLabel = (audience: WaitlistAudience) =>
  audience === "MENTOR" ? "Mentor" : "Mentee";

const getAudienceClassName = (audience: WaitlistAudience) =>
  audience === "MENTOR"
    ? "bg-[#fff4ed] text-accent-800 ring-accent-150"
    : "bg-[#eef4ff] text-[#1d4ed8] ring-[#bfdbfe]";

function StatCard({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: string;
  helper: string;
  icon: typeof Users;
}) {
  return (
    <Card className="border-text-200 bg-white shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 sm:gap-4 sm:p-6">
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-500">{title}</p>
          <CardTitle className="mt-2 text-2xl font-bold text-text-900 sm:mt-3 sm:text-3xl">
            {value}
          </CardTitle>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-primary sm:size-10">
          <Icon className="size-4 sm:size-5" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
        <p className="text-sm text-text-500">{helper}</p>
      </CardContent>
    </Card>
  );
}

function BackofficeHeader() {
  return (
    <header className="flex flex-col justify-between gap-5 border-b border-text-200 pb-5 lg:flex-row lg:items-end lg:pb-6">
      <div className="min-w-0">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-primary">
          Backoffice
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-text-900 sm:mt-3 sm:text-4xl md:text-5xl">
          Waitlist dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-600 sm:text-base sm:leading-7">
          Track everyone joining Median before launch, split by audience and
          ordered by the newest registrations.
        </p>
      </div>
      <a
        href="/waitlist"
        className="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-text-200 bg-white px-4 text-sm font-semibold text-text-700 transition-colors hover:bg-text-50 sm:w-auto"
      >
        View waitlist page
        <ArrowUpRight className="size-4" />
      </a>
    </header>
  );
}

function BackofficeShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-svh bg-[#f6f7f9] px-4 py-5 text-text-900 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 sm:gap-8">
        <BackofficeHeader />
        {children}
      </div>
    </main>
  );
}

function PaginationControls({
  pagination,
  isLoading,
  onPageChange,
}: {
  pagination: WaitlistPagination;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}) {
  const startItem =
    pagination.totalItems === 0
      ? 0
      : (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(
    pagination.page * pagination.limit,
    pagination.totalItems,
  );

  return (
    <div className="flex flex-col gap-3 border-t border-text-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-center text-sm text-text-500 sm:text-left">
        Showing {startItem.toLocaleString()}-{endItem.toLocaleString()} of{" "}
        {pagination.totalItems.toLocaleString()}
      </p>
      <div className="grid grid-cols-2 items-center gap-3 sm:flex">
        <button
          type="button"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.hasPreviousPage || isLoading}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-text-200 bg-white px-3 text-sm font-semibold text-text-700 transition-colors hover:bg-text-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft className="size-4" />
          Previous
        </button>
        <span className="col-span-2 row-start-1 text-center text-sm font-medium text-text-500 sm:col-span-1 sm:row-auto">
          Page {pagination.page.toLocaleString()} of{" "}
          {pagination.totalPages.toLocaleString()}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasNextPage || isLoading}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-text-200 bg-white px-3 text-sm font-semibold text-text-700 transition-colors hover:bg-text-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function MobileEntryCard({ entry }: { entry: WaitlistEntry }) {
  return (
    <article className="space-y-4 px-4 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-base font-bold text-text-900">
            {entry.firstName} {entry.lastName}
          </h2>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-sm text-text-500">
            <Mail className="size-3.5 shrink-0" />
            <span className="break-all">{entry.email}</span>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getAudienceClassName(entry.audience)}`}
        >
          {getAudienceLabel(entry.audience)}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div className="min-w-0">
          <dt className="font-semibold text-text-500">Role</dt>
          <dd className="mt-1 break-words text-text-800">
            {entry.currentRole}
            {entry.company ? (
              <span className="block text-text-500">{entry.company}</span>
            ) : null}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-semibold text-text-500">Focus</dt>
          <dd className="mt-1 break-words text-text-800">
            {entry.expertise ?? entry.levelOfExperience ?? "Not specified"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-semibold text-text-500">Location</dt>
          <dd className="mt-1 flex items-center gap-1.5 break-words text-text-800">
            <MapPin className="size-3.5 shrink-0 text-text-400" />
            {entry.location ?? "Not specified"}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-semibold text-text-500">Joined</dt>
          <dd className="mt-1 text-text-800">
            {formatShortDate(entry.createdAt)}
            <span className="block text-text-500">
              {formatTime(entry.createdAt)}
            </span>
          </dd>
        </div>
      </dl>
    </article>
  );
}

function AccessKeyGate({
  value,
  errorMessage,
  onChange,
  onSubmit,
  isSubmitting,
}: {
  value: string;
  errorMessage: string | null;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#f6f7f9] px-4 py-8 text-text-900 sm:px-5">
      <Card className="w-full max-w-md border-text-200 bg-white shadow-none">
        <CardContent className="p-5 sm:p-6">
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="backoffice-access-key"
                className="block text-sm font-semibold text-text-800"
              >
                Enter access key
              </label>
              <input
                id="backoffice-access-key"
                type="password"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-11 w-full rounded-lg border border-text-200 bg-white px-3 text-base text-text-900 outline-none transition-colors placeholder:text-text-400 focus:border-primary"
                autoComplete="current-password"
                autoFocus
              />
            </div>
            {errorMessage ? (
              <p className="text-sm font-medium text-primary">
                {errorMessage}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Checking..." : "Continue"}
            </button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function BackofficePage() {
  const { isAccessGranted, grantAccess } = useBackofficeStore();
  const [accessKeyInput, setAccessKeyInput] = useState("");
  const [accessErrorMessage, setAccessErrorMessage] = useState<string | null>(
    null,
  );
  const [isVerifyingAccess, setIsVerifyingAccess] = useState(false);
  const [page, setPage] = useState(1);
  const [dashboard, setDashboard] = useState<WaitlistDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const entriesCardRef = useRef<HTMLDivElement>(null);
  const entriesScrollRef = useRef<HTMLDivElement>(null);
  const shouldResetEntriesScrollRef = useRef(false);

  useEffect(() => {
    if (!isAccessGranted) {
      return;
    }

    const abortController = new AbortController();

    setIsLoading(true);
    setErrorMessage(null);

    getWaitlistDashboard(page, abortController.signal)
      .then((data) => {
        setDashboard(data);
        if (data.pagination.page !== page) {
          setPage(data.pagination.page);
        }
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load waitlist data.",
        );
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [isAccessGranted, page]);

  useEffect(() => {
    if (!dashboard || !shouldResetEntriesScrollRef.current) {
      return;
    }

    shouldResetEntriesScrollRef.current = false;
    entriesScrollRef.current?.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 767px)").matches) {
        entriesCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }, [dashboard]);

  async function handleAccessSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsVerifyingAccess(true);

    try {
      const result = await verifyBackofficeAccessKey(accessKeyInput);

      if (!result.success) {
        setAccessErrorMessage(result.message ?? "Invalid access key.");
        return;
      }

      setAccessErrorMessage(null);
      grantAccess();
    } catch {
      setAccessErrorMessage("Unable to verify access key.");
    } finally {
      setIsVerifyingAccess(false);
    }
  }

  function handlePageChange(nextPage: number) {
    shouldResetEntriesScrollRef.current = true;
    setPage(nextPage);
  }

  if (!isAccessGranted) {
    return (
      <AccessKeyGate
        value={accessKeyInput}
        errorMessage={accessErrorMessage}
        onChange={setAccessKeyInput}
        onSubmit={handleAccessSubmit}
        isSubmitting={isVerifyingAccess}
      />
    );
  }

  if (errorMessage && !dashboard) {
    return (
      <BackofficeShell>
        <Card className="border-text-200 bg-white shadow-none">
          <CardContent className="py-10">
            <p className="text-sm font-semibold text-primary">
              Unable to load waitlist data
            </p>
            <p className="mt-2 text-sm text-text-600">{errorMessage}</p>
          </CardContent>
        </Card>
      </BackofficeShell>
    );
  }

  if (!dashboard) {
    return (
      <BackofficeShell>
        <Card className="border-text-200 bg-white shadow-none">
          <CardContent className="py-10">
            <p className="text-sm font-semibold text-text-700">
              Loading waitlist dashboard...
            </p>
          </CardContent>
        </Card>
      </BackofficeShell>
    );
  }

  const entries = dashboard.entries;
  const mentorShare =
    dashboard.summary.total > 0
      ? Math.round((dashboard.summary.mentors / dashboard.summary.total) * 100)
      : 0;
  const menteeShare =
    dashboard.summary.total > 0
      ? Math.round((dashboard.summary.mentees / dashboard.summary.total) * 100)
      : 0;

  return (
    <BackofficeShell>
      <section className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total signups"
          value={dashboard.summary.total.toLocaleString()}
          helper="Unique email addresses on the waitlist"
          icon={Users}
        />
        <StatCard
          title="Mentees"
          value={dashboard.summary.mentees.toLocaleString()}
          helper={`${menteeShare}% of the current waitlist`}
          icon={Users}
        />
        <StatCard
          title="Mentors"
          value={dashboard.summary.mentors.toLocaleString()}
          helper={`${mentorShare}% of the current waitlist`}
          icon={BriefcaseBusiness}
        />
        <StatCard
          title="Latest signup"
          value={
            dashboard.summary.latestSignupAt
              ? formatShortDate(dashboard.summary.latestSignupAt)
              : "-"
          }
          helper={formatDate(dashboard.summary.latestSignupAt)}
          icon={Clock3}
        />
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="border-text-200 bg-white shadow-none lg:sticky lg:top-6 lg:self-start">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Audience split</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pt-0 pb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-text-700">Mentees</span>
                <span className="text-text-500">{menteeShare}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-text-100">
                <div
                  className="h-full rounded-full bg-[#2563eb]"
                  style={{ width: `${menteeShare}%` }}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-text-700">Mentors</span>
                <span className="text-text-500">{mentorShare}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-text-100">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${mentorShare}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div ref={entriesCardRef} className="min-w-0 scroll-mt-4">
          <Card className="flex min-h-0 flex-col overflow-hidden border-text-200 bg-white shadow-none lg:max-h-[calc(100svh-3rem)]">
          {isLoading ? (
            <CardHeader className="shrink-0 border-b border-text-100 bg-white">
              <span className="text-sm font-medium text-text-500">
                Loading...
              </span>
            </CardHeader>
          ) : null}
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            {errorMessage ? (
              <div className="shrink-0 border-b border-text-100 px-6 py-3 text-sm text-primary">
                {errorMessage}
              </div>
            ) : null}
            <div className="divide-y divide-text-100 md:hidden">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <MobileEntryCard key={entry.id} entry={entry} />
                ))
              ) : (
                <div className="px-4 py-12 text-center text-sm text-text-500">
                  No waitlist entries yet.
                </div>
              )}
            </div>
            <div
              ref={entriesScrollRef}
              className="hidden min-h-0 flex-1 overflow-auto md:block"
            >
              <table className="w-full min-w-[860px] border-collapse text-left xl:min-w-[920px]">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-text-200 bg-text-50 text-xs font-semibold uppercase tracking-[0.06em] text-text-500">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Audience</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Focus</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-text-100">
                  {entries.length > 0 ? (
                    entries.map((entry) => (
                      <tr key={entry.id} className="align-top">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-text-900">
                            {entry.firstName} {entry.lastName}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-sm text-text-500">
                            <Mail className="size-3.5" />
                            {entry.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getAudienceClassName(entry.audience)}`}
                          >
                            {getAudienceLabel(entry.audience)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-700">
                          {entry.currentRole}
                          {entry.company ? (
                            <span className="block text-text-500">
                              {entry.company}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-700">
                          {entry.expertise ??
                            entry.levelOfExperience ??
                            "Not specified"}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-700">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-text-400" />
                            {entry.location ?? "Not specified"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-500">
                          {formatShortDate(entry.createdAt)}
                          <span className="block">
                            {formatTime(entry.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-sm text-text-500"
                      >
                        No waitlist entries yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              pagination={dashboard.pagination}
              isLoading={isLoading}
              onPageChange={handlePageChange}
            />
          </CardContent>
          </Card>
        </div>
      </section>
    </BackofficeShell>
  );
}
