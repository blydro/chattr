import React from 'react';

class Onboarding extends React.Component {

	render() {
		return (
			<div className="onboarding">
				Welcome! How cool is this.

        <p>
          this text needs to last a bit

          because it nees to avoid the weidr text box moving thig
        </p>
				<img src="http://placekitten.com/200/600" alt=""/>
				<p>
          choose a name. keep in mind nothing will work if theres no internet
    </p>
			</div>
		);
	}
}

export default Onboarding;
