self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      image: data.image || undefined,
      vibrate: data.vibrate || [200, 100, 200, 100, 200, 100, 200],
      data: {
        url: data.url || '/',
      },
      requireInteraction: data.requireInteraction || false,
      silent: false
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus().then(() => {
          if (event.notification.data.url) {
            return client.navigate(event.notification.data.url);
          }
        });
      }
      return clients.openWindow(event.notification.data.url || '/');
    })
  );
});
