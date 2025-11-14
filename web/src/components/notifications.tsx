import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellMinus } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/common/hooks/use-notifications";
import { formatDate } from "@/common/util/format-date";

export function Notifications() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNextPage,
    hasNextPage,
    markAsRead,
  } = useNotifications();

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notificações</h3>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {notifications?.length > 0 ? (
              notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      !notification.readedAt
                        ? "bg-accent/50"
                        : "hover:bg-accent/30"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.readedAt && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                      )}
                    </div>
                  </div>
                  {index < notifications.length - 1 && (
                    <Separator className="my-1" />
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center pt-8 h-full text-center text-muted-foreground">
                <div className="bg-muted rounded-full p-4 mb-4">
                  <BellMinus className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">
                  Nenhuma notificação encontrada
                </p>
                <p className="text-sm text-muted-foreground">
                  Suas notificações aparecerão aqui.
                </p>
              </div>
            )}
            {hasNextPage && (
              <div className="text-center py-2">
                <Button variant="ghost" onClick={() => fetchNextPage()}>
                  Mais...
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
