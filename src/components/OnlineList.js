import React from 'react';
import PropTypes from 'prop-types';

class OnlineList extends React.Component {

	render() {
		return (
			<div className="onlineList">
				connected to:
				<ul>
					{
						this.props.peers.map(peerId => {
							return <li key={peerId}>{this.props.findName(peerId)}</li>;
						})
					}
				</ul>
			</div>
		);
	}
}

OnlineList.propTypes = {
	peers: PropTypes.array.isRequired,
	findName: PropTypes.func.isRequired
};

export default OnlineList;
