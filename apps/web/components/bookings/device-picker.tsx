"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface DeviceOption {
  deviceId: string;
  label: string;
}

interface DevicePickerProps {
  /** What is being picked, for screen readers: "Microphone", "Camera", "Speakers" */
  name: string;
  icon: ReactNode;
  devices: DeviceOption[];
  selectedId?: string;
  /** Shown when the browser gives us nothing to choose from */
  fallbackLabel: string;
  onSelect: (deviceId: string) => void;
}

/** A small dropdown for choosing one microphone, camera or speaker */
export function DevicePicker({
  name,
  icon,
  devices,
  selectedId,
  fallbackLabel,
  onSelect,
}: DevicePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = devices.find((d) => d.deviceId === selectedId) ?? devices[0];
  const hasChoice = devices.length > 0;

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={name}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={!hasChoice}
        onClick={() => setIsOpen((open) => !open)}
        className="h-[43px] max-w-[220px] rounded-lg border border-[#D0D5DD] bg-white px-4 text-xs font-medium text-[#344054] inline-flex items-center gap-2.5 hover:bg-[#F9FAFB] transition cursor-pointer disabled:cursor-default disabled:hover:bg-white"
      >
        <span className="shrink-0 text-[#667085]">{icon}</span>
        <span className="truncate">{selected?.label ?? fallbackLabel}</span>
        {hasChoice && <ChevronDown className="size-3.5 shrink-0 text-[#667085]" />}
      </button>

      {isOpen && hasChoice && (
        <ul
          role="listbox"
          aria-label={name}
          className="absolute right-0 top-full z-20 mt-2 max-h-64 w-72 max-w-[80vw] overflow-auto rounded-lg border border-[#EAECF0] bg-white py-1 shadow-lg"
        >
          {devices.map((device) => {
            const isSelected = device.deviceId === selected?.deviceId;
            return (
              <li key={device.deviceId} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(device.deviceId);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-xs font-medium text-[#344054] hover:bg-[#F9FAFB] cursor-pointer"
                >
                  <span className="truncate">{device.label}</span>
                  {isSelected && <Check className="size-3.5 shrink-0 text-[#FF5514]" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
