const server = require('http').createServer();
const _ = require('lodash');
const io = require('socket.io')(server, { origins: '*:*' });
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();
webpush.setGCMAPIKey('AIzaSyDeMtcKL8N6hDVQ1G4EjM-_INtMlrWw5iM');
webpush.setVapidDetails(
	'mailto:complaints@blydro.com',
	vapidKeys.publicKey,
	vapidKeys.privateKey
);

// eslint-disable-next-line
let subscriptions = [];

io.on('connection', socket => {
	console.log('Connection with ID:', socket.id);

	const peersToAdvertise = _.chain(io.sockets.connected)
		.values()
		.without(socket)
		// .sample(DEFAULT_PEER_COUNT)
		.value();
	console.log('advertising peers', _.map(peersToAdvertise, 'id'));
	peersToAdvertise.forEach(socket2 => {
		console.log('Advertising peer %s to %s', socket.id, socket2.id);
		socket2.emit('peer', {
			peerId: socket.id,
			initiator: true
		});
		socket.emit('peer', {
			peerId: socket2.id,
			initiator: false
		});
	});

	socket.on('signal', data => {
		const socket2 = io.sockets.connected[data.peerId];
		if (!socket2) {
			return;
		}
		console.log('Proxying signal from peer %s to %s', socket.id, socket2.id);

		socket2.emit('signal', {
			signal: data.signal,
			peerId: socket.id
		});
	});

	// Reconnect peers if they disconnect
	socket.on('request', socketId => {
		console.log('Rescuing', socketId, 'for', socket.id);
		socket.emit('peer', {
			peerId: socketId,
			initiator: true
		});
	});

	// Receive subscription data
	socket.on('subscription', data => {
		subscriptions.push(data);
	});

	socket.on('ready', name => {
		console.log(name + ' is ready! Sending publickey');
		massPush(name);

		socket.emit('publickey', JSON.stringify(vapidKeys.publicKey));
	});

	socket.on('backup', msg => {
		console.log('got a backup message!');
		socket.emit('socketmessage', JSON.stringify(msg));
	});
});

function massPush(message) {
	for (let i = 0; i < subscriptions.length; i++) {
		webpush
			.sendNotification(JSON.parse(subscriptions[i]), message, { TTL: 30 })
			.catch(err => {
				console.warn('Failed to push with status code', err.statusCode);
			});
	}
}

server.listen(3030);
console.log('listening on 3030');
