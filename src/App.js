import React, {Component} from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

import LogItem from './components/LogItem';

const peers = {};
const socket = io('http://localhost:3030');

function setupPeers(cb, logger) {
	socket.on('connect', () => {
		logger('Connected to signalling server, Peer ID: '+ socket.id);
	});

	socket.on('peer', data => {
		const peerId = data.peerId;
		const peer = new Peer({initiator: data.initiator, trickle: false});

		logger('Peer available for connection discovered from signalling server, Peer ID: '+ peerId);

		socket.on('signal', data => {
			if (data.peerId === peerId) {
				logger('Received signalling data', data, 'from Peer ID:'+ peerId);
				peer.signal(data.signal);
			}
		});

		peer.on('signal', data => {
			logger('Advertising signalling data', data, 'to Peer ID:'+ peerId);
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
			logger('Recieved data from peer:'+ data);
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
			this.logger('New message! ' + decoded);
		}, this.logger);
	}

	logger = (message) => {
		const log = this.state.log;
		log.push(message);

		this.setState({
			log
		});
	}

	componentWillMount() {
		this.setState({
			log: ['Log Initialized'] // Make this an object some day
		});
	}

	massTextBootyCall() {
		this.logger('mass texting');

		Object.keys(peers).map(peer => {
			peers[peer].send('p2p data!~!!!!!!1');
			return peer; // For xo --> delete!
		});
	}

	render() {
		const logItems = this.state.log.map((item, index) => {
			return <LogItem key={index} text={item}/>;
		});

		return (
			<div className="App">
				<header className="App-header">
					<h1 className="App-title">Welcome to React</h1>
				</header>
				<p className="App-intro">
					<input /> {/*THIS NEEDS TO BE PROPERLY IMPLEMENTED */}
				</p>
				<button onClick={() => this.massTextBootyCall()}>foo bar</button>
				<ul>
					{logItems}
				</ul>
			</div>
		);
	}
}

export default App;
