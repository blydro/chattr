import React, {Component} from 'react';
import _ from 'lodash';
import {animateScroll} from 'react-scroll';

import {setupPeers, massSend, singleSend, socketId} from './networking';

import LogItem from './components/LogItem';
import SendBox from './components/SendBox';

class App extends Component {

	constructor() {
		super();

		const dataCallback = data => {
			let decoded = new TextDecoder('utf-8').decode(data);
			decoded = JSON.parse(decoded);
			this.handleIncoming(decoded);
		};
		const connectCallback = peerId => {
			setTimeout(() => {
				const name = this.state.names[peerId] ? this.state.names[peerId] : peerId;
				this.logger('Peer connection established with ' + name);
			}, 1500); // Artificially delay this so the name can appear!

			this.setState({
				peerIds: this.state.peerIds.concat([peerId])
			});

			singleSend(peerId, {type: 'names', newNames: {...this.state.names}});
			singleSend(peerId, {type: 'logArchive', newLog: this.filterLog(this.state.log, 'message')});
		};
		const socketConnectCallback = () => {
			const oldId = localStorage.getItem('oldSocketId') || '';
			const newId = this.state.socket.id;
			if (this.state.names[oldId]) {
				const names = {...this.state.names};
				names[newId] = names[oldId];
				delete names[oldId]; // Don't clog everything up? maybe TODO: add a age component to this
				this.setState({names});
			}
			localStorage.setItem('oldSocketId', this.state.socket.id);

			this.setState({
				peerIds: this.state.peerIds.concat([this.state.socket.id])
			});
		};
		const disconnectCallback = peerId => {
			const name = this.state.names[peerId] ? this.state.names[peerId] : peerId;
			this.logger(name + ' disconnected');

			const peerIds = this.state.peerIds;
			peerIds.splice(this.state.peerIds.indexOf(peerId), 1);
			this.setState({
				peerIds
			});
		};

		setupPeers({
			dataCallback,
			connectCallback,
			socketConnectCallback,
			disconnectCallback
		}, this.logger);
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
			case 'peerList': {
				console.log('my length', this.state.peerIds.length);
				console.log('its length', message.peerList.length);
				if (message.peerList.length > this.state.peerIds.length) {
					window.location.reload();
				}
				break;
			}
			default:
				this.logger('recieved data with invalid type: ' + message);
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

	findName(peerId) {
		if (this.state.names[peerId]) {
			return this.state.names[peerId];
		}
		return peerId;
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
			peerIds: [],
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
		localStorage.setItem('log', JSON.stringify(log)); // Don't slice it after all: .slice(log.length - 10)));
	}

	componentDidUpdate() {
		animateScroll.scrollToBottom({
			containerId: 'messageBox'
		});
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
		massSend({type: 'peerList', peerList: this.state.peerIds}); // Every time we send a message is a good time to send the peercheck? TODO put this on a timer and make it less bad

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

		const onlineMembers = this.state.peerIds.map(peerId => {
			return <li key={peerId}>{this.findName(peerId)}</li>;
		});

		return (
			<div className="App">
				<header className="App-header">
					<h1 className="App-title">Welcome to <span className="fancy">Chattr</span></h1>
				</header>
				<ul className="messageBox" id="messageBox">
					{logItems}
				</ul>
				<SendBox sendMessage={this.massTextBootyCall} setName={this.sayMyNameSayMyName}/>
				<br/>
				<button onClick={() => localStorage.setItem('log', '[]')}>reset localstorage log</button>
				<button onClick={() => localStorage.setItem('names', '[]')}>reset localstorage names</button>
				<button onClick={() => massSend({type: 'peerList', peerList: this.state.peerIds})}>send peerlist</button>
				<div className="onlineList">
					connected to:
					<ul>
						{onlineMembers}
					</ul>
				</div>
			</div>
		);
	}
}

export default App;
