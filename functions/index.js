const functions = require('firebase-functions');
//const cors = require('cors')({origin:true});

const admin = require('firebase-admin');
admin.initializeApp();

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
	const pass = req.body.pass;
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