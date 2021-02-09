const functions = require('firebase-functions');
<<<<<<< HEAD
const serviceAccount = require('./credential.json');

//const cors = require('cors')({origin:true});

const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tcslms-staging.firebaseio.com"
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const headers = (req,res)=>{
	res.header('Content-Type','application/json');
    res.header('Access-Control-Allow-Origin', ['http://staging.coding.space','https://staging.coding.space','http://coding.space','https://coding.space']);
    res.header('Access-Control-Allow-Headers', 'Content-Type');
};

exports.createUser = functions.https.onRequest(async(req,res)=>{

	
	headers(req,res);
	


    if(req.method !== "POST"){
    	res.status(400).send("Unsupported");	
		return 0;
		
	}

	const email = req.body.email;
	const pass = req.body.password;
	const name = req.body.name;

	admin.auth().createUser({
		email:email,
		emailVerified:false,
		displayName:name,
		disabled:false,
		password:pass
	})
		.then((user)=>{
			console.log("User created: " + email)
			
			res.json({uid:user.uid,email:user.email,displayName:user.displayName});	
			return 1;
		})
		.catch((error)=>{
			
			console.log("Error creating user: " + email);
			console.log(error);
			res.json({error: error});
			return 1;
			
		})
	return 0;
	
})



exports.progressStatus = functions.database.ref('/db/Progress/{uid}/{unid}/steps/')
	.onUpdate((change)=> {
		var before = change.before.val();
		var after = change.after;
		var afterRef = after.ref;
		var afterVal = after.val();
		var nextStep = afterVal.findIndex((stepf,i)=>stepf.Status == 'DRAFT')+1;
		console.log(afterVal[0]);
		var pending = true;
		var approved = true;
		for(var i = 0; i < afterVal.length; i++){
			if(!!afterVal[i]){
				if(afterVal[i].Status != 'PENDING')
					pending = false;
				if(afterVal[i].Status != 'APPROVED')
					approved = false;
			}
			
		}
		console.log(afterRef.parent);
		afterRef.parent.update({nextStep:nextStep,Status:
			approved ? "APPROVED" :
			pending ? "PENDING" :
			"DRAFT"
		});
	})
=======
const firebase = require('firebase-admin');
const express = require('express');
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

app.get('/now', (request, response) => {
	console.log("starting timestamp")
	response.send(`${Date.now()}`);
	console.log("ending timestamp");
})

exports.app = functions.https.onRequest(app);
>>>>>>> 371366321e7c79326f6753c5e2eaa81cae32ef26
