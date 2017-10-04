import React, {Component} from 'react';
import io from 'socket.io-client';
import Socketiop2p from 'socket.io-p2p';

const socket = io('http://192.168.2.100:3030');
const opts = {autoUpgrade: true};
const p2p = new Socketiop2p(socket, opts, () => {
	p2p.emit('peer-msg', 'Hello there. I am ' + p2p.peerId);
});

// P2p.useSockets = false;
// p2p.usePeerConnection = true

p2p.on('peer-msg', data => {
	console.log('holy hell i got somesthing ' + data);
});

p2p.on('ready', () => {
	p2p.usePeerConnection = true;
});

p2p.on('upgrade', () => {
	console.log('upgradeeeeedddd');
	p2p.useSockets = false;
});

p2p.on('peer-error', data => {
	console.warn('error', data);
});

class App extends Component {

	sendMessage(event) {
		event.preventDefault();

		p2p.emit('peer-msg', this.message.value);
	}

	killServer() {
		console.log(p2p);
		p2p.usePeerConnection = true;
		p2p.useSockets = false;
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

				<button onClick={() => this.killServer()}>server</button>
			</div>
		);
	}
}

export default App;
