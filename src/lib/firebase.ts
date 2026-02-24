import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { apiClient } from "@/api/client";
import { PROFILE_ENDPOINTS } from "@/api/endpoints";

const firebaseConfig = {
  apiKey: "AIzaSyBLl4YmMvCXj3Ft7b0WVFfkH-MNGYiOK2w",
  authDomain: "examprep-485211.firebaseapp.com",
  projectId: "examprep-485211",
  storageBucket: "examprep-485211.firebasestorage.app",
  messagingSenderId: "107672743367",
  appId: "1:107672743367:web:47cdc8b879c4839f7f7de2",
  measurementId: "G-MX80S9GNVS",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      await apiClient.patch(PROFILE_ENDPOINTS.FCM_TOKEN, { fcmToken: token });
    }

    return token;
  } catch (error) {
    console.error("Failed to get notification permission:", error);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  return onMessage(messaging, callback);
}

export { messaging };
