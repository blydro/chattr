import React from 'react';
import PropTypes from 'prop-types';

import {
    Button, Input
} from '@blueprintjs/core';

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
					<input ref={input => this.message = input} type="text" className="theChosenBox"/>
					<Button type="submit">❯</Button>
				</form>
				<Button onClick={e => this.whatsMyMotherfuckingName(e)}>set name</Button>
			</div>
		);
	}
}

SendBox.propTypes = {
	sendMessage: PropTypes.func.isRequired,
	setName: PropTypes.func.isRequired
};

export default SendBox;
