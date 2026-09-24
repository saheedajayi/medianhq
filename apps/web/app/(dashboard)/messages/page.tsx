import { Metadata } from "next";
import { MessagesView } from "@/components/messages/messages-view";

export const metadata: Metadata = {
  title: "Messages | Median",
  description: "Your conversation history with mentors.",
};

export default function MessagesPage() {
  return <MessagesView />;
}
