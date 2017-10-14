import React, {Component} from 'react';
import _ from 'lodash';

import {setupPeers, massSend, singleSend, socketId} from './networking';

import LogItem from './components/LogItem';
import SendBox from './components/SendBox';

class App extends Component {

	constructor() {
		super();

		// DataCallback, logger, connectCallback, socketConnectCallback, disconnectCallback
		setupPeers(data => {
			let decoded = new TextDecoder('utf-8').decode(data);
			decoded = JSON.parse(decoded);
			this.handleIncoming(decoded);
		}, this.logger, peerId => {
			setTimeout(() => {
				const name = this.state.names[peerId] ? this.state.names[peerId] : peerId;
				this.logger('Peer connection established with ' + name);
			}, 1500); // Artificially delay this so the name can appear!

			singleSend(peerId, {type: 'names', newNames: {...this.state.names}});
			singleSend(peerId, {type: 'logArchive', newLog: this.filterLog(this.state.log, 'message')});
		}, () => {
			const oldId = localStorage.getItem('oldSocketId');
			const newId = this.state.socket.id;
			if (this.state.names[oldId]) {
				const names = {...this.state.names};
				names[newId] = names[oldId];
				delete names[oldId]; // Don't clog everything up? maybe TODO: add a age component to this
				this.setState({names});
			}
			localStorage.setItem('oldSocketId', this.state.socket.id);
		}, peer => {
			const name = this.state.names[peer] ? this.state.names[peer] : peer;
			this.logger(name + ' disconnected');
		});
	}

	handleIncoming(message) {
		switch (message.type) {
			case 'log': {
				this.logger(message.msg);
				break;
			}
			case 'message': {
				this.addMessage(message);
				break;
			}
			case 'names': {
				const names = {...this.state.names, ...message.newNames};
				this.setState({names});
				break;
			}
			case 'logArchive': {
				for (const i in message.newLog) {
					if (!_.some(this.state.log, message.newLog[i])) {
						this.addMessage(message.newLog[i]);
					}
				}
				break;
			}
			default:
				this.logger('recieved data without type: ', message);
		}
	}

	findLastTimestamp(log) {
		return log[log.length - 1].timestamp;
	}

	filterLog(log, type) {
		return log.filter(logItem => {
			return logItem.type === type;
		});
	}

	addMessage(message) {
		this.setState({
			log: this.state.log.concat([message])
		});
	}

	// eslint-disable-next-line no-undef
	logger = text => {
		const message = {
			timestamp: Date.now(), // DISABLED - performance.now() + performance.now(), // This is kind of nasty but it enforces unique strings
			type: 'log',
			msg: text
		};

		this.addMessage(message);
	}

	componentWillMount() {
		this.setState({
			log: JSON.parse(localStorage.getItem('log')) || [],
			names: JSON.parse(localStorage.getItem('names')) || {},
			myName: undefined,
			socket: socketId()
		});
	}

	componentDidMount() {
		this.logger('Log Initialized');
		this.logger('Served from ' + window.location.hostname);
	}

	componentWillUpdate(nextProps, nextState) {
		localStorage.setItem('names', JSON.stringify(nextState.names));

		const log = this.filterLog(nextState.log, 'message');
		localStorage.setItem('log', JSON.stringify(log.slice(log.length - 10)));
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
				<button onClick={() => localStorage.setItem('log', '[]')}>reset localstorage log</button>
			</div>
		);
	}
}

export default App;
