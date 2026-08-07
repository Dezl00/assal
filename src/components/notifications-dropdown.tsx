"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Bell, Check, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function NotificationsDropdown({ isAdmin = false }: { isAdmin?: boolean }) {
  const { data, mutate } = useSWR("/api/notifications", fetcher, {
    refreshInterval: 10000, // Poll every 10 seconds
  });

  const prevUnreadRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element for playing notification sound
    audioRef.current = new Audio("/sounds/bell.ogg");
  }, []);

  useEffect(() => {
    if (data?.unreadCount !== undefined) {
      // If unread count increased, play sound
      if (data.unreadCount > prevUnreadRef.current && isAdmin) {
        audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
      }
      prevUnreadRef.current = data.unreadCount;
    }
  }, [data?.unreadCount, isAdmin]);

  const markAllAsRead = async () => {
    if (!data?.notifications) return;
    const unreadIds = data.notifications.filter((n: any) => !n.isRead).map((n: any) => n.id);
    if (unreadIds.length === 0) return;

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: unreadIds }),
    });
    mutate();
  };

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    mutate();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          {data?.unreadCount > 0 && (
            <span className="absolute top-1 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-background">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-semibold text-sm">الإشعارات</h3>
          {data?.unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-primary hover:text-primary/80">
              <Check className="w-3 h-3 mr-1" />
              تحديد كـ مقروء
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {!data?.notifications || data.notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
              لا توجد إشعارات جديدة
            </div>
          ) : (
            <div className="flex flex-col">
              {data.notifications.map((notif: any) => (
                <Link
                  key={notif.id}
                  href={notif.link || "#"}
                  onClick={() => { if (!notif.isRead) markAsRead(notif.id) }}
                  className={`p-3 text-sm border-b border-border/50 hover:bg-muted/50 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-medium text-[13px]">{notif.title}</div>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</div>
                  <div className="text-[10px] text-muted-foreground/70 mt-2">
                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ar })}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
