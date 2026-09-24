import { MessagesView } from "@/components/messages/messages-view";

export const metadata = {
  title: "Messages | Median",
  description: "Your conversation history with mentors.",
};

export default function MenteeMessagesPage() {
  return <MessagesView />;
}
