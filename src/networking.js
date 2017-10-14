import io from 'socket.io-client';
import Peer from 'simple-peer';

const peers = {};

// Const ioId = 'https://blydro-socketio-server.now.sh';
// Const socket = io(ioId);
const socket = io(window.location.hostname + ':3030');

function setupPeers(dataCallback, logger, connectCallback, socketConnectCallback, disconnectCallback) {
	socket.on('connect', () => {
		logger('Connected to signaling server, Peer ID: ' + socket.id);
		socketConnectCallback();
	});

	socket.on('peer', data => {
		const peerId = data.peerId;
		const peer = new Peer({initiator: data.initiator, trickle: true, reconnectTimer: 900});

		logger('Peer available for connection discovered from signaling server, Peer ID: ' + peerId);

		socket.on('signal', data => {
			if (data.peerId === peerId) {
				// NO logger('Received signaling data from Peer ID:' + peerId);
				peer.signal(data.signal);
			}
		});

		peer.on('signal', data => {
			// NO logger('Advertizing signaling data to Peer ID: ' + peerId);
			socket.emit('signal', {
				signal: data,
				peerId
			});
		});
		peer.on('error', e => {
			console.log('Error sending connection to peer %s:', peerId, e);
			socket.emit('request', peerId);
		});
		peer.on('connect', () => {
			connectCallback(peerId);
		});
		peer.on('close', () => {
			disconnectCallback(peerId);
			delete peers[peerId];
		});
		peer.on('data', data => {
			// DEBUG console.log('Recieved data from peer:', data); // DEBUG
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

	if (peers[peer]._channel && peers[peer]._channel.readyState === 'open') {
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
