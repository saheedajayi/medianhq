"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/services/api-client";
import {
  messagesService,
  type ContactResponse,
  type ConversationSummary,
  type EditMessageVariables,
  type Message,
  type RealtimeTokenResponse,
  type ReportMessagePayload,
  type SendMessagePayload,
} from "@/services/messages";
import { messagesQueryKeys } from "./query-keys";

export const useConversations = () => {
  return useQuery<ConversationSummary[], ApiError>({
    queryKey: messagesQueryKeys.conversations(),
    queryFn: async () => {
      const response = await messagesService.listConversations();
      return response.data;
    },
  });
};

export const useConversationMessages = (
  conversationId: string | null,
  options?: { enabled?: boolean }
) => {
  return useQuery<Message[], ApiError>({
    queryKey: messagesQueryKeys.thread(conversationId ?? ""),
    queryFn: async () => {
      const response = await messagesService.getMessages(conversationId!);
      return response.data;
    },
    enabled: !!conversationId && (options?.enabled ?? true),
  });
};

// Tokens are short-lived and single-use per connection, so fetch one fresh each time
export const useRealtimeToken = () => {
  return useMutation<RealtimeTokenResponse, ApiError, void>({
    mutationKey: messagesQueryKeys.realtimeToken(),
    mutationFn: async () => {
      const response = await messagesService.getLiveKitToken();
      return response.data;
    },
  });
};

const useInvalidateConversations = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: messagesQueryKeys.conversations() });
};

export const useSendMessage = () => {
  const invalidateConversations = useInvalidateConversations();

  return useMutation<Message, ApiError, SendMessagePayload>({
    mutationKey: messagesQueryKeys.send(),
    mutationFn: async (payload) => {
      const response = await messagesService.sendMessage(payload);
      return response.data;
    },
    // Last-message previews and ordering in the sidebar change. Not returned, so the
    // message shows as sent without waiting for the whole list to reload
    onSuccess: () => {
      void invalidateConversations();
    },
  });
};

export const useEditMessage = () => {
  return useMutation<Message, ApiError, EditMessageVariables>({
    mutationKey: messagesQueryKeys.edit(),
    mutationFn: async ({ messageId, content }) => {
      const response = await messagesService.editMessage(messageId, { content });
      return response.data;
    },
  });
};

export const useDeleteMessage = () => {
  return useMutation<{ success: boolean }, ApiError, string>({
    mutationKey: messagesQueryKeys.remove(),
    mutationFn: async (messageId) => {
      const response = await messagesService.deleteMessage(messageId);
      return response.data;
    },
  });
};

export const useMarkConversationRead = () => {
  const invalidateConversations = useInvalidateConversations();

  return useMutation<{ success: boolean }, ApiError, string>({
    mutationKey: messagesQueryKeys.markRead(),
    mutationFn: async (conversationId) => {
      const response = await messagesService.markConversationRead(conversationId);
      return response.data;
    },
    // Unread counts in the sidebar change
    onSuccess: invalidateConversations,
  });
};

export const useReportMessage = () => {
  return useMutation<{ success: boolean }, ApiError, ReportMessagePayload>({
    mutationKey: messagesQueryKeys.report(),
    mutationFn: async (payload) => {
      const response = await messagesService.reportMessage(payload);
      return response.data;
    },
  });
};

/** The chat to open for ?with=<userId>, e.g. from "Send message" on a booking */
export const useContact = (userId: string | null) => {
  return useQuery<ContactResponse, ApiError>({
    queryKey: messagesQueryKeys.contact(userId ?? ""),
    queryFn: async () => {
      const response = await messagesService.getContact(userId!);
      return response.data;
    },
    enabled: !!userId,
    retry: false,
  });
};

export const useMarkDelivered = () => {
  return useMutation<{ success: boolean }, ApiError, string>({
    mutationKey: messagesQueryKeys.delivered(),
    mutationFn: async (conversationId) => {
      const response = await messagesService.markDelivered(conversationId);
      return response.data;
    },
  });
};
