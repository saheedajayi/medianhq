import { MentorWeeklySchedule } from "@/components/mentor-sessions/mentor-weekly-schedule";

export default function MentorAvailabilityPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#101828]">Availability</h1>
        <p className="mt-1 text-sm text-[#667085]">
          Manage your recurring weekly availability for bookings.
        </p>
      </div>

      <MentorWeeklySchedule />
    </div>
  );
}
