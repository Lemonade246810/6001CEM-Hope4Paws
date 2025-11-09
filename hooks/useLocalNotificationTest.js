// ✅ SAFE for Expo Go + ready for dev build
import Constants from "expo-constants";
import { useEffect, useState } from "react";

export function useLocalNotificationTest() {
  const [Notifications, setNotifications] = useState(null);

  useEffect(() => {
    // ✅ Only load expo-notifications if not running in Expo Go
    if (Constants.appOwnership !== "expo") {
      import("expo-notifications").then((module) => {
        const notif = module.default || module;

        // Configure behavior when app is foregrounded
        notif.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });

        setNotifications(notif);
      });
    } else {
      console.log(
        "⚠️ Running in Expo Go → expo-notifications disabled. Using alert() fallback."
      );
    }
  }, []);

  // ✅ Trigger notification based on environment
  const triggerLocalNotification = async () => {
    if (Constants.appOwnership === "expo") {
      // ✅ Expo Go fallback
      alert("🔔 Simulated notification (Expo Go mode)");
      return;
    }

    if (!Notifications) {
      console.log("⚠️ Notification module not ready yet.");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🐾 Rescue Alert",
        body: "This is a REAL local notification.",
      },
      trigger: null,
    });
  };

  return { triggerLocalNotification };
}
