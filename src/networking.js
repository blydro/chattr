import io from 'socket.io-client';
import Peer from 'simple-peer';

const peers = {};

// Const ioId = 'https://blydro-socketio-server.now.sh';
// Const socket = io(ioId);
const socket = io(window.location.hostname + ':3030');

function setupPeers(dataCallback, logger, connectCallback) {
	socket.on('connect', () => {
		logger('Connected to signaling server, Peer ID: ' + socket.id);
	});

	socket.on('peer', data => {
		const peerId = data.peerId;
		const peer = new Peer({initiator: data.initiator, trickle: false});

		logger('Peer available for connection discovered from signaling server, Peer ID: ' + peerId);

		socket.on('signal', data => {
			if (data.peerId === peerId) {
				logger('Received signaling data', data, 'from Peer ID:' + peerId);
				peer.signal(data.signal);
			}
		});

		peer.on('signal', data => {
			logger('Advertising signaling data', data, 'to Peer ID:' + peerId);
			socket.emit('signal', {
				signal: data,
				peerId
			});
		});
		peer.on('error', e => {
			console.log('Error sending connection to peer %s:', peerId, e);
		});
		peer.on('connect', () => {
			logger('Peer connection established with ' + peerId);
			connectCallback(peerId);
		});
		peer.on('close', () => {
			logger('Peer ' + peerId + ' disconnected');
			console.log(peers);
			delete peers[peerId];
			console.log(peers);
		});
		peer.on('data', data => {
			// Console.log('Recieved data from peer:', data);
			dataCallback(data);
		});
		peers[peerId] = peer;
	});
}

function massSend(msg) {
	// eslint-disable-next-line array-callback-return
	Object.keys(peers).map(peer => {
		singleSend(peer, msg);
	});
}

function singleSend(peer, msg) {
	msg.sender = socket.id;

	if (peers[peer] && peers[peer]._channel.readyState === 'open') {
		peers[peer].send(JSON.stringify(msg));
	} else {
		console.log('peer %s not open. message not sent', peer);
		console.log(peers, peer);
	}
}

function socketId() {
	return socket;
}

export {setupPeers, massSend, singleSend, socketId};
