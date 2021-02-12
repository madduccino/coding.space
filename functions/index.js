const functions = require("firebase-functions");
const serviceAccount = require("./credential.json");

const cors = require("cors")({ origin: true });

const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tcslms-staging.firebaseio.com",
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const headers = (req, res) => {
  res.header("Content-Type", "application/json");
  res.header("Access-Control-Allow-Origin", [
    "http://staging.coding.space",
    "https://staging.coding.space",
    "http://coding.space",
    "https://coding.space",
  ]);
  res.header("Access-Control-Allow-Headers", "Content-Type");
};

exports.createUser = functions.https.onRequest(async (req, res) => {
  headers(req, res);

  if (req.method !== "POST") {
    res.status(400).send("Unsupported");
    return 0;
  }

  const email = req.body.email;
  const pass = req.body.password;
  const name = req.body.name;

  admin
    .auth()
    .createUser({
      email: email,
      emailVerified: false,
      displayName: name,
      disabled: false,
      password: pass,
    })
    .then((user) => {
      console.log("User created: " + email);

      res.json({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });
      return 1;
    })
    .catch((error) => {
      console.log("Error creating user: " + email);
      console.log(error);
      res.json({ error: error });
      return 1;
    });
  return 0;
});

exports.autoCreateUser = functions.https.onRequest(async (req, res) => {
  headers(req, res);

  if (req.method !== "POST") {
    res.status(400).send("Unsupported");
    return 0;
  }
  if (req.get("X-Zapier-Key") !== "&m2tCn&Z6K^h") {
    res.status(401).send("Not Authorized");
    return 0;
  }
  return await cors(req, res, async () => {
    console.log(req.body);
    const name = req.body.name;
    const username = name.trim().replace(/ /g, ".");
    const email = "students+" + username + "@thecodingspace.com";
    // make me fancier
    const pass = "password1";
    const age = req.body.age;
    const birthday = req.body.birthday;

    admin
      .auth()
      .createUser({
        email: email,
        emailVerified: false,
        displayName: name,
        disabled: false,
        password: pass,
      })
      .then((user) => {
        console.log("User created: " + email);
        return admin
          .database()
          .ref("db/Profiles/" + user.uid)
          .set({
            Email: user.email,
            DisplayName: name,
            key: user.uid,
            roles: {
              STUDENT: "STUDENT",
            },
            About: "",
            Age: age,
            Username: username,
            ThumbnailFilename: "",
            Status: "DRAFT",
          });
      })
      .then(() => {
        res.json({
          message: "success",
          email,
          age,
          username,
          birthday,
        });
        return 1;
      })
      .catch((error) => {
        console.log("Error creating user: " + email);
        console.log(error);
        res.json({ error: error });
        return 1;
      });
    return 0;
  });
});

exports.progressStatus = functions.database
  .ref("/db/Progress/{uid}/{unid}/steps/")
  .onUpdate((change) => {
    var before = change.before.val();
    var after = change.after;
    var afterRef = after.ref;
    var afterVal = after.val();
    var nextStep =
      afterVal.findIndex((stepf, i) => stepf.Status == "DRAFT") + 1;
    console.log(afterVal[0]);
    var pending = true;
    var approved = true;
    for (var i = 0; i < afterVal.length; i++) {
      if (!!afterVal[i]) {
        if (afterVal[i].Status != "PENDING") pending = false;
        if (afterVal[i].Status != "APPROVED") approved = false;
      }
    }
    console.log(afterRef.parent);
    afterRef.parent.update({
      nextStep: nextStep,
      Status: approved ? "APPROVED" : pending ? "PENDING" : "DRAFT",
    });
  });
