// hooks/useRegisterVolunteerToken.js
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { doc, updateDoc } from "firebase/firestore";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";
import { db } from "../config/firebaseConfig";
import { useAuth } from "../context/authContext";

// Configure notification behavior when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // show alert in foreground
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests permission, retrieves the Expo push token, and configures Android channel.
 * Works only in development or production builds — not in Expo Go.
 */
export async function registerForPushAsync() {
  try {
    // Skip push registration in Expo Go
    if (Constants.appOwnership === "expo") {
      console.log("⚠️ Skipping push token registration — not supported in Expo Go.");
      return null;
    }

    // Must be on a physical device
    if (!Device.isDevice) {
      console.log("❌ Push notifications require a physical device.");
      return null;
    }

    // Ask notification permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("🚫 Permission for notifications denied.");
      return null;
    }

    // Get Expo push token
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId,
    });

    const token = tokenResponse.data;
    console.log("📱 Expo push token:", token);

    // Configure Android channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FFAA00",
      });
    }

    return token;
  } catch (error) {
    console.error("❌ Error registering for push notifications:", error);
    return null;
  }
}

/**
 * Custom hook: saves the volunteer’s Expo push token to Firestore
 * and listens for incoming notifications.
 */
export function useRegisterVolunteerToken() {
  const { user } = useAuth();

  useEffect(() => {
    let subscription;

    (async () => {
      if (!user?.userId) return;

      try {
        const token = await registerForPushAsync();

        // Save token if exists
        if (token) {
          const ref = doc(db, "users", user.userId);
          await updateDoc(ref, { fcmToken: token });
          console.log("✅ Volunteer push token saved to Firestore!");
        } else {
          console.log("⚠️ No token generated (Expo Go or denied permissions).");
        }
      } catch (error) {
        console.error("⚠️ Error saving push token:", error);
      }

      // Listen for notifications (foreground)
      subscription = Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification received:", notification);

        try {
          const title = notification.request.content.title || "Notification";
          const body = notification.request.content.body || "New message received.";
          Alert.alert(title, body);
        } catch (e) {
          console.log("⚠️ Error displaying alert:", e);
        }
      });
    })();

    // Cleanup listener on unmount
    return () => {
      if (subscription) subscription.remove();
    };
  }, [user?.userId]);
}
