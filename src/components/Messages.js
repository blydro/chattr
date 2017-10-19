import React from 'react';
import PropTypes from 'prop-types';

import {animateScroll} from 'react-scroll';

import LogItem from './LogItem';

class Messages extends React.Component {

	componentDidUpdate() {
		animateScroll.scrollToBottom({
			containerId: 'messageBox'
		});
	}

	render() {
		return (
			<ul className="messageBox" id="messageBox">
				{
					this.props.log.map(item => {
						return <LogItem key={item.timestamp} msg={item} names={this.props.names}/>;
					})
				}
			</ul>
		);
	}
}

Messages.propTypes = {
	log: PropTypes.array.isRequired,
	names: PropTypes.object.isRequired
};

export default Messages;
