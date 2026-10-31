"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { User } from "iconsax-react";
import { toast } from "sonner";
import { TIMEZONE_OPTIONS } from "@/components/mentor-availability/timezone-dropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base/select";
import { ProgressiveLocationSelect } from "@/components/ui/custom/progressive-location-select";
import {
  useMySettings,
  useUpdateProfile,
  useUpdateSettings,
} from "@/services/settings/queries/settings.queries";
import { useUploadAvatar } from "@/services/uploads/queries/uploads.queries";
import {
  cardClass,
  Field,
  FormSkeleton,
  getApiMessage,
  filledInputClass,
  inputClass,
  neutralButtonClass,
  outlineButtonClass,
  selectTriggerClass,
  TabError,
  textareaClass,
} from "./shared";

// Accounts start on the API's default timezone, which is stored by name
const toTimezoneOption = (timezone?: string) =>
  timezone === "Africa/Lagos" ? "(+01:00) West Central Africa / Lagos / London BST" : (timezone ?? "");

const toGenderOption = (gender?: string | null) =>
  gender ? gender[0]!.toUpperCase() + gender.slice(1).toLowerCase() : "";

export function BasicInfoTab() {
  const { data, isLoading, isError, isFetching, refetch } = useMySettings();
  const updateProfile = useUpdateProfile();
  const updateSettings = useUpdateSettings();
  const uploadAvatar = useUploadAvatar();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [timezone, setTimezone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    if (!data) return;
    const profile = data.profile.menteeProfile;
    setFirstName(data.profile.firstName);
    setLastName(data.profile.lastName);
    setGender(toGenderOption(profile?.gender));
    setLocation(profile?.location ?? "");
    setTimezone(toTimezoneOption(data.settings.timezone));
    setBio(profile?.bio ?? "");
    setAvatarFile(null);
    setAvatarPreview(profile?.avatarUrl ?? null);
    setError("");
  };

  // Keep the form in step with saved data, but never overwrite someone mid-edit
  useEffect(() => {
    if (!isEditing) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isEditing]);

  if (isLoading) return <FormSkeleton rows={6} label="Loading your profile" />;
  if (isError || !data) return <TabError onRetry={() => refetch()} isRetrying={isFetching} />;

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      // Unlike a failed save, a failed photo upload shouldn't look like success
      const avatarUrl = avatarFile ? (await uploadAvatar.mutateAsync(avatarFile)).url : undefined;
      await updateProfile.mutateAsync({
        firstName,
        lastName,
        gender: gender || undefined,
        location,
        bio,
        avatarUrl,
      });
      if (timezone && timezone !== toTimezoneOption(data.settings.timezone)) {
        await updateSettings.mutateAsync({ timezone });
      }
      toast.success("Profile updated");
      setIsEditing(false);
    } catch (err) {
      setError(
        getApiMessage(err, err instanceof Error ? err.message : "We couldn't save your profile.")
      );
    } finally {
      setIsSaving(false);
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
      <div className="flex items-center gap-5">
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F2F4F7]">
          {avatarPreview ? (
            <Image src={avatarPreview} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <User size="28" variant="Outline" color="#98A2B3" />
          )}
        </div>
        <div>
          <button
            type="button"
            disabled={!isEditing}
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium text-[#FF5514] enabled:hover:underline disabled:cursor-default"
          >
            Change profile picture
          </button>
          <p className="mt-1 text-xs text-[#475467]">PNG, JPG or WebP (max. 800x800px)</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
          }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field id="first-name" label="First name">
          <input
            id="first-name"
            value={firstName}
            disabled={!isEditing}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field id="last-name" label="Last name">
          <input
            id="last-name"
            value={lastName}
            disabled={!isEditing}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Gender">
        <Select value={gender} onValueChange={setGender} disabled={!isEditing}>
          <SelectTrigger className={selectTriggerClass}>
            <SelectValue placeholder="Select your gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field id="email" label="Email address">
        <input id="email" value={data.profile.email} disabled className={filledInputClass} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Country">
          <ProgressiveLocationSelect
            id="settings-location"
            value={location}
            onChange={setLocation}
            disabled={!isEditing}
            placeholder="Select your location"
            triggerClassName="h-12 rounded-xl text-base"
          />
        </Field>
        <Field label="Timezone">
          <Select value={timezone} onValueChange={setTimezone} disabled={!isEditing}>
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        id="bio"
        label={
          <>
            Bio <span className="font-normal text-[#475467]">(Less than 300 words)</span>
          </>
        }
      >
        <textarea
          id="bio"
          value={bio}
          disabled={!isEditing}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell mentors about yourself..."
          className={textareaClass}
        />
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
            disabled={isSaving}
            onClick={() => setIsEditing(false)}
            className={neutralButtonClass}
          >
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className={outlineButtonClass}>
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      ) : (
        <div className="flex justify-end">
          <button type="button" onClick={() => setIsEditing(true)} className={outlineButtonClass}>
            Edit Profile
          </button>
        </div>
      )}
    </form>
  );
}
