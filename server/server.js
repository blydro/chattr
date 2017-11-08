const server = require('http').createServer();
const _ = require('lodash');
const io = require('socket.io')(server, {origins: '*:*'});
const webpush = require('web-push');

webpush.setGCMAPIKey('AIzaSyDeMtcKL8N6hDVQ1G4EjM-_INtMlrWw5iM');
webpush.setVapidDetails(
  'mailto:complaints@blydro.com',
  'BHvaHNKBtoPaL9TDXPoq_ajrtsD7mb_WS5waGFrar6J3_l7PyP6M99flKdtFSa0uhp6YvhUzHvaArvvtlTxk8wM',
  '0G2JQczLojObtSmouP4XzvEo542tfw1xMzNcoZPnEbM'
);

const subscriptions = [];

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
		console.log('Rescuing', socketId);
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
		console.log(name + ' is ready!');
		massPush(name);
	});
});

function massPush(message) {
	for (let i = 0; i < subscriptions.length; i++) {
		webpush.sendNotification(JSON.parse(subscriptions[i]), message);
	}
}

server.listen(3030);
console.log('listening on 3030');
