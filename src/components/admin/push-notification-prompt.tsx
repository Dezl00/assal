"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PushNotificationPrompt({
  title = "تفعيل الإشعارات",
  description = "احصل على تنبيهات فورية عند استلام طلبات جديدة مباشرة على جهازك لتتمكن من متابعتها بسهولة.",
  isAdmin = false
}: {
  title?: string;
  description?: string;
  isAdmin?: boolean;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkNotification = () => {
      if (!("Notification" in window)) return;
      if (Notification.permission === "granted") {
        // Silently update subscription so backend gets latest role (e.g. if they just logged in as Admin)
        import("@/lib/push-client").then(m => m.registerServiceWorkerAndSubscribe().catch(() => {}));
        return;
      }

      const lastPromptTime = localStorage.getItem("lastPushPromptTime");
      const now = new Date().getTime();

      // Show if no last prompt time or if 30 minutes have passed (30 * 60 * 1000)
      if (!lastPromptTime || now - parseInt(lastPromptTime) > 30 * 60 * 1000) {
        setShow(true);
      }
    };

    // Check after a short delay so it's not too aggressive on load
    const timer = setTimeout(checkNotification, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    try {
      const { registerServiceWorkerAndSubscribe } = await import("@/lib/push-client");
      const subscription = await registerServiceWorkerAndSubscribe();
      
      if (subscription || Notification.permission === "granted") {
        setShow(false);
      } else {
        handleDismiss();
      }
    } catch (e) {
      console.error(e);
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("lastPushPromptTime", new Date().getTime().toString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] w-full max-w-sm bg-card border border-border/50 rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-5">
      <button 
        onClick={handleDismiss}
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
          <Bell className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-1 text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <div className="flex gap-2">
            <Button onClick={handleEnable} className="flex-1 rounded-xl">
              تفعيل الآن
            </Button>
            <Button variant="outline" onClick={handleDismiss} className="flex-1 rounded-xl">
              لاحقاً
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
