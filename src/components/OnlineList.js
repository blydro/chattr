import React from 'react';
import PropTypes from 'prop-types';

class OnlineList extends React.Component {

	render() {
		return (
			<div className="onlineList">
				online:
				<ul>
					{
						this.props.peers.map(peerId => {
							let clearButton = '';
							if (peerId === this.props.me) {
								clearButton = <button onClick={() => this.props.setName('')}>Reset</button>;
							}

							return <li key={peerId}>{this.props.findName(peerId)} {clearButton} <em>{this.props.typers.indexOf(peerId) > -1 ? 'is typing' : ''}</em></li>;
						})
					}
				</ul>
			</div>
		);
	}
}

OnlineList.propTypes = {
	peers: PropTypes.array.isRequired,
	findName: PropTypes.func.isRequired,
	setName: PropTypes.func.isRequired,
	me: PropTypes.string,
	typers: PropTypes.array.isRequired
};

OnlineList.defaultProps = {
	me: undefined
};

export default OnlineList;
