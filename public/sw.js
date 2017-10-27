self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.slim.js');

const socket = io('localhost' + ':3031', {jsonp: false});

// Replace SW
console.log('serviceworker ready');

// Nasty hack to stay alive...
self.addEventListener('message', event => {
	const spawnNewMessageEvent = function (data) {
		return new Promise(success => {
			setTimeout(() => {
				const sw = self.registration.active;
				sw.postMessage(data);
				success('success');
			}, 30000);
		});
	};
	event.waitUntil(setupSocket().then(spawnNewMessageEvent));
});

socket.on('newConnection', name => {
	console.log(name);

	self.registration.showNotification(name + ' came online!', {
		body: 'Click to chat!',
		vibrate: [300, 300, 200, 200, 200, 100, 100],
		tag: 'Chattr'
	});
});

function setupSocket() {
	console.log('staying alliiive');
}
