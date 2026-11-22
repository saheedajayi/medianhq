"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base/select";
import { GOAL_TIMEFRAMES, MENTEE_GOALS, OTHER_GOAL } from "@/constants/mentee-goals";
import {
  useMySettings,
  useUpdateCareerGoals,
} from "@/services/settings/queries/settings.queries";
import {
  cardClass,
  Field,
  FormSkeleton,
  getApiMessage,
  inputClass,
  neutralButtonClass,
  outlineButtonClass,
  selectTriggerClass,
  TabError,
} from "./shared";

const PRESET_GOALS = MENTEE_GOALS.filter((goal) => goal !== OTHER_GOAL);

export function CareerGoalsTab() {
  const { data, isLoading, isError, isFetching, refetch } = useMySettings();
  const updateGoals = useUpdateCareerGoals();

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [otherGoal, setOtherGoal] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [timeframe, setTimeframe] = useState("");

  const reset = () => {
    if (!data) return;
    const profile = data.profile.menteeProfile;
    const saved = profile?.goals ?? [];
    // Onboarding saves a typed goal in place of "Others", so anything off the list is that goal
    const custom = saved.filter((goal) => !MENTEE_GOALS.includes(goal));
    const hasOther = custom.length > 0 || saved.includes(OTHER_GOAL);
    setSelected([
      ...saved.filter((goal) => PRESET_GOALS.includes(goal)),
      ...(hasOther ? [OTHER_GOAL] : []),
    ]);
    setOtherGoal(custom.join(", "));
    setGoalDescription(profile?.goalDescription ?? "");
    setTimeframe(profile?.timeframe ?? "");
    setError("");
  };

  // Keep the form in step with saved data, but never overwrite someone mid-edit
  useEffect(() => {
    if (!isEditing) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isEditing]);

  if (isLoading) return <FormSkeleton rows={3} label="Loading your career goals" />;
  if (isError || !data) return <TabError onRetry={() => refetch()} isRetrying={isFetching} />;

  const otherSelected = selected.includes(OTHER_GOAL);

  const toggle = (goal: string) =>
    setSelected((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]
    );

  const handleSave = async () => {
    // Typed goals are shown joined by commas, so split them back into one goal each
    const typed = otherGoal
      .split(",")
      .map((goal) => goal.trim())
      .filter(Boolean);
    const goals = selected.flatMap((goal) =>
      goal === OTHER_GOAL && typed.length > 0 ? typed : [goal]
    );
    if (goals.length === 0) {
      setError("Pick at least one goal.");
      return;
    }
    setError("");
    try {
      await updateGoals.mutateAsync({ goals, goalDescription, timeframe });
      toast.success("Career goals updated");
      setIsEditing(false);
    } catch (err) {
      setError(getApiMessage(err, "We couldn't save your career goals."));
    }
  };

  return (
    <form
      className={`${cardClass} flex flex-col gap-4`}
      onSubmit={(e) => {
        e.preventDefault();
        if (isEditing) handleSave();
      }}
    >
      <div role="group" aria-label="Your goals" className="flex flex-wrap gap-x-2 gap-y-4">
        {MENTEE_GOALS.map((goal) => {
          const isSelected = selected.includes(goal);
          return (
            <button
              key={goal}
              type="button"
              aria-pressed={isSelected}
              disabled={!isEditing}
              onClick={() => toggle(goal)}
              className={`h-8 rounded-full border px-3 text-sm transition-colors disabled:cursor-default ${
                isSelected
                  ? "border-[#4B100D] bg-[#4B100D] font-medium text-white"
                  : "border-[#EAECF0] bg-white text-[#101828] enabled:hover:border-[#FF8D62]"
              }`}
            >
              {goal}
            </button>
          );
        })}
      </div>

      {otherSelected && (isEditing || otherGoal) && (
        <Field id="other-goal" label="Your other goal">
          <input
            id="other-goal"
            value={otherGoal}
            disabled={!isEditing}
            onChange={(e) => setOtherGoal(e.target.value)}
            placeholder="Specify other goal..."
            className={inputClass}
          />
        </Field>
      )}

      <Field id="goal-description" label="Describe your goal in one sentence">
        <input
          id="goal-description"
          value={goalDescription}
          disabled={!isEditing}
          maxLength={200}
          onChange={(e) => setGoalDescription(e.target.value)}
          placeholder="e.g Create a new portfolio as a step to landing a new role"
          className={inputClass}
        />
      </Field>

      <Field label="How soon do you need to achieve your goal?">
        <Select value={timeframe} onValueChange={setTimeframe} disabled={!isEditing}>
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Select one..." />
          </SelectTrigger>
          <SelectContent>
            {GOAL_TIMEFRAMES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {error && (
        <p role="alert" className="text-sm font-medium text-[#D92D20]">
          {error}
        </p>
      )}

      {isEditing ? (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={updateGoals.isPending}
            onClick={() => setIsEditing(false)}
            className={neutralButtonClass}
          >
            Cancel
          </button>
          <button type="submit" disabled={updateGoals.isPending} className={outlineButtonClass}>
            {updateGoals.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      ) : (
        <div className="flex justify-end">
          <button type="button" onClick={() => setIsEditing(true)} className={outlineButtonClass}>
            Edit Career Goals
          </button>
        </div>
      )}
    </form>
  );
}
