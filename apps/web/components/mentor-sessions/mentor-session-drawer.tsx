"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { X, UploadCloud } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/base/select";
import { SegmentedTabs, type SegmentedTabItem } from "@/components/ui/custom/segmented-tabs";
import type { MentorSessionDto, MentorSessionInput } from "@/services/mentor-sessions";

export interface SessionFormData {
  id?: string;
  title: string;
  description: string;
  durationMinutes: number;
  isPaid: boolean;
  price: number;
  currency: "NGN" | "USD";
  type: "ONE_ON_ONE" | "GROUP";
  feeHandling: "absorb" | "pass" | "split";
  maxCapacity: number;
  sessionLanguage: string;
  flyerUrl?: string;
}

interface MentorSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MentorSessionInput & { isLive?: boolean }) => Promise<void>;
  editingSession?: MentorSessionDto | null;
  isSaving?: boolean;
}

const SESSION_TYPE_TABS: readonly SegmentedTabItem<"ONE_ON_ONE" | "GROUP">[] = [
  { value: "ONE_ON_ONE", label: "1 on 1 Session" },
  { value: "GROUP", label: "Group Session" },
] as const;

const DURATION_OPTIONS = [
  { label: "15minutes", value: 15 },
  { label: "30minutes", value: 30 },
  { label: "45minutes", value: 45 },
  { label: "60minutes", value: 60 },
  { label: "90minutes", value: 90 },
];

