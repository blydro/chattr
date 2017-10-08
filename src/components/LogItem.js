import React from 'react';
import PropTypes from 'prop-types';

import Time from 'react-time';

class LogItem extends React.Component {

/* From https://stackoverflow.com/questions/39426083/update-component-every-second-react to enforce
		time to update!
		*/

	componentDidMount() {
		this.interval = setInterval(() => this.setState({time: Date.now()}), 1000);
	}
	componentWillUnmount() {
		clearInterval(this.interval);
	}

	render() {
		return (
			<li className="list-item">
				<Time value={this.props.msg.timestamp} relative/>: {this.props.msg.msg}
			</li>
		);
	}
}

LogItem.propTypes = {
	msg: PropTypes.object.isRequired
};

export default LogItem;
