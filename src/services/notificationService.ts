import { NotificationItem } from "../types/tournament";

type NotificationListener = (notifications: NotificationItem[]) => void;

class NotificationService {
  private notifications: NotificationItem[] = [
    {
      id: "notif_01",
      title: "Tournament Starting Soon!",
      message: "Mumbai Masters Arena 3+0 starts in 5 minutes. Get ready!",
      type: "tournament",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "notif_02",
      title: "Daily Puzzle Available",
      message: "Today's tactics puzzle is ready. Solve it to maintain your 5-day streak!",
      type: "puzzle",
      read: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: "notif_03",
      title: "Season 14 Rewards Reset",
      message: "Congratulations! Your rating badge and 1000 XP reward have been deposited.",
      type: "season",
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  private listeners: Set<NotificationListener> = new Set();

  subscribe(listener: NotificationListener) {
    this.listeners.add(listener);
    listener(this.notifications);
    return () => this.listeners.delete(listener);
  }

  getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  markAllAsRead(): void {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.notify();
  }

  triggerNotification(title: string, message: string, type: NotificationItem["type"], actionUrl?: string): void {
    const item: NotificationItem = {
      id: "notif_" + Date.now(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl,
    };
    this.notifications.unshift(item);
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.notifications));
  }
}

export const notificationService = new NotificationService();
