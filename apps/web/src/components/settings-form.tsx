"use client";

import { useState } from "react";
import { Btn } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { urlBase64ToUint8Array } from "@/lib/utils";

interface Preferences {
  id: string;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  emailMode: string;
  timezone: string;
  telegramEnabled?: boolean;
  telegramChatId?: string | null;
}

export function SettingsForm({
  preferences,
  hasPushSubscription,
}: {
  preferences: Preferences;
  hasPushSubscription: boolean;
}) {
  const [emailMode, setEmailMode] = useState(preferences.emailMode);
  const [quietStart, setQuietStart] = useState(
    preferences.quietHoursStart || ""
  );
  const [quietEnd, setQuietEnd] = useState(preferences.quietHoursEnd || "");
  const [timezone, setTimezone] = useState(preferences.timezone);
  const [telegramEnabled, setTelegramEnabled] = useState(
    Boolean(preferences.telegramEnabled)
  );
  const [telegramChatId, setTelegramChatId] = useState(
    preferences.telegramChatId || ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [enablingPush, setEnablingPush] = useState(false);

  const handleEnablePush = async () => {
    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublic) {
      alert("VAPID key is missing. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and restart web dev.");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications are not supported in your browser.");
      return;
    }

    try {
      setEnablingPush(true);
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Browser notification permission is required to enable push.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublic) as BufferSource,
        }));

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body.error === "string"
            ? body.error
            : "Failed to register push subscription"
        );
      }

      window.location.reload();
    } catch (err: any) {
      alert(err?.message || "Could not enable push notifications");
    } finally {
      setEnablingPush(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailMode,
          quietHoursStart: quietStart || null,
          quietHoursEnd: quietEnd || null,
          timezone,
          telegramEnabled,
          telegramChatId: telegramChatId.trim() || null,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      {/* Push notifications */}
      <div
        className="overflow-hidden rounded-r3 bg-white"
        style={{
          border: "0.5px solid rgba(0,0,0,0.08)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div className="p-[18px]">
          <div className="mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1.5a4.5 4.5 0 0 0-4.5 4.5v3L2 11.5v1h12v-1L12.5 9V6A4.5 4.5 0 0 0 8 1.5z"
                stroke="#0066CC"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 12.5a2 2 0 0 0 4 0"
                stroke="#0066CC"
                strokeWidth="1.3"
              />
            </svg>
            <h2 className="text-[15px] font-semibold text-jr-text1 font-text">
              Push Notifications
            </h2>
          </div>
          {hasPushSubscription ? (
            <div
              className="flex items-center gap-2 rounded-r2 px-3 py-2.5 text-[13px] font-medium"
              style={{
                background: "#F0FBF3",
                color: "#34C759",
                border: "0.5px solid rgba(52,199,89,0.2)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#34C759" strokeWidth="1.3" />
                <path d="M4.5 7L6.2 8.8L9.5 5.2" stroke="#34C759" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Push notifications enabled for this browser
            </div>
          ) : (
            <div>
              <p className="mb-3 text-[13px] text-jr-text2 font-text">
                Enable push notifications to get alerted the moment a new
                job is posted — even when the tab is closed.
              </p>
              <Btn variant="primary" onClick={handleEnablePush} disabled={enablingPush}>
                {enablingPush ? "Enabling..." : "Enable push notifications"}
              </Btn>
            </div>
          )}
        </div>
      </div>

      {/* Telegram notifications */}
      <div
        className="overflow-hidden rounded-r3 bg-white"
        style={{
          border: "0.5px solid rgba(0,0,0,0.08)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div className="p-[18px]">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-[15px] font-semibold text-jr-text1 font-text">
              Telegram Notifications
            </h2>
          </div>
          <p className="mb-3 text-[13px] text-jr-text2 font-text">
            Receive instant role alerts on Telegram.
          </p>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[13px] text-jr-text1 font-text">
              <input
                type="checkbox"
                checked={telegramEnabled}
                onChange={(e) => setTelegramEnabled(e.target.checked)}
                className="h-4 w-4 accent-jr-accent"
              />
              Enable Telegram alerts
            </label>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-jr-text2">
                Telegram Chat ID
              </label>
              <input
                className="input text-sm"
                placeholder="e.g. 123456789"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
              />
              <p className="mt-1 text-xs text-jr-text3">
                Start a chat with your bot first, then use your numeric chat ID.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Email preferences */}
      <div
        className="overflow-hidden rounded-r3 bg-white"
        style={{
          border: "0.5px solid rgba(0,0,0,0.08)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div className="p-[18px]">
          <div className="mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="3" width="13" height="10" rx="2" stroke="#0066CC" strokeWidth="1.3" />
              <path d="M1.5 5.5L8 9l6.5-3.5" stroke="#0066CC" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="text-[15px] font-semibold text-jr-text1 font-text">
              Email Notifications
            </h2>
          </div>
          <div className="space-y-2">
            {[
              {
                value: "instant",
                label: "Instant",
                desc: "Email for every new job immediately",
              },
              {
                value: "daily",
                label: "Daily Digest",
                desc: "One summary email per day",
              },
              {
                value: "none",
                label: "None",
                desc: "No email notifications",
              },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-3 rounded-r2 p-3 transition-colors duration-[120ms]"
                style={{
                  border:
                    emailMode === option.value
                      ? "0.5px solid rgba(0,102,204,0.3)"
                      : "0.5px solid rgba(0,0,0,0.08)",
                  background:
                    emailMode === option.value ? "#E8F0FB" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="emailMode"
                  value={option.value}
                  checked={emailMode === option.value}
                  onChange={(e) => setEmailMode(e.target.value)}
                  className="mt-0.5 h-4 w-4 accent-jr-accent"
                />
                <div>
                  <p className="text-[13px] font-medium text-jr-text1 font-text">
                    {option.label}
                  </p>
                  <p className="text-xs text-jr-text3">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Quiet hours */}
      <div
        className="overflow-hidden rounded-r3 bg-white"
        style={{
          border: "0.5px solid rgba(0,0,0,0.08)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div className="p-[18px]">
          <div className="mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 8.5a5.5 5.5 0 1 1-6-5.5A4 4 0 0 0 13.5 8.5z" stroke="#0066CC" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="text-[15px] font-semibold text-jr-text1 font-text">
              Quiet Hours
            </h2>
          </div>
          <p className="mb-4 text-[13px] text-jr-text2 font-text">
            Pause notifications during these hours. You&apos;ll still see
            jobs in your feed.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-jr-text2">
                Start
              </label>
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-jr-text2">
                End
              </label>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-jr-text2">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="input"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Berlin">Berlin</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Kolkata">India (IST)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save */}
      <Btn
        variant={saved ? "success" : "primary"}
        onClick={handleSave}
        disabled={saving}
        className="h-10 gap-2 text-sm"
      >
        {saved ? "Saved" : saving ? "Saving..." : "Save preferences"}
      </Btn>
    </div>
  );
}
