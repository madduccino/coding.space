const express = require("express");
const firebase = require("firebase");

// Initialize Firebase
// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  // Add other Firebase config properties as needed
};

firebase.initializeApp(firebaseConfig);

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// Add your API endpoint for transferring a student here
app.post("/api/transfer-student", async (req, res) => {
  // Handle transferring student using Firebase on the server
  // You'll need to implement this logic based on your requirements
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
