import React, {Component} from 'react';

import {setupPeers, massSend, singleSend, socketId} from './networking';

import LogItem from './components/LogItem';
import SendBox from './components/SendBox';

class App extends Component {

	constructor() {
		super();

		setupPeers(data => {
			let decoded = new TextDecoder('utf-8').decode(data);
			decoded = JSON.parse(decoded);
			this.handleIncoming(decoded);
		}, this.logger, peerId => {
			singleSend(peerId, {type: 'names', newNames: {...this.state.names}});
		});
	}

	handleIncoming(message) {
		switch (message.type) {
			case 'log': {
				this.logger(message.msg);
				break;
			}
			case 'message': {
				this.setState({
					log: this.state.log.concat([message])
				});
				break;
			}
			case 'names': {
				const names = {...this.state.names, ...message.newNames};
				this.setState({names});
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

	// eslint-disable-next-line no-undef
	massTextBootyCall = message => {
		const msg = {
			timestamp: Date.now(),
			type: 'message',
			msg: message,
			sender: this.state.socket.id // This is duplciated, but it is for the state set below
		};

		massSend(msg);
		this.setState({
			log: this.state.log.concat([msg])
		});
	}

	// eslint-disable-next-line no-undef
	sayMyNameSayMyName = newName => {
		const oldName = this.state.names[this.state.socket.id] ? this.state.names[this.state.socket.id] : this.state.socket.id;
		const updateString = oldName + ' changed to ' + newName;

		this.logger('Changing name to ' + newName);
		const names = this.state.names;
		names[this.state.socket.id] = newName;

		this.setState({
			names
		});

		massSend({type: 'names', newNames: names});
		console.log(updateString);
		massSend({type: 'log', msg: updateString});
	}

	render() {
		const logItems = this.state.log.map(item => {
			return <LogItem key={item.timestamp} msg={item} names={this.state.names}/>;
		});

		return (
			<div className="App">
				<header className="App-header">
					<h1 className="App-title">Welcome to <span className="fancy">Chattr</span></h1>
				</header>
				<ul>
					{logItems}
				</ul>
				<SendBox sendMessage={this.massTextBootyCall} setName={this.sayMyNameSayMyName}/>
			</div>
		);
	}
}

export default App;
