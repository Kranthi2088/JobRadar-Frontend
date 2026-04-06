self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/badge-72.png",
    data: data.data,
    actions: [
      { action: "apply", title: "Apply Now" },
      { action: "dismiss", title: "Dismiss" },
    ],
    tag: `job-${data.data?.jobId}`,
    renotify: true,
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url;
  if (!url) return;

  if (event.action === "apply") {
    event.waitUntil(clients.openWindow(url));
  } else {
    event.waitUntil(
      clients.openWindow(`/dashboard`)
    );
  }
});
