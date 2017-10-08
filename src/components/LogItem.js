import React from 'react';
import PropTypes from 'prop-types';

class LogItem extends React.Component {

	render() {
		return (
			<li className="list-item">
				{this.props.msg.timestamp}: {this.props.msg.msg}
			</li>
		);
	}
}

LogItem.propTypes = {
	msg: PropTypes.object.isRequired
};

export default LogItem;
