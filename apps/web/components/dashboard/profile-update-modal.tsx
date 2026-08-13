"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { User, GalleryAdd, Add } from "iconsax-react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { menteesService } from "@/services/mentees";
import { uploadsService } from "@/services/uploads";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base/select";

interface ProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProfileUpdateModal({
  isOpen,
  onClose,
  onSuccess,
}: ProfileUpdateModalProps) {
  const queryClient = useQueryClient();
  const { data: user, refetch } = useCurrentUser();

  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageFetching, setIsImageFetching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refetch user session when modal opens to ensure fresh data
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  // Prefill modal form with existing saved profile data when user data is available
  useEffect(() => {
    if (isOpen && user?.menteeProfile) {
      const profile = user.menteeProfile;

      // Normalize gender value casing to match SelectItem values ("Male" | "Female")
      if (profile.gender) {
        const raw = String(profile.gender).trim();
        const lower = raw.toLowerCase();
        if (lower === "male") setGender("Male");
        else if (lower === "female") setGender("Female");
        else setGender(raw);
      } else {
        setGender("");
      }

      setLocation(profile.location || "");
      setBio(profile.bio || "");
      setAvatarPreview(profile.avatarUrl || null);

      if (profile.avatarUrl) {
        setIsImageFetching(true);
      } else {
        setIsImageFetching(false);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      setIsImageFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let avatarUrl = user?.menteeProfile?.avatarUrl || undefined;

      // Upload profile image to Cloudinary if new image file selected
      if (avatarFile) {
        try {
          const uploadRes = await uploadsService.uploadAvatar(avatarFile);
          if (uploadRes?.url) {
            avatarUrl = uploadRes.url;
          }
        } catch (uploadErr) {
          console.warn("Avatar upload to Cloudinary failed:", uploadErr);
        }
      }

      await menteesService.createProfile({
        gender,
        location,
        bio,
        avatarUrl,
      });

      toast.success("Profile updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["current-user"] });
      await refetch();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-[24px] bg-white p-7 shadow-2xl transition-all md:p-8 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-6 top-6 flex size-8 items-center justify-center rounded-full bg-[#F7F8FB] text-[#101828] transition-colors hover:bg-[#EAECF0] disabled:opacity-50"
        >
          <Add size="20" variant="Linear" color="#101828" className="rotate-45" />
          <span className="sr-only">Close</span>
        </button>

        {/* Modal Header */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight text-[#2C1810]">
            Profile update
          </h2>
          <p className="text-sm font-medium text-[#475467]">
            Tell us more about you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* Avatar Upload Container (Left-aligned) */}
          <div className="flex flex-col items-start text-left">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex size-24 cursor-pointer items-center justify-center rounded-full bg-[#F2F4F7] border border-[#EAECF0] transition-all hover:border-[#FF5500]"
            >
              {avatarPreview ? (
                <>
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    fill
                    sizes="96px"
                    className={`rounded-full object-cover transition-opacity duration-300 ${
                      isImageFetching ? "opacity-0" : "opacity-100"
                    }`}
                    onLoadingComplete={() => setIsImageFetching(false)}
                    onError={() => setIsImageFetching(false)}
                  />
                  {isImageFetching && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#F2F4F7]">
                      <Loader2 className="size-6 animate-spin text-[#FF5500]" />
                    </div>
                  )}
                </>
              ) : (
                <User size="44" variant="Outline" color="#98A2B3" />
              )}

              {/* White Background Badge with orange Vuesax GalleryAdd icon */}
              <div className="absolute bottom-[2px] right-[2px] flex size-7 items-center justify-center rounded-full bg-white border border-[#EAECF0] shadow-2xs transition-transform group-hover:scale-110">
                <GalleryAdd size="16" variant="Outline" color="#FF5500" />
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-sm font-medium text-[#FF5500] hover:underline"
            >
              Click to upload profile picture
            </button>
            <span className="mt-0.5 text-xs text-[#98A2B3]">
              PNG, JPG or WebP (max. 800x800px)
            </span>
          </div>

          {/* Form Field: Gender (shadcn Select with key force-refresh for async prefill) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#101828]">
              Gender <span className="text-[#FF5500]">*</span>
            </label>
            <Select key={gender || "empty"} value={gender} onValueChange={setGender}>
              <SelectTrigger className="h-11.5 w-full rounded-xl border border-[#D0D5DD] bg-white px-4 text-sm text-[#101828] shadow-none outline-none focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-[#EAECF0] bg-white shadow-lg">
                <SelectItem value="Male" className="cursor-pointer py-2 text-sm text-[#101828]">
                  Male
                </SelectItem>
                <SelectItem value="Female" className="cursor-pointer py-2 text-sm text-[#101828]">
                  Female
                </SelectItem>
                <SelectItem value="male" className="hidden">
                  Male
                </SelectItem>
                <SelectItem value="female" className="hidden">
                  Female
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Form Field: Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#101828]">
              Where are you based? <span className="text-[#FF5500]">*</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your location"
              required
              className="w-full rounded-xl border border-[#D0D5DD] bg-white px-4 py-3 text-sm text-[#101828] placeholder-[#98A2B3] outline-none transition-all focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20"
            />
          </div>

          {/* Form Field: Bio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#101828]">
              Write your Median bio <span className="text-xs text-[#667085]">(Less than 300 words)</span>
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Select area..."
              className="w-full rounded-xl border border-[#D0D5DD] bg-white px-4 py-3 text-sm text-[#101828] placeholder-[#98A2B3] outline-none transition-all focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center rounded-full bg-[#FF5500] py-3.5 text-base font-semibold text-white shadow-xs transition-all hover:bg-[#E04B00] active:scale-[0.98] disabled:opacity-50"
          >
            <span className="text-white font-medium">
              {isSubmitting ? "Updating..." : "Update Profile"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
