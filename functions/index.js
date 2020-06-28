const functions = require('firebase-functions');
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

exports.approveProgress = functions.https.onRequest(async(req,res)=>{

	headers(req,res);

	if(req.method !== "POST"){
		res.status(400).send("Unsupported");
		return 0;
	}

	const username = req.body.username;
	const pass = req.body.password;
	const userid = req.body.userid;
	const untut = req.body.untut;
	const step = req.body.step;
	const comments = req.body.comments;

	admin.auth().signInWithEmailAndPassword('students+'+username+'@thecodingspace.com',password)
		.then(()=>{
			functions.database.ref('db/Profiles/'+userid+'/progress/'+untut+'/'+step)
				.set({Comments:comments,Status:{...STATUS,TEACHER_COMPLETE:"TEACHER_COMPLETE"}})
		})
		.catch()
})