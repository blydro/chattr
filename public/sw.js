/* global document */
self.addEventListener('push', event => {
	console.log('[Service Worker] Push Received.');
	console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

	const title = event.data.text() + ' came online!';
	const options = {
		body: 'Click to chat',
		icon: 'images/icon.png',
		badge: 'images/badge.png'
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
	console.log('[Service Worker] Notification click Received.');

	event.notification.close();

	event.waitUntil(
    clients.openWindow(self.registration.scope)
  );
});
