"use client";

import { useEffect, useRef } from "react";
import { Room, RoomEvent } from "livekit-client";
import { messagesService, Message } from "@/services/messages";
import { useCurrentUser } from "@/hooks/use-current-user";

export interface RealtimeMessageEvent {
  type: "NEW_MESSAGE" | "EDIT_MESSAGE" | "DELETE_MESSAGE";
  message?: Message;
  messageId?: string;
  conversationId?: string;
}

interface UseMessagesRealtimeOptions {
  onNewMessage?: (message: Message) => void;
  onEditMessage?: (message: Partial<Message> & { id: string; conversationId: string }) => void;
  onDeleteMessage?: (messageId: string, conversationId: string) => void;
}

/**
 * Connects the current authenticated user to their personal LiveKit real-time room (user_<id>).
 * Receives instantaneous push messages from the NestJS backend and marks the user as Online.
 */
export function useMessagesRealtime(options: UseMessagesRealtimeOptions = {}) {
  const { data: user } = useCurrentUser();
  const roomRef = useRef<Room | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!user?.id) return;

    let isCancelled = false;
    let activeRoom: Room | null = null;

    async function connectInbox() {
      try {
        const { token, serverUrl } = await messagesService.getLiveKitToken();
        if (isCancelled || !token || !serverUrl) return;

        activeRoom = new Room({
          adaptiveStream: false,
          dynacast: false,
        });
        roomRef.current = activeRoom;

        activeRoom.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
          try {
            const raw = new TextDecoder().decode(payload);
            const data = JSON.parse(raw) as RealtimeMessageEvent;

            if (data.type === "NEW_MESSAGE" && data.message) {
              optionsRef.current.onNewMessage?.(data.message);
            } else if (data.type === "EDIT_MESSAGE" && data.message) {
              optionsRef.current.onEditMessage?.(data.message);
            } else if (data.type === "DELETE_MESSAGE" && data.messageId && data.conversationId) {
              optionsRef.current.onDeleteMessage?.(data.messageId, data.conversationId);
            }
          } catch (err) {
            console.warn("[LiveKit Realtime] Error parsing packet:", err);
          }
        });

        await activeRoom.connect(serverUrl, token, {
          autoSubscribe: false,
        });
      } catch (err) {
        // Fall back gracefully if LiveKit credentials or network fails
        console.warn("[LiveKit Realtime] Inbox connection error:", err);
      }
    }

    void connectInbox();

    return () => {
      isCancelled = true;
      if (activeRoom) {
        activeRoom.disconnect().catch(() => {});
        roomRef.current = null;
      }
    };
  }, [user?.id]);

  return { room: roomRef.current };
}
