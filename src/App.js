import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
	setupPeers,
	massSend,
	singleSend,
	socketId,
	requestPeer
} from './networking';

import SendBox from './components/SendBox';
import Messages from './components/Messages';
import OnlineList from './components/OnlineList';

class App extends Component {
	constructor() {
		super();

		const dataCallback = (data, json) => {
			let decoded = undefined;
			if (json === true) {
				if (JSON.parse(data)[0]) {
					decoded = JSON.parse(data);
				} else {
					decoded = data;
				}
			} else {
				decoded = new TextDecoder('utf-8').decode(data);
			}
			decoded = JSON.parse(decoded);

			this.handleIncoming(decoded);
		};

		const connectCallback = peerId => {
			/* Make everything less annoying
			setTimeout(() => {
				this.logger('Peer connection established with ' + this.findName(peerId));
			}, 1500); // Artificially delay this so the name can appear!
			*/
			if (!this.state.names[peerId]) {
				const names = { ...this.state.names };
				names[peerId] = undefined;
				this.setState({ names });
			}

			const latestFiftyLog = _.takeRight(this.state.log, 25); // Only send latest 25 messages so we don't overload the network

			singleSend(peerId, { type: 'names', newNames: { ...this.state.names } });
			singleSend(peerId, {
				type: 'logArchive',
				newLog: this.filterLog(latestFiftyLog, 'message')
			});
		};

		const socketConnectCallback = () => {
			this.setState({ socket: socketId() }); // Update our socket id once we have one!

			// Get name from localstorage if it's there otherwise use assigned name
			const names = { ...this.state.names };
			console.log(names, socketId().id);
			names[socketId().id] = localStorage.getItem('name')
				? localStorage.getItem('name')
				: undefined;
			this.setState({
				names
			});

			this.state.socket.emit('ready', this.findName(this.state.socket.id));
			massSend({ type: 'names', newNames: names });
		};

		const disconnectCallback = peerId => {
			this.logger(this.findName(peerId) + ' disconnected');

			const names = this.state.names;
			delete names[peerId];
			this.setState({
				names
			});
		};

		setupPeers(
			{
				dataCallback,
				connectCallback,
				socketConnectCallback,
				disconnectCallback
			},
			this.logger
		);
	}

	handleIncoming(message) {
		switch (message.type) {
			case 'log': {
				this.logger(message.msg);
				break;
			}
			case 'message': {
				/*singleSend(message.sender, {
					type: 'receipt',
					msgTimestamp: message.timestamp
				});*/
				message.sender = this.findName(message.sender); // Change the name for the local client
				this.addMessage(message);
				break;
			}
			case 'socket-message': {
				this.addMessage(message);
				break;
			}
			case 'receipt': {
				const matchingMessage = _.findIndex(this.state.log, [
					'timestamp',
					message.msgTimestamp
				]);
				console.log(
					this.state.log[matchingMessage] +
						' was seen by ' +
						this.findName(message.sender)
				);
				break;
			}
			case 'typing': {
				const typers = this.state.typers;
				const sender = message.sender;

				if (message.typing === true) {
					typers.push(sender);
				} else {
					_.pull(typers, sender);
				}

				this.setState({ typers });
				break;
			}
			case 'names': {
				const names = { ...this.state.names, ...message.newNames };
				this.setState({ names });
				break;
			}
			case 'logArchive': {
				const filteredLog = this.filterLog(this.state.log, 'message');
				// Merge 2 log lists in the order depending on which is newer:
				if (
					_.last(message.newLog) &&
					_.last(filteredLog) &&
					_.last(message.newLog).timestamp > _.last(filteredLog).timestamp
				) {
					this.setState({ log: _.union(this.state.log, message.newLog) });
				} else {
					console.log('new log older, so ignoring its contents.'); // ignore old messages TODO: change this?
					// Do we want ancient messages to trickle in? What if a new message suddenly appears?
				}

				break;
			}
			default:
				this.logger('recieved data with invalid type: ' + message.type);
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
	};

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
	};

