import React, {Component} from 'react';

import {setupPeers, massSend, socketId} from './networking';
import LogItem from './components/LogItem';

class App extends Component {

	constructor() {
		super();

		setupPeers(data => {
			let decoded = new TextDecoder('utf-8').decode(data);
			decoded = JSON.parse(decoded);
			this.handleIncoming(decoded);
		}, this.logger, () => {
			// Console.log(peer);
			// TODO: send entire name database here
		});
	}

	handleIncoming(message) {
		switch (message.type) {
			case 'log':
				this.logger('log msg: ', message.msg);
				break;
			case 'message':
				this.addMessage(message);
				break;
			case 'setName':
				this.newName(message);
				break;
			default:
				this.logger('recieved data without type: ', message);
		}
	}

	// eslint-disable-next-line no-undef
	logger = text => {
		const log = {...this.state.log};
		const timestamp = Date.now() - performance.now() + performance.now(); // This is kind of nasty but it enforces unique strings

		const message = {
			type: 'log',
			msg: text
		};

		log[timestamp] = message;

		this.setState({
			log
		});
	}

	// eslint-disable-next-line no-undef
	addMessage = message => {
		const log = this.state.log.push();

		log.push(message);
		this.setState({
			log
		});
	}

	// eslint-disable-next-line no-undef
	newName = message => {
		const names = this.state.names;

		names[message.sender] = message.newName;
		this.setState({
			names
		});
	}

	componentWillMount() {
		this.setState({
			log: {},
			names: {},
			myName: undefined,
			socketId: socketId()
		});
	}

	componentDidMount() {
		this.logger('Log Initialized');
		this.logger('Served from ' + window.location.hostname);
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
		this.setState({
			myName: this.message.value
		});

		massSend({type: 'setName', newName: this.message.value});
	}

	render() {
		const logItems = Object.keys(this.state.log).map(item => {
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
