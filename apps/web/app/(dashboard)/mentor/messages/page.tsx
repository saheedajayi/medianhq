import { Suspense } from "react";
import { MessagesView } from "@/components/messages/messages-view";

export const metadata = {
  title: "Messages",
  description: "Your conversation history with mentees.",
};

export default function MentorMessagesPage() {
  // MessagesView reads ?with= to open a chat, which needs a Suspense boundary
  return (
    <Suspense>
      <MessagesView />
    </Suspense>
  );
}

