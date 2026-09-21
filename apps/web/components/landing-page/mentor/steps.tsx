import { CloudUpload } from "lucide-react";
import Image from "next/image";
import { SubmittedCheckIcon } from "@/components/ui/submitted-check-icon";
import { LandingStepCard } from "../shared/step-card";

function FormPreview() {
  return (
    <div className="flex h-[244px] w-full max-w-[352px] flex-col justify-center rounded-lg bg-white px-2.5 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
      <h4 className="text-center text-xs font-bold text-[#4E0703]">Apply to mentor</h4>
      <p className="text-center text-[7px] text-[#667085]">Tell us your professional background.</p>
      <div className="mb-2 mt-1 flex justify-center gap-1"><span className="h-1 w-3 rounded-full bg-[#FF5514]" /><span className="size-1 rounded-full bg-[#FFCAB6]" /></div>
      {[
        ["Current role", "Data Analyst"],
        ["Company", "Company Name"],
        ["Industry", "Business"],
        ["Years of experience", "4 to 5"],
        ["Where are you based?", "Enter your location"],
      ].map(([label, value]) => (
        <div key={label} className="mb-1">
          <p className="text-[6px] font-medium text-[#344054]">{label}</p>
          <div className="flex h-[17px] items-center rounded border border-[#E4E7EC] px-1.5 text-[6px] text-[#98A2B3]">{value}</div>
        </div>
      ))}
      <div className="mt-2 rounded-full bg-[#FF5514] py-1 text-center text-[7px] font-semibold text-white">Continue</div>
    </div>
  );
}

function ReviewPreview() {
  return (
    <div className="flex h-[205px] w-full max-w-[380px] flex-col items-center justify-center rounded-xl bg-white px-5 text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
      <SubmittedCheckIcon compact />
      <h4 className="mt-4 text-base font-bold text-[#4E0703]">Submitted!</h4>
      <p className="mx-auto mt-1 max-w-[265px] text-[10px] leading-snug text-[#475467]">
        Your application has been successfully submitted. You&apos;ll get an email when the team verifies your profile.
      </p>
      <div className="mt-5 w-[190px] rounded-full bg-[#FF5514] py-2 text-[10px] font-semibold text-white">Go to Dashboard</div>
    </div>
  );
}

function ProfilePreview() {
  return (
    <div className="flex h-[285px] w-full max-w-[292px] flex-col rounded-xl bg-white px-3 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
      <h4 className="text-center text-xs font-bold text-[#4E0703]">Profile update</h4>
      <p className="text-center text-[7px] text-[#667085]">Tell us more about you.</p>
      <div className="mb-3 mt-1 flex justify-center gap-1"><span className="size-1 rounded-full bg-[#FFCAB6]" /><span className="h-1 w-3 rounded-full bg-[#FF5514]" /></div>
      <p className="mb-0.5 text-[7px] font-medium text-[#344054]">Skills *</p>
      <div className="mb-2 flex h-6 items-center gap-1 rounded border border-[#D0D5DD] px-1.5 text-[7px] text-[#475467]"><span className="rounded bg-[#F2F4F7] px-1">Product discovery ×</span><span className="rounded bg-[#F2F4F7] px-1">User research ×</span></div>
      <p className="mb-0.5 text-[7px] font-medium text-[#344054]">Tools *</p>
      <div className="mb-2 flex h-6 items-center gap-1 rounded border border-[#D0D5DD] px-1.5 text-[7px] text-[#475467]"><span className="rounded bg-[#F2F4F7] px-1">Claude AI ×</span><span className="rounded bg-[#F2F4F7] px-1">Whimsical ×</span></div>
      <p className="mb-0.5 text-[7px] font-medium text-[#344054]">Certificates</p>
      <div className="mb-3 flex h-14 flex-col items-center justify-center rounded border border-[#D0D5DD] text-[7px] text-[#98A2B3]"><CloudUpload size={12} className="mb-1 text-[#475467]" /><span><b className="text-[#FF5514]">Click to upload</b> or drag and drop</span></div>
      <div className="mt-auto rounded-full bg-[#FF5514] py-1.5 text-center text-[7px] font-semibold text-white">Update Profile</div>
    </div>
  );
}

function SessionsPreview() {
  return (
    <div className="flex h-[311px] w-full max-w-[380px] flex-col justify-center rounded-xl border border-[#EAECF0] bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
      <h4 className="mb-3 text-[10px] font-semibold tracking-wide text-[#344054]">UPCOMING SESSIONS</h4>
      {[0, 1, 2].map((index) => (
        <div key={index} className="mb-2 rounded-xl bg-[#F7F8FC] px-3 py-2.5 last:mb-0">
          <div className="flex items-center gap-2">
            <Image src="/landing-page/mentor-female.png" alt="" width={32} height={32} className="size-8 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-[#101828]">Hannah Oladejo</p>
              <p className="text-[9px] text-[#667085]">{index ? "Free One-on-One session" : "30 mins CV review session"}</p>
            </div>
            {index === 0 && <span className="rounded-full bg-[#FF5514] px-2.5 py-1 text-[9px] text-white">Join now</span>}
          </div>
          <p className="mt-1 text-[9px] text-[#667085]">June 8th, 2026&nbsp; • &nbsp;03:00 pm - 03:30 pm</p>
        </div>
      ))}
    </div>
  );
}

const steps = [
  {
    title: "Set up an account",
    description: "Create a median account and fill in the mentor application: your role, your experience and the topics you can help with.",
    preview: <FormPreview />,
  },
  {
    title: "Internal Review",
    description: "Our team reads every application. It can take up to a week, and roughly 30% of applicants are approved.",
    preview: <ReviewPreview />,
  },
  {
    title: "Set up your profile",
    description: "Once your application is approved, set up your profile by adding your availability, session length and a short bio so mentees can find and book you.",
    preview: <ProfilePreview />,
  },
  {
    title: "Host your first session",
    description: "After profile completion, host your first free or paid session and share from your wealth of experience.",
    preview: <SessionsPreview />,
  },
];

export function MentorSteps() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#FF5514] sm:text-4xl">
            Become a mentor in four steps
          </h2>
          <p className="mt-4 text-base text-[#475467] sm:text-lg">
            Mentoring can help you turn your passion into conversations, friendships and network globally
          </p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-12">
          {steps.map((step) => (
            <LandingStepCard key={step.title} title={step.title} description={step.description}>
              <div className="flex h-[350px] w-full items-center justify-center rounded-xl bg-[#FDF9F6] p-4 sm:h-[370px] sm:rounded-2xl sm:p-6">
                {step.preview}
              </div>
            </LandingStepCard>
          ))}
        </div>
      </div>
    </section>
  );
}
