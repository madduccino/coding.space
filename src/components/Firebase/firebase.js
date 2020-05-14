import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';
const config = {
	apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  
};
//console.log(config);
class Firebase {
  constructor() {
    app.initializeApp(config);
    this.auth = app.auth();
    this.db = app.database();
    this.storage = app.storage();
  }
  onAuthUserListener = (next, fallback) =>{
    this.auth.onAuthStateChanged(authUser => {
      if(authUser){
        this.profile(authUser.uid)
          .once('value')
          .then(snapshot => {
            const dbUser = snapshot.val();

            if(!dbUser.roles)
              dbUser.roles = {};

            authUser = {
              uid:authUser.uid,
              email:authUser.email,
              ...dbUser,
            }
            next(authUser);
          })
      } else{
        fallback();
      }
    })
  }
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);
  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);
  doSignOut = () => this.auth.signOut();
  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);
  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);
  profile = uid => this.db.ref('db/Profiles/' + uid);
  profiles = () => this.db.ref('db/Profiles');

  project = pid => this.db.ref('db/Projects/' + pid);
  projects = () => this.db.ref('db/Projects');

  classes = () => this.db.ref('db/Classes');
  class = cid => this.db.ref('db/Classes/' + cid);
  //levels = () => this.db.ref('db/Projects/**/Level');
}
export default Firebase;
/*

npm start: firebase.env.development.local, .env.development, .env.local, .env
npm run build: firebase.env.production.local, .env.production, .env.local, .env





*/