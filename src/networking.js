import io from 'socket.io-client';
import Peer from 'simple-peer';
import urlB64ToUint8Array from './helpers';

const peers = {};

// Const ioId = 'https://blydro-socketio-server.now.sh';
// Const socket = io(ioId);
const socket = io(window.location.hostname + ':3030');
let zombieSocketId;

function setupPeers(callbacks, logger) {
	socket.on('connect', () => {
		logger('Connected to signaling server, Peer ID: ' + socket.id);
		zombieSocketId = socket.id; // Protect this id in case we disconnect from the socket server

		callbacks.socketConnectCallback();
	});

	socket.on('peer', data => {
		const peerId = data.peerId;
		const peer = new Peer({initiator: data.initiator, trickle: true, reconnectTimer: 900});

		// NO OMG SO SPAMMY logger('Peer available for connection discovered from signaling server, Peer ID: ' + peerId);

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
			callbacks.connectCallback(peerId);
		});
		peer.on('close', () => {
			callbacks.disconnectCallback(peerId);
			delete peers[peerId];
		});
		peer.on('data', data => {
			// DEBUG console.log('Recieved data from peer:', data); // DEBUG
			callbacks.dataCallback(data);
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
	msg.sender = socket.id || zombieSocketId;

	if (peers[peer]._channel && peers[peer]._channel.readyState === 'open') {
		peers[peer].send(JSON.stringify(msg));
	} else {
		console.log('peer %s not open. message not sent', peer);
	}
}

function socketId() {
		// Return either the scoket or an undefined string depending on situation!!
	if (socket.disconnected) {
		return {id: localStorage.getItem('oldSocketId')};
	}

	return socket;
}

/* This doesn't work for some reason
const helloAgain = () => {
	socket.close();
	Object.entries(peers).forEach(([peerId, peer]) => {
		peer.destroy();
		peer = {};
		delete peers[peerId];
	});
	socket.open();
};
*/

function requestPeer(peerId) {
	socket.emit('request', peerId);
}

// Service Worker Helper stuff
// From https://developers.google.com/web/fundamentals/codelabs/push-notifications/
const applicationServerPublicKey = 'BHvaHNKBtoPaL9TDXPoq_ajrtsD7mb_WS5waGFrar6J3_l7PyP6M99flKdtFSa0uhp6YvhUzHvaArvvtlTxk8wM';

let swRegistration = null;

// Register service worker for push notifcations
// From https://developers.google.com/web/fundamentals/codelabs/push-notifications/
if ('serviceWorker' in navigator && 'PushManager' in window) {
	console.log('Service Worker and Push is supported');

	navigator.serviceWorker.register('sw.js')
	.then(swReg => {
		console.log('Service Worker is registered', swReg);

		swRegistration = swReg;
		subscribeUser();
	})
	.catch(err => {
		console.error('Service Worker Error', err);
	});
} else {
	console.warn('Push messaging is not supported');
}

function subscribeUser() {
	const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
	swRegistration.pushManager.getSubscription().then(sub => {
		if (sub === null) {
			swRegistration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey
			})
			.then(subscription => {
				console.log('User is subscribed.');

				// Send subscription to server
				socket.emit('subscription', JSON.stringify(subscription));
			})
			.catch(err => {
				console.log('Failed to subscribe the user: ', err);
			});
		} else {
			console.log('Not subscribing, already subscribed!', sub);
			// Send subscription to server
			socket.emit('subscription', JSON.stringify(sub));
		}
	});
}

export {setupPeers, massSend, singleSend, socketId, requestPeer};
