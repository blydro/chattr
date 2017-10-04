import React, {Component} from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const socket = io('http://192.168.2.100:3030');

const peers = {};

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
		peer.send('hey peer');
	});
	peer.on('data', data => {
		console.log('Recieved data from peer:', data);
	});
	peers[peerId] = peer;
});

class App extends Component {

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<h1 className="App-title">Welcome to React</h1>
				</header>
				<p className="App-intro">
					To get started, edit <code>src/App.js</code> and save to reload.
				</p>
				<button onClick={() => console.log(peers)}>foo bar</button>
			</div>
		);
	}
}

export default App;
