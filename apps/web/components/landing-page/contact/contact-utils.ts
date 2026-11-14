import { z } from "zod";
import { CONTACT_SUBJECTS } from "@/services/contact";

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  subject: z.enum(CONTACT_SUBJECTS, { message: "Choose a subject." }),
  message: z.string().trim().min(1, "Write your message.").max(5000, "Keep your message under 5,000 characters."),
});

export type ContactFieldErrors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>;

export const CONTACT_DETAILS = {
  email: "hello@medianhq.co",
  phone: "+234 808 500 8872",
  hours: "Monday - Friday (8am - 5pm)",
};

/** The questions the Contact Us page answers, with the ones shown open */
export const CONTACT_FAQ_QUESTIONS = [
  "Is it really free?",
  "How are mentors vetted?",
  "How do sessions work?",
  "Can I be both a mentor and a mentee?",
  "What if a mentor doesn't show up?",
  "Is Median only for Nigerian professionals?",
];
export const CONTACT_FAQ_OPEN = CONTACT_FAQ_QUESTIONS.slice(1);

export const contactInputClass =
  "h-11 w-full rounded-lg border border-[#D0D5DD] bg-white px-3.5 text-sm text-[#101828] placeholder:text-[#98A2B3] outline-none transition-colors focus:border-[#FF5514] focus:ring-2 focus:ring-[#FF5514]/15 aria-[invalid=true]:border-red-500";
