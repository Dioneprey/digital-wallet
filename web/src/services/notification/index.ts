import { get, request } from "@/common/util/fetch";

export interface Notification {
  id: string;
  title: string;
  content: string;
  readedAt: Date | null;
  createdAt: Date;
  recipientId: string;
}

interface FetchNotificationsProps {
  pageIndex?: number;
  pageSize?: number;
  onlyUnseen?: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  meta: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export async function fetchNotifications({
  onlyUnseen,
  pageIndex,
  pageSize,
}: FetchNotificationsProps): Promise<NotificationsResponse> {
  const data = await get<NotificationsResponse>({
    path: "notifications",
    params: {
      onlyUnseen,
      pageIndex,
      pageSize,
    },
  });

  return data;
}

export async function markAsRead(notificationId: string) {
  await request({
    method: "PATCH",
    path: `notifications/${notificationId}/read`,
    data: {},
  });
}

export async function markAsUnread(notificationId: string) {
  await request({
    method: "PATCH",
    path: `notifications/${notificationId}/unread`,
    data: {},
  });
}
