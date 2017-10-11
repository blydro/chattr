import io from 'socket.io-client';
import Peer from 'simple-peer';

const peers = {};

// Const ioId = 'https://blydro-socketio-server.now.sh';
// Const socket = io(ioId);
const socket = io(window.location.hostname + ':3030');

function setupPeers(cb, logger) {
	socket.on('connect', () => {
		logger('Connected to signalling server, Peer ID: ' + socket.id);
	});

	socket.on('peer', data => {
		const peerId = data.peerId;
		const peer = new Peer({initiator: data.initiator, trickle: false});

		logger('Peer available for connection discovered from signalling server, Peer ID: ' + peerId);

		socket.on('signal', data => {
			if (data.peerId === peerId) {
				logger('Received signalling data', data, 'from Peer ID:' + peerId);
				peer.signal(data.signal);
			}
		});

		peer.on('signal', data => {
			logger('Advertising signalling data', data, 'to Peer ID:' + peerId);
			socket.emit('signal', {
				signal: data,
				peerId
			});
		});
		peer.on('error', e => {
			console.log('Error sending connection to peer %s:', peerId, e);
		});
		peer.on('connect', () => {
			logger('Peer connection established');
			// Peer.send('hey peer');
		});
		peer.on('data', data => {
			console.log('Recieved data from peer:', data);
			cb(data);
		});
		peers[peerId] = peer;
	});
}

function massSend(msg) {
	msg.sender = socket.id;
	// eslint-disable-next-line array-callback-return
	Object.keys(peers).map(peer => {
		peers[peer].send(JSON.stringify(msg));
	});
}

export {setupPeers, massSend};
