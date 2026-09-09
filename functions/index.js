const functions = require("firebase-functions/v1");

const cors = require("cors")({ origin: true });

const admin = require("firebase-admin");
// This codebase deploys to two different GCP projects (tcslms for Hosting/
// the live domain, tcslms-staging for Auth + the Realtime Database), so the
// runtime service account can't be a single hardcoded value — Cloud
// Functions gen1 requires the runtime service account to live in the same
// project the function is deployed to. Only tcslms-staging has the scoped
// functions-runtime account; elsewhere (e.g. tcslms) fall back to that
// project's own default runtime identity.
const RUNTIME_SERVICE_ACCOUNT =
  process.env.GCLOUD_PROJECT === "tcslms-staging"
    ? "functions-runtime@tcslms-staging.iam.gserviceaccount.com"
    : undefined;
const runtime = RUNTIME_SERVICE_ACCOUNT
  ? functions.runWith({ serviceAccount: RUNTIME_SERVICE_ACCOUNT })
  : functions;
admin.initializeApp({
  databaseURL: "https://tcslms-staging.firebaseio.com",
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const ALLOWED_ORIGINS = [
  "http://staging.coding.space",
  "https://staging.coding.space",
  "http://coding.space",
  "https://coding.space",
];
const headers = (req, res) => {
  res.header("Content-Type", "application/json");
  const origin = req.get("Origin");
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Headers", "Content-Type");
};

exports.createUser = runtime.https.onRequest(async (req, res) => {
    headers(req, res);

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return 0;
    }

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

exports.autoCreateUser = runtime.https.onRequest(async (req, res) => {
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
    const name = req.body.name;
    const username = name.trim().replace(/ /g, ".");
    const email = "students+" + username + "@thecodingspace.com";
    const pass = req.body.pass;
    const age = req.body.age;
    const birthday = req.body.birthday;
    const db_student_id = req.body.db_student_id;

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
            Birthday: birthday,
            DashboardID: db_student_id,
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
        res.status(422).json({ error: error });
        return 1;
      });
    return 0;
  });
});

exports.progressStatus = runtime.database
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
