import React from 'react';

const MailContext = React.createContext(null);

export const withMail = Component => props => (
		<MailContext.Consumer>
			{mail => <Component {...props} mail = {mail} /> }
		</MailContext.Consumer>
	);

export default MailContext;