import emailjs from 'emailjs-com';
//var GoogleStrategy = require('passport-google-oauth2').Strategy;


const config = {
  client_id: process.env.REACT_APP_GMAIL_CLIENT_ID,
  type:process.env.REACT_APP_GMAIL_ACCOUNT_TYPE,
  project_id:process.env.REACT_APP_GMAIL_PROJECT_ID,
  private_key_id:process.env.REACT_APP_GMAIL_PRIVATE_KEY_ID,
  private_key:process.env.REACT_APP_GMAIL_PRIVATE_KEY,
  client_email:process.env.REACT_APP_GMAIL_CLIENT_EMAIL,
  auth_uri:process.env.REACT_APP_GMAIL_AUTH_URI,
  token_uri:process.env.REACT_APP_GMAIL_TOKEN_URI,
  auth_provider_x509_cert_url:process.env.REACT_APP_GMAIL_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url:process.env.REACT_APP_GMAIL_CLIENT_X509_CERT_URL,
  api_key:process.env.REACT_APP_GMAIL_API_KEY,
  auth:process.env.REACT_APP_GMAIL_API_KEY,
  gmail_user_id:process.env.REACT_APP_GMAIL_USER_ID,
  gmail_password:process.env.REACT_APP_GMAIL_PASSWORD,
  emailjs_service_id:process.env.REACT_APP_EMAILJS_SERVICE_ID,
  emailjs_template_id:process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
  emailjs_user_id:process.env.REACT_APP_EMAILJS_USER_ID,
  emailjs_access_token:process.env.REACT_APP_EMAILJS_ACCESS_TOKEN,
  discoveryDocs:["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"],
  scope: ["https://www.googleapis.com/auth/gmail.labels"],
  tokenPath:'token.json',
  
};
//https://www.googleapis.com/gmail/v1/users
//https://www.googleapis.com/auth/gmail.labels
//
/*var Gmail = gapi.gmail({
  version:'v1',
  auth:config.auth,
  scope:config.scope;
})*/


//console.log(config);
class Mail {
  constructor() {

    this.config = config;

    this.userId = config.emailjs_user_id;
    this.emailjs = emailjs;
    emailjs.init(config.emailjs_user_id);
  }
  doSendEmail = (to,subj,text,callback) => {
    console.log(to);
    this.emailjs.send(
      config.emailjs_service_id,
      config.emailjs_template_id,
      {
        from:this.userId,
        to:to,
        subject:subj,
        text:text
      },
      config.emailjs_user_id

    ).then((res)=>{
        console.log("email sent to " + to);
        if(callback)
          callback(res);
      }, (err)=>{
        console.log(err);
        if(callback)
          callback (err);
      }
      
    );
  }

  
}
export default Mail;
/*

npm start: firebase.env.development.local, .env.development, .env.local, .env
npm run build: firebase.env.production.local, .env.production, .env.local, .env





*/