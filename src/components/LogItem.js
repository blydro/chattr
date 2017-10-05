import React from 'react';

console.log('i\'m alive!');

class LogItem extends React.Component {

	render() {
		return (
			<li className="list-item">
				{this.props.text}
			</li>
		);
	}
}

export default LogItem;