export function MentorSessionDrawer({
  isOpen,
  onClose,
  onSave,
  editingSession,
  isSaving = false,
}: MentorSessionModalProps) {
  const [formData, setFormData] = useState<SessionFormData>({
    title: "",
    description: "",
    durationMinutes: 15,
    isPaid: false,
    price: 0,
    currency: "USD",
    type: "ONE_ON_ONE",
    feeHandling: "absorb",
    maxCapacity: 15,
    sessionLanguage: "English",
  });

  const [requiresConfirmation, setRequiresConfirmation] = useState(true);
  const [priceInput, setPriceInput] = useState("");

  useEffect(() => {
    if (editingSession) {
      const isPaid = (editingSession.price ?? 0) > 0;
      setFormData({
        id: editingSession.id,
        title: editingSession.title,
        description: editingSession.description || "",
        durationMinutes: editingSession.durationMinutes || 15,
        isPaid,
        price: editingSession.price ?? 0,
        currency: "USD",
        type: editingSession.type === "GROUP" ? "GROUP" : "ONE_ON_ONE",
        feeHandling: "absorb",
        maxCapacity: editingSession.maxCapacity ?? 15,
        sessionLanguage: "English",
        flyerUrl: editingSession.flyerUrl || undefined,
      });
      setPriceInput(isPaid ? `${editingSession.price}` : "");
      setRequiresConfirmation(true);
    } else {
      setFormData({
        title: "",
        description: "",
        durationMinutes: 15,
        isPaid: false,
        price: 0,
        currency: "USD",
        type: "ONE_ON_ONE",
        feeHandling: "absorb",
        maxCapacity: 15,
        sessionLanguage: "English",
      });
      setPriceInput("");
      setRequiresConfirmation(true);
    }
  }, [editingSession, isOpen]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const payload: MentorSessionInput = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      durationMinutes: formData.durationMinutes,
      price: formData.isPaid ? Number(priceInput.replace(/[^0-9.]/g, "")) || 0 : 0,
      type: formData.type,
      maxCapacity: formData.type === "GROUP" ? formData.maxCapacity : undefined,
      flyerUrl: formData.flyerUrl,
    };

    await onSave(payload);
  };

  const isGroup = formData.type === "GROUP";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in-0 duration-200 overflow-y-auto">
      <div
        className="relative w-full max-w-[580px] my-auto max-h-[90vh] flex flex-col rounded-[28px] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:px-8 pt-7 pb-4 flex items-start justify-between relative shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-[#101828]">
              {editingSession ? "Edit Session" : "Create a Session"}
            </h2>
            <p className="mt-1 text-sm text-[#475467]">
              {editingSession ? "Update your session details" : "Tell us more about you."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-[#F7F8FB] text-[#667085] hover:bg-[#EAECF0] hover:text-[#101828] transition"
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:px-8 space-y-6">
          {/* Top Session Type Segmented Switcher (left-aligned, not full width, reusing SegmentedTabs) */}
          <div className="flex justify-start">
            <SegmentedTabs<"ONE_ON_ONE" | "GROUP">
              tabs={SESSION_TYPE_TABS}
              activeTab={formData.type}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, type: val }))
              }
              size="lg"
            />
          </div>

          <form id="session-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Session Title */}
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1.5">
                Session Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g Get to Know Me"
                className="w-full rounded-xl border border-[#D0D5DD] px-4 py-3 h-12 text-sm text-[#101828] placeholder:text-[#98A2B3] focus:border-[#FF5514] focus:outline-hidden focus:ring-2 focus:ring-[#FF5514]/20 transition"
              />
            </div>

            {/* If Group Session: Description comes before flyer */}
            {isGroup && (
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1.5">
                  Description <span className="text-[#FF5514]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe what mentees can expect from this session"
                  className="w-full rounded-xl border border-[#D0D5DD] p-3.5 text-sm text-[#101828] placeholder:text-[#98A2B3] focus:border-[#FF5514] focus:outline-hidden focus:ring-2 focus:ring-[#FF5514]/20 transition resize-none"
                />
              </div>
            )}

            {/* Flyer Upload Box (Group Session only) */}
            {isGroup && (
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1.5">
                  Session flyer
                </label>
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#EAECF0] p-6 text-center hover:border-[#FF5514]/40 transition bg-[#FAFAFA]">
                  <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-xs text-[#475467] mb-2">
                    <UploadCloud className="size-5 text-[#475467]" />
                  </div>
                  <p className="text-sm font-medium text-[#475467]">
                    <span className="text-[#FF5514] font-semibold cursor-pointer hover:underline">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-[#98A2B3]">
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </p>
                </div>
              </div>
            )}

            {/* Duration: Shadcn Select */}
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1.5">
                Duration
              </label>
              <Select
                value={String(formData.durationMinutes)}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, durationMinutes: Number(val) }))
                }
              >
                <SelectTrigger className="h-12 w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-sm text-[#101828] bg-white focus-visible:border-[#FF5514] focus-visible:ring-2 focus-visible:ring-[#FF5514]/20">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-[#EAECF0] bg-white shadow-lg">
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price: Shadcn Select (Free / Paid) */}
            <div>
              <label className="block text-sm font-medium text-[#344054] mb-1.5">
                Price
              </label>
              <Select
                value={formData.isPaid ? "Paid" : "Free"}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, isPaid: val === "Paid" }))
                }
              >
                <SelectTrigger className="h-12 w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-sm text-[#101828] bg-white focus-visible:border-[#FF5514] focus-visible:ring-2 focus-visible:ring-[#FF5514]/20">
                  <SelectValue placeholder="Select price" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-[#EAECF0] bg-white shadow-lg">
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Free Mode: Requires confirmation with toggle switch matching Figma */}
            {!formData.isPaid ? (
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h4 className="text-sm font-semibold text-[#101828]">
                    Requires confirmation
                  </h4>
                  <p className="mt-0.5 text-xs sm:text-sm text-[#475467]">
                    You have to approve booking requests before they&apos;re confirmed.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRequiresConfirmation(!requiresConfirmation)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    requiresConfirmation ? "bg-[#FF5514]" : "bg-[#EAECF0]"
                  }`}
                  role="switch"
                  aria-checked={requiresConfirmation}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      requiresConfirmation ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <p className="text-sm text-[#475467]">
                  Paid sessions are automatically accepted
                </p>

                {/* Currency & Amount Input Row */}
                <div className="flex gap-2.5">
                  <div className="w-32 shrink-0">
                    <Select
                      value={formData.currency}
                      onValueChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          currency: val as "NGN" | "USD",
                        }))
                      }
                    >
                      <SelectTrigger className="h-12 w-full rounded-xl border border-[#D0D5DD] px-3.5 py-3 text-sm font-medium text-[#101828] bg-white focus-visible:border-[#FF5514] focus-visible:ring-2 focus-visible:ring-[#FF5514]/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border border-[#EAECF0] bg-white shadow-lg">
                        <SelectItem value="USD">USD $</SelectItem>
                        <SelectItem value="NGN">NGN ₦</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <input
                    type="text"
                    required
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 h-12 rounded-xl border border-[#D0D5DD] px-4 py-3 text-sm text-[#101828] placeholder:text-[#98A2B3] focus:border-[#FF5514] focus:outline-hidden focus:ring-2 focus:ring-[#FF5514]/20 transition"
                  />
                </div>
                <p className="text-xs text-[#667085]">
                  Set your per-session rate. Median charges 10% + $1 (USD)
                </p>

                {/* Fee Handling Radio Group - All 3 on a single line */}
                <div className="pt-2">
                  <label className="block text-sm font-medium text-[#344054] mb-2">
                    Fee handling
                  </label>
                  <div className="flex flex-wrap items-center gap-6">
                    {[
                      { value: "absorb", label: "I'll absorb the fee" },
                      { value: "pass", label: "Pass fee to mentee" },
                      { value: "split", label: "Split fee 50-50" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer text-sm text-[#344054]"
                      >
                        <input
                          type="radio"
                          name="feeHandling"
                          value={option.value}
                          checked={formData.feeHandling === option.value}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              feeHandling: option.value as any,
                            }))
                          }
                          className="size-4 accent-[#FF5514]"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-[#667085]">
                    If passed on, the fee is added to the mentee's total at checkout.
                  </p>
                </div>
              </div>
            )}

            {/* Additional Fields for Group Session */}
            {isGroup && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-1.5">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={formData.maxCapacity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        maxCapacity: Math.min(15, Math.max(1, Number(e.target.value) || 1)),
                      }))
                    }
                    className="w-full h-12 rounded-xl border border-[#D0D5DD] px-4 py-3 text-sm text-[#101828] focus:border-[#FF5514] focus:outline-hidden focus:ring-2 focus:ring-[#FF5514]/20 transition"
                  />
                  <p className="mt-1.5 text-xs text-[#F04438]">
                    You can't have more than 15 people in a group session
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#344054] mb-1.5">
                    Session Language
                  </label>
                  <Select
                    value={formData.sessionLanguage}
                    onValueChange={(val) =>
                      setFormData((prev) => ({
                        ...prev,
                        sessionLanguage: val,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 w-full rounded-xl border border-[#D0D5DD] px-4 py-3 text-sm text-[#101828] bg-white focus-visible:border-[#FF5514] focus-visible:ring-2 focus-visible:ring-[#FF5514]/20">
                      <SelectValue placeholder="English" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-[#EAECF0] bg-white shadow-lg">
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="Portuguese">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* If 1 on 1 Session: Description is at the bottom */}
            {!isGroup && (
              <div>
                <label className="block text-sm font-medium text-[#344054] mb-1.5">
                  Description <span className="text-[#FF5514]">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe what mentees can expect from this session"
                  className="w-full rounded-xl border border-[#D0D5DD] p-3.5 text-sm text-[#101828] placeholder:text-[#98A2B3] focus:border-[#FF5514] focus:outline-hidden focus:ring-2 focus:ring-[#FF5514]/20 transition resize-none"
                />
              </div>
            )}
          </form>
        </div>

        {/* Modal Footer Action Button */}
        <div className="p-6 sm:px-8 pt-4 border-t border-[#EAECF0] bg-white shrink-0">
          <button
            type="submit"
            form="session-form"
            disabled={isSaving || !formData.title.trim()}
            className="w-full h-12 rounded-full bg-[#FF5514] text-sm font-semibold text-white transition hover:bg-[#E0480F] disabled:opacity-50 shadow-xs"
          >
            {isSaving
              ? "Saving..."
              : editingSession
              ? "Save changes"
              : "Create session"}
          </button>
        </div>
      </div>
    </div>
  );
}
