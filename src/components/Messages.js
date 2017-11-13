import React from 'react';
import PropTypes from 'prop-types';

import {animateScroll} from 'react-scroll';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import LogItem from './LogItem';
import Onboarding from './Onboarding';

class Messages extends React.Component {

	componentDidUpdate() {
		animateScroll.scrollToBottom({
			containerId: 'messageBox',
			duration: 350
		});
	}

	render() {
		return (
			<div className="messageBox" id="messageBox">
				<ul className="messageBoxList">
					{/* this timeout should be less hacky TODO */}
					<ReactCSSTransitionGroup transitionName="fade" transitionEnterTimeout={1} transitionLeaveTimeout={1}>
						{
							this.props.log.map(item => {
								if (item.type === 'onboarding') {
									return <Onboarding key={0}/>;
								}
								return <LogItem key={item.timestamp} msg={item} names={this.props.names}/>;
							})
						}
					</ReactCSSTransitionGroup>

				</ul>
			</div>
		);
	}
}

Messages.propTypes = {
	log: PropTypes.array.isRequired,
	names: PropTypes.object.isRequired
};

export default Messages;
