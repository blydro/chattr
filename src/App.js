import React, {Component} from 'react';

import {setupPeers, massSend} from './networking';
import LogItem from './components/LogItem';

class App extends Component {

	constructor() {
		super();

		setupPeers(data => {
			const decoded = new TextDecoder('utf-8').decode(data);
			console.log('from construcotr: ', decoded);
			this.logger('New message! ' + decoded);
		}, this.logger);
	}

	// eslint-disable-next-line no-undef
	logger = text => {
		const log = this.state.log;
		const message = {
			timestamp: Date.now() - performance.now() + performance.now(), // This is kind of nasty but it enforces unique strings
			type: 'log',
			msg: text
		};

		log.push(message);

		this.setState({
			log
		});
	}

	addMessage(message) {
		const log = this.state.log;

		log.push(message);
		this.setState({
			log
		});
	}

	componentWillMount() {
		this.setState({
			log: [] // Make this an object some day
		});
	}

	componentDidMount() {
		this.logger('Log Initialized');
		this.logger('Served from ' + window.location.hostname);
	}

	massTextBootyCall() {
		this.logger('mass texting ' + this.message.value);

		massSend(this.message.value);
	}

	render() {
		const logItems = this.state.log.map(item => {
			return <LogItem key={item.timestamp} msg={item}/>;
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
				<ul>
					{logItems}
				</ul>
			</div>
		);
	}
}

export default App;
