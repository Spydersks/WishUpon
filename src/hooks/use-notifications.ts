
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

export function useNotifications() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Notifications Not Supported',
        description: 'This browser does not support desktop notifications.',
        variant: 'destructive',
      });
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      toast({
        title: 'Notifications Enabled!',
        description: "You'll now receive birthday alerts.",
      });
    } else if (permission === 'denied') {
      toast({
        title: 'Notifications Blocked',
        description: 'Please enable notifications in your browser settings to receive alerts.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const showNotification = useCallback((title: string, body: string) => {
    if (notificationPermission !== 'granted') {
      return;
    }

    const options: NotificationOptions = {
      body,
      icon: '/favicon.ico', // Optional: You can add an icon for your app
      badge: '/android-chrome-192x192.png', // Optional: For Android devices
    };

    try {
        new Notification(title, options);
    } catch (error) {
        console.error("Error showing notification:", error);
    }
    
  }, [notificationPermission]);

  return { notificationPermission, requestNotificationPermission, showNotification };
}
