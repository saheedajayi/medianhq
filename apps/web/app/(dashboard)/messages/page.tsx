import { Metadata } from "next";
import { Suspense } from "react";
import { MessagesView } from "@/components/messages/messages-view";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your conversation history with mentors.",
};

export default function MessagesPage() {
  // MessagesView reads ?with= to open a chat, which needs a Suspense boundary
  return (
    <Suspense>
      <MessagesView />
    </Suspense>
  );
}
