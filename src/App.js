import React, {Component} from 'react';

import {setupPeers, massSend} from './networking'
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

	logger = (message) => {
		const log = this.state.log;
		log.push(message);

		this.setState({
			log
		});
	}

	componentWillMount() {
		this.setState({
			log: ['Log Initialized', 'Served from ' + window.location.hostname] // Make this an object some day
		});
	}

	massTextBootyCall() {
		this.logger('mass texting '+ this.message.value);

		massSend(this.message.value);
	}

	render() {
		const logItems = this.state.log.map((item, index) => {
			return <LogItem key={index} text={item}/>;
		});

		return (
			<div className="App">
				<header className="App-header">
					<h1 className="App-title">Welcome to <span className="fancy">Chattr</span></h1>
				</header>
				<p className="App-intro">
					<input ref={(input) => this.message = input}/>
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
