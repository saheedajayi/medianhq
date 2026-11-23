"use client";

import { toast } from "sonner";
import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import {
  COMING_SOON_NOTIFICATION_TYPES,
  NOTIFICATION_TYPES,
  type NotificationChannel,
  type NotificationType,
} from "@/services/settings";
import {
  useMySettings,
  useUpdateNotificationPreferences,
} from "@/services/settings/queries/settings.queries";
import { cardClass, cardTitleClass, getApiMessage, TabError } from "./shared";

function Toggle({
  label,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-4 w-[30px] shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "bg-[#FF5514]" : "bg-[#D0D5DD]"
      }`}
    >
      <span
        className={`absolute top-0.5 size-3 rounded-full bg-white transition-all ${
          checked ? "left-4" : "left-0.5"
        }`}
      />
    </button>
  );
}

// Email sits left-aligned in its column and In-app against the card's edge, as in the design
const CHANNELS: {
  value: NotificationChannel;
  label: string;
  alignClass: string;
}[] = [
  { value: "email", label: "Email", alignClass: "justify-self-start" },
  { value: "inApp", label: "In-app", alignClass: "justify-self-end" },
];

const ROW_CLASS =
  "grid grid-cols-[1fr_72px_48px] items-center whitespace-nowrap text-sm sm:grid-cols-[1fr_83px_48px]";

export function NotificationsTab() {
  const { data, isLoading, isError, isFetching, refetch } = useMySettings();
  const updatePreferences = useUpdateNotificationPreferences();

  if (isError)
    return <TabError onRetry={() => refetch()} isRetrying={isFetching} />;

  const preferences = data?.settings.notificationPreferences ?? {};

  const toggle = (type: NotificationType, channel: NotificationChannel) => {
    const enabled = preferences[type]?.[channel] !== false;
    updatePreferences.mutate(
      { [type]: { [channel]: !enabled } },
      {
        onError: (err) =>
          toast.error(
            getApiMessage(
              err,
              "We couldn't save that change. Please try again.",
            ),
          ),
      },
    );
  };

  return (
    <section className={cardClass}>
      <h2 className={cardTitleClass}>Notification Preferences</h2>
      <p className="mt-1 text-sm text-[#475467]">
        Manage how you receive notifications by email and in-app.
      </p>

      <div className={`${ROW_CLASS} mt-5 text-[#667085]`}>
        <span>Notification type</span>
        {CHANNELS.map((channel) => (
          <span key={channel.value} className={channel.alignClass}>
            {channel.label}
          </span>
        ))}
      </div>

      <div className="mt-4 border-b border-[#EAECF0] pb-2">
        {NOTIFICATION_TYPES.map((type) => {
          const comingSoon = COMING_SOON_NOTIFICATION_TYPES.includes(
            type.value,
          );
          return (
            <div key={type.value} className={`${ROW_CLASS} h-11`}>
              {comingSoon ? (
                <span className="flex items-center gap-2 text-[#98A2B3]">
                  {type.label}
                  <span className="rounded-full bg-[#F2F4F7] px-2 py-0.5 text-[11px] font-medium text-[#667085]">
                    Soon
                  </span>
                </span>
              ) : (
                <span className="text-[#101828]">{type.label}</span>
              )}
              {CHANNELS.map((channel) =>
                isLoading && !comingSoon ? (
                  <SkeletonGroup
                    key={channel.value}
                    label={`Loading ${type.label}`}
                    className={channel.alignClass}
                  >
                    <Skeleton className="h-4 w-[30px] rounded-full" />
                  </SkeletonGroup>
                ) : (
                  <div key={channel.value} className={channel.alignClass}>
                    <Toggle
                      label={`${type.label} by ${channel.label}`}
                      checked={
                        !comingSoon &&
                        preferences[type.value]?.[channel.value] !== false
                      }
                      disabled={comingSoon}
                      onChange={() => toggle(type.value, channel.value)}
                    />
                  </div>
                ),
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
