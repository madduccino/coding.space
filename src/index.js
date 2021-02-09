import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import Firebase, {FirebaseContext} from './components/Firebase'
import Mail, {MailContext} from './components/Mail'
ReactDOM.render(
  <React.StrictMode>
  	<MailContext.Provider value={new Mail()}>
  	<FirebaseContext.Provider value={new Firebase()}>
    <App />
    </FirebaseContext.Provider>
    </MailContext.Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
