import React from 'react';

class Onboarding extends React.Component {

	render() {
		return (
			<div className="onboarding">
				Welcome! How cool is this?!
				{/* <img src="http://placekitten.com/200/600" alt=""/> */}
        Choose a name. Keep in mind nothing will work if theres no internet.
        Wait for a connection, old messages might trickle in soon!
			</div>
		);
	}
}

export default Onboarding;
