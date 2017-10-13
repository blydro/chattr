import React from 'react';
import PropTypes from 'prop-types';

class SendBox extends React.Component {

	hotlineBling(event) {
		event.preventDefault();

		this.props.sendMessage(this.message.value);
		this.sendForm.reset();
	}

	whatsMyMotherfuckingName(event) {
		event.preventDefault();

		this.props.setName(this.message.value);
		this.sendForm.reset();
	}

	render() {
		return (
			<div>
				<form ref={input => this.sendForm = input} onSubmit={e => this.hotlineBling(e)}>
					<input ref={input => this.message = input} type="textarea"/>
					<button type="submit">Send</button>
				</form>
				<button onClick={e => this.whatsMyMotherfuckingName(e)}>set name</button>
			</div>
		);
	}
}

SendBox.propTypes = {
	sendMessage: PropTypes.func.isRequired,
	setName: PropTypes.func.isRequired
};

export default SendBox;
