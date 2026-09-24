import { MessagesView } from "@/components/messages/messages-view";

export const metadata = {
  title: "Messages | Median",
  description: "Your conversation history with mentees.",
};

export default function MentorMessagesPage() {
  return <MessagesView />;
}

