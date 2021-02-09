const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const expressHbs = require('express-handlebars');
const app = express();
const firebaseConfig = {
  apiKey: "AIzaSyCK0DR_mgjxFTGvDyaYdVIwHyRTgoWvA6E",
  authDomain: "tcslms-staging.firebaseapp.com",
  databaseURL: "https://tcslms-staging.firebaseio.com",
  projectId: "tcslms-staging",
  storageBucket: "tcslms-staging.appspot.com",
  messagingSenderId: "744989512924",
  appId: "1:744989512924:web:2b17188a2f2fd3739c5019"
};
const firebaseApp = firebase.initializeApp(firebaseConfig);

//const userAPI = require('./userAPI');

app.engine('handlebars',expressHbs({defaultLayout:'main'}));
app.set('view engine','handlebars');

app.get('/now', (request, response) => {
  console.log("starting timestamp")
  response.send(`${Date.now()}`);
  console.log("ending timestamp");
})

exports.app = functions.https.onRequest(app);