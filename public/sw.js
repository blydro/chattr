self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.slim.js');

const socket = io('localhost' + ':3031', {jsonp: false});

// Replace SW
console.log('serviceworker ready');
socket.on('newConnection', name => {
	console.log(name);

	self.registration.showNotification(name + ' came online!', {
		body: 'Click to chat!',
		vibrate: [300, 300, 200, 200, 200, 100, 100],
		tag: 'Chattr'
	});
});