	componentDidMount() {
		this.logger('Log Initialized');
		this.logger('Served from ' + window.location.hostname);
	}

	componentWillUpdate(nextProps, nextState) {
		const log = this.filterLog(nextState.log, 'message');
		localStorage.setItem('log', JSON.stringify(log)); // Don't slice it after all: .slice(log.length - 10)));
	}

	// eslint-disable-next-line no-undef
	massTextBootyCall = message => {
		let msg = {
			timestamp: Date.now(),
			type: 'message',
			msg: message,
			sender: this.state.socket.id // This is duplciated, but it is for the state set below
		};

		massSend(msg);

		// When we save locally, we want to have the sender name be correct
		msg.sender = this.findName(msg.sender);

		this.setState({
			log: this.state.log.concat([msg])
		});
	};

	// eslint-disable-next-line no-undef
	sayMyNameSayMyName = newName => {
		const oldName = this.state.names[this.state.socket.id]
			? this.state.names[this.state.socket.id]
			: this.state.socket.id;
		const updateString = oldName + ' changed to ' + newName;

		const names = this.state.names;
		names[this.state.socket.id] = newName;

		this.setState({
			names
		});

		localStorage.setItem('name', newName);

		massSend({ type: 'names', newNames: names });

		if (newName.length > 0) {
			massSend({ type: 'log', msg: updateString });
			this.logger('Changing name to ' + newName);
		} else {
			massSend({ type: 'log', msg: oldName + ' reset name' });
			this.logger('Resetting name');
		}
	};

	// eslint-disable-next-line no-undef
	allDoneTyping = _.debounce(() => {
		this.setState({
			typing: false
		});
		massSend({
			type: 'typing',
			typing: false
		});
	}, 300);

	// eslint-disable-next-line no-undef
	typeOccured = myName => {
		if (myName === undefined) {
			return; // Don't indicate typing if typing a name!
		}
		if (this.state.typing === false) {
			massSend({
				type: 'typing',
				typing: true
			});
		}
		this.setState({
			typing: true
		});

		this.allDoneTyping();
	};

	componentWillMount() {
		this.setState({
			log: JSON.parse(localStorage.getItem('log')) || [],
			names: {},
			socket: socketId(),
			typing: false,
			typers: []
		});

		if (
			localStorage.getItem('log') === '[]' ||
			!JSON.parse(localStorage.getItem('log'))
		) {
			// New Client
			this.setState({
				log: [
					{
						timestamp: 0,
						type: 'onboarding'
					}
				]
			});
		}
	}

	render() {
		return (
			<div className="App">
				<div className="interface">
					<Messages log={this.state.log} names={this.state.names} />
					<SendBox
						sendMessage={this.massTextBootyCall}
						setName={this.sayMyNameSayMyName}
						myName={this.state.names[this.state.socket.id]}
						disconnectedfromSocket={!this.state.socket.id}
						typeOccured={_.debounce(this.typeOccured, 100)}
					/>
				</div>

				<br />
				{this.props.debug === true ? (
					<div className="debugButtons">
						<button onClick={() => localStorage.setItem('log', '[]')}>
							reset localstorage log
						</button>
						<button onClick={() => localStorage.setItem('names', '{}')}>
							reset localstorage names
						</button>
						<button
							onClick={() =>
								massSend({
									type: 'peerList',
									peerList: Object.keys(this.state.names)
								})
							}
						>
							send peerlist
						</button>
					</div>
				) : (
					''
				)}

				<header className="App-header">
					<h1 className="App-title">
						<span className="fancy">Chattr</span>
					</h1>
					<OnlineList
						peers={Object.keys(this.state.names)}
						findName={this.findName}
						setName={this.sayMyNameSayMyName}
						me={this.state.socket.id}
						typers={this.state.typers}
					/>
				</header>
			</div>
		);
	}
}

App.propTypes = {
	debug: PropTypes.bool.isRequired
};

export default App;
