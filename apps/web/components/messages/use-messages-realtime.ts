"use client";

import { useEffect, useRef } from "react";
import { Room, RoomEvent } from "livekit-client";
import type { Message } from "@/services/messages";
import { useRealtimeToken } from "@/services/messages/queries/messages.queries";
import { useCurrentUser } from "@/services/auth/queries/auth.queries";

export interface RealtimeMessageEvent {
  type: "NEW_MESSAGE" | "EDIT_MESSAGE" | "DELETE_MESSAGE" | "MESSAGES_DELIVERED" | "MESSAGES_READ";
  message?: Message;
  messageId?: string;
  conversationId?: string;
  deliveredAt?: string;
}

interface UseMessagesRealtimeOptions {
  onNewMessage?: (message: Message) => void;
  onEditMessage?: (message: Partial<Message> & { id: string; conversationId: string }) => void;
  onDeleteMessage?: (messageId: string, conversationId: string) => void;
  /** The other person's app received your messages in this conversation */
  onMessagesDelivered?: (conversationId: string, deliveredAt: string) => void;
  /** The other person opened this conversation */
  onMessagesRead?: (conversationId: string) => void;
}

/**
 * Connects the current authenticated user to their personal LiveKit real-time room (user_<id>).
 * Receives instantaneous push messages from the NestJS backend and marks the user as Online.
 */
export function useMessagesRealtime(options: UseMessagesRealtimeOptions = {}) {
  const { data: user } = useCurrentUser();
  const roomRef = useRef<Room | null>(null);
  const { mutateAsync: fetchRealtimeToken } = useRealtimeToken();

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!user?.id) return;

    let isCancelled = false;
    let activeRoom: Room | null = null;

    async function connectInbox() {
      try {
        const { token, serverUrl } = await fetchRealtimeToken();
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
            } else if (data.type === "MESSAGES_DELIVERED" && data.conversationId) {
              optionsRef.current.onMessagesDelivered?.(
                data.conversationId,
                data.deliveredAt ?? new Date().toISOString()
              );
            } else if (data.type === "MESSAGES_READ" && data.conversationId) {
              optionsRef.current.onMessagesRead?.(data.conversationId);
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
  }, [user?.id, fetchRealtimeToken]);

  return { room: roomRef.current };
}
