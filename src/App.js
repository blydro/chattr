import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {setupPeers, massSend, singleSend, socketId, requestPeer} from './networking';

import SendBox from './components/SendBox';
import Messages from './components/Messages';
import OnlineList from './components/OnlineList';

class App extends Component {

	constructor() {
		super();

		const dataCallback = data => {
			let decoded = new TextDecoder('utf-8').decode(data);
			decoded = JSON.parse(decoded);
			this.handleIncoming(decoded);
		};

		const connectCallback = peerId => {
			/* Make everything less annoying
			setTimeout(() => {
				this.logger('Peer connection established with ' + this.findName(peerId));
			}, 1500); // Artificially delay this so the name can appear!
			*/
			this.setState({
				peerIds: this.state.peerIds.concat([peerId])
			});

			singleSend(peerId, {type: 'names', newNames: {...this.state.names}});
			singleSend(peerId, {type: 'logArchive', newLog: this.filterLog(this.state.log, 'message')});
		};

		const socketConnectCallback = () => {
			this.setState({socket: socketId()}); // Update our socket id once we have one!

			const oldId = localStorage.getItem('oldSocketId') || '';
			const newId = this.state.socket.id;
			if (this.state.names[oldId]) {
				const names = {...this.state.names};
				names[newId] = names[oldId];
				// Don't delte becuase it makes problems: delete names[oldId]; // Don't clog everything up? maybe TODO: add a age component to this
				this.setState({names});
			}
			localStorage.setItem('oldSocketId', this.state.socket.id);

			this.setState({
				peerIds: this.state.peerIds.concat([this.state.socket.id])
			});

			this.state.socket.emit('ready', this.findName(this.state.socket.id));
		};

		const disconnectCallback = peerId => {
			this.logger(this.findName(peerId) + ' disconnected');

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
			case 'typing': {
				console.log('somebodys typing?', message.typing);
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
				if (message.peerList.length !== this.state.peerIds.length) {
					console.log('peerlist was different, doing some analysis!');
					for (const peer in message.peerList) {
						if (this.state.peerIds.indexOf(peer) === -1) {
							console.log(peer, 'was missing in my list. requesting connection to' + peer);
							requestPeer(peer);
						}
					}
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

	// eslint-disable-next-line no-undef
	findName = peerId => {
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
			socket: socketId(),
			typing: false
		});

		if (localStorage.getItem('log') === '[]' || !JSON.parse(localStorage.getItem('log'))) { // New Client
			this.setState({log: [{
				timestamp: 0,
				type: 'onboarding'
			}]});
		}
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

		const names = this.state.names;
		names[this.state.socket.id] = newName;

		this.setState({
			names
		});

		massSend({type: 'names', newNames: names});

		if (newName.length > 0) {
			massSend({type: 'log', msg: updateString});
			this.logger('Changing name to ' + newName);
		} else {
			massSend({type: 'log', msg: oldName + ' reset name'});
			this.logger('Resetting name');
		}
	}

	// eslint-disable-next-line no-undef
	allDoneTyping = () => {
		this.setState({
			typing: false
		});
		massSend({
			type: 'typing',
			typing: false
		});
	}

	// eslint-disable-next-line no-undef
	typeOccured = () => {
		if (this.state.typing === false) {
			massSend({
				type: 'typing',
				typing: true
			});
		}
		this.setState({
			typing: true
		});
	}

	render() {
		return (
			<div className="App">
				<div className="interface">
					<Messages log={this.state.log} names={this.state.names}/>
					<SendBox
						sendMessage={this.massTextBootyCall}
						setName={this.sayMyNameSayMyName}
						myName={this.state.names[this.state.socket.id]}
						doneTyping={_.debounce(this.allDoneTyping, 500)}
						typeOccured={this.typeOccured}
					/>
				</div>

				<br/>
				{this.props.debug === true ?
					<div className="debugButtons">
						<button onClick={() => localStorage.setItem('log', '[]')}>reset localstorage log</button>
						<button onClick={() => localStorage.setItem('names', '{}')}>reset localstorage names</button>
						<button onClick={() => localStorage.setItem('oldSocketId', '')}>reset localstorage oldsocketid</button>
						<button onClick={() => massSend({type: 'peerList', peerList: this.state.peerIds})}>send peerlist</button>
					</div> :
				''}

				<header className="App-header">
					<h1 className="App-title"><span className="fancy">Chattr</span></h1>
					<OnlineList peers={this.state.peerIds} findName={this.findName} setName={this.sayMyNameSayMyName} me={this.state.socket.id}/>
				</header>

			</div>
		);
	}
}

App.propTypes = {
	debug: PropTypes.bool.isRequired
};

export default App;
