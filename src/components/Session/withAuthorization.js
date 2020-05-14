import React from 'react';
import {withRouter} from 'react-router-dom';
import {withFirebase} from '../Firebase';
import * as ROUTES from '../../constants/routes';
import AuthUserContext from './context';


const withAuthorization = condition => Component => {
	class WithAuthorization extends React.Component {

		constructor(props){
			super(props);
			this.state = {
				authUser:null,
			}

		}

		render(){

			return (
				<AuthUserContext.Consumer>

					{authUser => condition(authUser)
						? <Component {...this.props} authUser={authUser} />
						: null
					}

				</AuthUserContext.Consumer>
			) ;
		}
	}

	return withFirebase(WithAuthorization);

}
export default withAuthorization;