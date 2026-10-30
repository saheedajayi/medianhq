"use client";

import { toast } from "sonner";
import { Skeleton, SkeletonGroup } from "@/components/ui/base/skeleton";
import {
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
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-4 w-[30px] shrink-0 rounded-full transition-colors ${
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

const CHANNELS: { value: NotificationChannel; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "inApp", label: "In-app" },
];

export function NotificationsTab() {
  const { data, isLoading, isError, isFetching, refetch } = useMySettings();
  const updatePreferences = useUpdateNotificationPreferences();

  if (isError) return <TabError onRetry={() => refetch()} isRetrying={isFetching} />;

  const preferences = data?.settings.notificationPreferences ?? {};

  const toggle = (type: NotificationType, channel: NotificationChannel) => {
    const enabled = preferences[type]?.[channel] !== false;
    updatePreferences.mutate(
      { [type]: { [channel]: !enabled } },
      {
        onError: (err) =>
          toast.error(getApiMessage(err, "We couldn't save that change. Please try again.")),
      }
    );
  };

  return (
    <section className={cardClass}>
      <h2 className={cardTitleClass}>Notification Preferences</h2>
      <p className="mt-1 text-sm text-[#475467]">
        Manage how you receive notifications by email and in-app.
      </p>

      <div className="mt-5 grid grid-cols-[1fr_56px_56px] items-center gap-y-5 text-sm">
        <span className="text-[#475467]">Notification type</span>
        {CHANNELS.map((channel) => (
          <span key={channel.value} className="justify-self-end text-[#475467]">
            {channel.label}
          </span>
        ))}

        {NOTIFICATION_TYPES.map((type) => (
          <div key={type.value} className="contents">
            <span className="text-[#101828]">{type.label}</span>
            {CHANNELS.map((channel) =>
              isLoading ? (
                <SkeletonGroup
                  key={channel.value}
                  label={`Loading ${type.label}`}
                  className="justify-self-end"
                >
                  <Skeleton className="h-4 w-[30px] rounded-full" />
                </SkeletonGroup>
              ) : (
                <div key={channel.value} className="justify-self-end">
                  <Toggle
                    label={`${type.label} by ${channel.label}`}
                    checked={preferences[type.value]?.[channel.value] !== false}
                    onChange={() => toggle(type.value, channel.value)}
                  />
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
