import React, {Component} from 'react';

import {setupPeers, massSend, singleSend, socketId} from './networking';
import LogItem from './components/LogItem';

class App extends Component {

	constructor() {
		super();

		setupPeers(data => {
			let decoded = new TextDecoder('utf-8').decode(data);
			decoded = JSON.parse(decoded);
			this.handleIncoming(decoded);
		}, this.logger, peerId => {
			singleSend(peerId, {type: 'names', newNames: this.state.names});
		});
	}

	handleIncoming(message) {
		switch (message.type) {
			case 'log': {
				this.logger('log msg: ', message.msg);
				break;
			}
			case 'message': {
				this.setState({
					log: this.state.log.concat([message])
				});
				break;
			}
			case 'names': {
				const names = message.newNames;
				this.setState({...this.state.names, names});
				break;
			}
			default:
				this.logger('recieved data without type: ', message);
		}
	}

	// eslint-disable-next-line no-undef
	logger = text => {
		const message = {
			timestamp: Date.now() - performance.now() + performance.now(), // This is kind of nasty but it enforces unique strings
			type: 'log',
			msg: text
		};

		this.setState({
			log: this.state.log.concat([message])
		});
	}

	componentWillMount() {
		this.setState({
			log: [],
			names: {},
			myName: undefined,
			socket: socketId()
		});
	}

	componentDidMount() {
		this.logger('Log Initialized');
		this.logger('Served from ' + window.location.hostname);
	}

	componentWillUpdate(newProps, newState) {
		// NOtify user on namge change
		Object.entries(newState.names).forEach(([peerId, name]) => {
			const oldName = this.state.names[peerId] ? this.state.names[peerId] : peerId;
			if (oldName !== name) {
				this.logger(oldName + ' changed to ' + name);
			}
		});
	}

	massTextBootyCall() {
		this.logger('mass texting ' + this.message.value);
		const msg = {
			timestamp: Date.now(),
			type: 'message',
			msg: this.message.value
		};

		massSend(msg);
	}

	sayMyNameSayMyName() {
		this.logger('my name is now ' + this.message.value);
		const names = {...this.state.names};
		names[this.state.socket.id] = this.message.value;

		this.setState({
			names
		});

		massSend({type: 'names', newNames: names});
	}

	render() {
		const logItems = this.state.log.map(item => {
			return <LogItem key={item.timestamp} msg={item} sender={this.state.names[item.sender]}/>;
		});

		return (
			<div className="App">
				<header className="App-header">
					<h1 className="App-title">Welcome to <span className="fancy">Chattr</span></h1>
				</header>
				<p className="App-intro">
					<input ref={input => this.message = input}/>
				</p>
				<button onClick={() => this.massTextBootyCall()}>mass text</button>
				<button onClick={() => this.sayMyNameSayMyName()}>set name</button>
				<ul>
					{logItems}
				</ul>
			</div>
		);
	}
}

export default App;
