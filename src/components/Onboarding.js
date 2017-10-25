import React from 'react';

class Onboarding extends React.Component {

	render() {
		return (
			<div className="onboarding">
				Welcome! How cool is this.
				<img src="http://placekitten.com/200/600" alt=""/>
        choose a name. keep in mind nothing will work if theres no internet.
        Wait for a connection, old messages might come soon!
			</div>
		);
	}
}

export default Onboarding;
