import type { ReactNode } from "react";
import { Call, Clock, Sms } from "iconsax-react";
import { CONTACT_DETAILS } from "./contact-utils";

interface DetailRowProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}

function DetailRow({ icon, label, children }: DetailRowProps) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF6F0]">{icon}</span>
      <div>
        <p className="text-xs text-[#475467]">{label}</p>
        <p className="mt-1 text-sm font-semibold text-[#4E0703]">{children}</p>
      </div>
    </div>
  );
}

export function ContactDetails() {
  return (
    <div>
      <h2 className="max-w-[16rem] text-3xl font-semibold leading-tight text-[#4E0703] sm:text-[32px]">
        How can we help you today?
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#344054]">
        Fill out the form here and our team will get back to you as soon as possible.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <DetailRow icon={<Sms size="18" variant="Outline" color="#667085" />} label="Email:">
          <a href={`mailto:${CONTACT_DETAILS.email}`} className="!text-[#4E0703] hover:underline">
            {CONTACT_DETAILS.email}
          </a>
        </DetailRow>
        <DetailRow icon={<Call size="18" variant="Outline" color="#667085" />} label="Phone:">
          <a href={`tel:${CONTACT_DETAILS.phone.replaceAll(" ", "")}`} className="!text-[#4E0703] hover:underline">
            {CONTACT_DETAILS.phone}
          </a>
        </DetailRow>
        <DetailRow icon={<Clock size="18" variant="Outline" color="#667085" />} label="Working hours:">
          {CONTACT_DETAILS.hours}
        </DetailRow>
      </div>
    </div>
  );
}
