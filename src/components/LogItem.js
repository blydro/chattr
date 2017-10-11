import React from 'react';
import PropTypes from 'prop-types';

import Time from 'react-time';

class LogItem extends React.Component {

/* From https://stackoverflow.com/questions/39426083/update-component-every-second-react
to enforce Time to update! */

	componentDidMount() {
		this.interval = setInterval(() => this.setState({time: Date.now()}), 5000);
	}
	componentWillUnmount() {
		clearInterval(this.interval);
	}

	render() {
		return (
			<li className={this.props.msg.type}>
				<Time value={this.props.msg.timestamp} relative/> from {this.props.sender || this.props.msg.sender || 'me'}: {this.props.msg.msg}
			</li>
		);
	}
}

LogItem.propTypes = {
	msg: PropTypes.object.isRequired,
	sender: PropTypes.string
};

export default LogItem;
