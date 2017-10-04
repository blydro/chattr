import React, {Component} from 'react';
import io from 'socket.io-client';
import Socketiop2p from 'socket.io-p2p';

const socket = io('http://localhost:3030');
const opts = {peerOpts: {trickle: true}, autoUpgrade: true};
const p2p = new Socketiop2p(socket, opts, () => {
	p2p.emit('peer-msg', 'Hello there. I am ' + p2p.peerId);
});

p2p.useSockets = false;
p2p.usePeerConnection = true;

p2p.on('peer-msg', data => {
	console.log('holy hell i got something ' + data);
});

function onUpgrade(cb) {
	p2p.on('upgrade', data => cb(null, data));
}

class App extends Component {

	constructor() {
		super();

		onUpgrade((err, data) => this.setState({
			data
		}));
	}

	sendMessage(event) {
		event.preventDefault();
		// P2p.useSockets = false;
		// p2p.usePeerConnection = true;
		p2p.emit('peer-msg', this.message.value);
	}

	killServer() {
		console.log(p2p);
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
				<form ref={input => this.form = input} onSubmit={e => this.sendMessage(e)}>
					<input ref={input => this.message = input} type="text" placeholder="Message"/>

					<button type="submit">Send</button>
				</form>

				<button onClick={() => this.killServer()}>Kill the server</button>
			</div>
		);
	}
}

export default App;
