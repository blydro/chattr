import React from 'react';
import PropTypes from 'prop-types';

class SendBox extends React.Component {

	hotlineBling(event) {
		event.preventDefault();

		if (this.props.myName) {
			this.props.sendMessage(this.message.value);
		} else {
			this.props.setName(this.message.value);
		}

		this.sendForm.reset();
	}

	render() {
		return (
			<div className="sendBox">
				<form ref={input => this.sendForm = input} onSubmit={e => this.hotlineBling(e)}>
					<input ref={input => this.message = input} type="text" className="theChosenBox" placeholder={this.props.myName ? '' : 'Choose a new name...'}/>
				</form><br/>
			</div>
		);
	}
}

SendBox.propTypes = {
	sendMessage: PropTypes.func.isRequired,
	setName: PropTypes.func.isRequired,
	myName: PropTypes.string
};

SendBox.defaultProps = {
	myName: undefined
};

export default SendBox;
