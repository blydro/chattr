import React, {Component} from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const socket = io('http://192.168.2.100:3030');

class App extends Component {

	constructor() {
		super();

		let p;

		socket.emit('getNodes');

		socket.on('nodes', nodes => {
			this.setState({
				nodes
			});

			p = new Peer({initiator: nodes.length === 1, trickle: true});
			console.log(p, nodes);
			socket.emit('newNode', p._id);

			if (nodes.length > 0) {
				nodes.map(node => {
					console.log(node);
					// P.signal(node);
					return node;
				});
			}

			// When we get a signal, send it over the WebSocket to the server
			p.on('signal', data => socket.emit('signal', data));

			// WebRTC connection is successful!
			p.on('connect', () => {
				console.log('connected');
			});

			// When we get a signal over the WebSocket from the server, signal the WebRTC connection
			socket.on('signal', data => {
				p.signal(data);
			});
		});

		console.log(p);
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
				<button onClick={() => this.props.p.send('OOOO')}>foo bar</button>
			</div>
		);
	}
}

export default App;
