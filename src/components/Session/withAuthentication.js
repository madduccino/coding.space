import React from 'react';
import {AuthUserContext} from '../Session';
import {withFirebase} from '../Firebase';

const withAuthentication = Component => {
	class WithAuthentication extends React.Component {
		constructor(props){
			super(props);

			this.state = {
				authUser:null,
			};
		}

		render(){

			return (
				<AuthUserContext.Consumer>
					
					{authUser => <Component {...this.props} authUser={authUser} /> }
					

				</AuthUserContext.Consumer>
			) ;
		}
	}
	return withFirebase(WithAuthentication);

}
export default withAuthentication;