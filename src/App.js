import React, {Component} from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const peers = {};
const socket = io('http://192.168.2.100:3030');

function setupPeers(cb) {
	socket.on('connect', () => {
		console.log('Connected to signalling server, Peer ID: %s', socket.id);
	});

	socket.on('peer', data => {
		const peerId = data.peerId;
		const peer = new Peer({initiator: data.initiator, trickle: false});

		console.log('Peer available for connection discovered from signalling server, Peer ID: %s', peerId);

		socket.on('signal', data => {
			if (data.peerId === peerId) {
				console.log('Received signalling data', data, 'from Peer ID:', peerId);
				peer.signal(data.signal);
			}
		});

		peer.on('signal', data => {
			console.log('Advertising signalling data', data, 'to Peer ID:', peerId);
			socket.emit('signal', {
				signal: data,
				peerId
			});
		});
		peer.on('error', e => {
			console.log('Error sending connection to peer %s:', peerId, e);
		});
		peer.on('connect', () => {
			console.log('Peer connection established');
			// Peer.send('hey peer');
		});
		peer.on('data', data => {
			console.log('Recieved data from peer:', data);
			cb(data);
		});
		peers[peerId] = peer;
	});
}

class App extends Component {

	constructor() {
		super();

		setupPeers(data => {
			const decoded = new TextDecoder('utf-8').decode(data);
			console.log('from construcotr: ', decoded);
		});
	}

	massTextBootyCall() {
		Object.keys(peers).map(peer => {
			peers[peer].send('p2p data!~!!!!!!1');
			return peer; // For xo --> delete!
		});
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<h1 className="App-title">Welcome to React</h1>
				</header>
				<p className="App-intro">
					To get started, edit <code>src/App.js</code> and save to reload.
				</p>
				<button onClick={() => this.massTextBootyCall()}>foo bar</button>
			</div>
		);
	}
}

export default App;
