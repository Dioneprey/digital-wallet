import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./use-socket";
import {
  fetchNotifications,
  markAsRead,
  markAsUnread,
  type Notification,
} from "@/services/notification";
import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";

interface NotificationEvent {
  type: string;
  notification: Notification | null;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAsUnread: (notificationId: string) => Promise<void>;
  fetchNextPage: () => void;
  refresh: () => void;
  clearNotifications: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const { isConnected, on } = useSocket();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetchingNextPage: isLoadingMore,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam = 1 }) =>
      fetchNotifications({
        pageIndex: pageParam,
        pageSize: 10,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const { pageIndex, totalPages } = lastPage.meta;
      const nextPageIndex = pageIndex + 1;

      if (nextPageIndex < totalPages) {
        return nextPageIndex;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const unreadCount = notifications.filter((n) => !n.readedAt).length;

  useEffect(() => {
    const handleNewNotification = (data: { refresh?: boolean }) => {
      if (data.refresh) {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    };

    on("new-notification", handleNewNotification);
  }, [on, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData(["notifications"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            notifications: page.notifications.map((n: Notification) =>
              n.id === notificationId ? { ...n, readedAt: new Date() } : n
            ),
          })),
        };
      });
    },
  });

  const markAsUnreadMutation = useMutation({
    mutationFn: markAsUnread,
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData(["notifications"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            notifications: page.notifications.map((n: Notification) =>
              n.id === notificationId ? { ...n, readedAt: null } : n
            ),
          })),
        };
      });
    },
  });

  const clearNotifications = useCallback(() => {
    queryClient.setQueryData(["notifications"], undefined);
  }, [queryClient]);

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    isLoadingMore,
    hasNextPage: hasNextPage ?? false,
    markAsRead: markAsReadMutation.mutateAsync,
    markAsUnread: markAsUnreadMutation.mutateAsync,
    fetchNextPage,
    refresh,
    clearNotifications,
  };
}
