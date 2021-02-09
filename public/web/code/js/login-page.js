// Main function that is invoked on page load
function initApp() {
  
   // Change element from showing or hiding
  function changeView(args, val) {
    args.forEach(el => {
      if (val == "show") {
        document.getElementById(el).className = "show";
      } else {
        document.getElementById(el).className = "hide";
      }
    });
  }

  // Change element text
  function changeText(el, val) {
    document.getElementById(el).innerHTML = val;
  }
  
  // Switch to login or signup screen
  function changeScreen(state) {
    if (state == "showForm") {
      // Show form and hide buttons
      changeView(
        [
          "email",
          "email-label",
          "password",
          "password-label",
          "close",
          "account-link"
        ],
        "show"
      );
      document.getElementById("signup-button").classList.add("submitButton");
      document.getElementById("login-button").classList.add("submitButton");
    } else {
      // otherwise, hide form and show buttons
      changeView([
        "email",
        "email-label",
        "password",
        "password-label",
        "close",
        "account-link",
        "reset"
      ]);
      changeView(["signup-button", "login-button"], "show");
      showLoginForm = false;
      showSignupForm = false;
      changeText("login-button", "Log In");
      changeText("error", "");
      document.getElementById("signup-button").classList.remove("submitButton");
      document.getElementById("login-button").classList.remove("submitButton");
    }
  }


  var showSignupForm;
  var showLoginForm;
  var showResetForm;
  
  function clickSignup() {
    showSignupForm = !showSignupForm;
    changeText("message", "");
    if (firebase.auth().currentUser) {
      changeView(["email", "email-label", "password", "password-label"], "show")
      // change signup button back to "sign up"
      changeText("signup-button", "Sign Up");
      // change header back to non-member text
      changeText("header", "This site is for members only");
      // sign user out
      firebase
        .auth()
        .signOut()
        .then(function() {
          // Sign-out successful.
        })
        .catch(function(error) {
          // An error happened.
        });
        changeScreen();
    } else if (showSignupForm) {
        changeScreen("showForm");
        changeView(["login-button"])
        accountLink("login");
    } else {
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        firebase
          .auth()
          .createUserWithEmailAndPassword(email, password)
          .catch(function(error) {
            // Handle Errors here.
            errorCode = error.code;
            errorMessage = error.message;
            if (errorCode == "auth/invalid-email") {
              errorMessage = "Please enter a valid email address.";
            }
            if (errorCode == "auth/weak-password") {
              errorMessage = "Your password must be at least 6 characters.";
            }
            if (errorCode == "auth/email-already-in-use") {
              errorMessage =
                "There is an account already associated with that email address.";
            }
            changeText("error", errorMessage);
            showSignupForm = true;
        });
      } 
  }
  
  function clickLogin() {
      showLoginForm = !showLoginForm;
      changeText("message", "");
      if (showLoginForm) {
        changeScreen("showForm");
        accountLink("signup");
        changeView(["signup-button"])
      } else if (showResetForm) {
        reset()
        showResetForm = false;
      } else {
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .catch(function(error) {
          // Handle Errors here.
          errorCode = error.code;
          errorMessage = error.message;
          if (errorCode == "auth/user-not-found") {
            errorMessage =
              "There is no account associated with that email address.";
          }
          if (errorCode == "auth/invalid-email") {
            errorMessage = "Please enter a valid email address.";
          }
          if (errorCode == "auth/wrong-password") {
            errorMessage = "We can't find that email and password combination.";
          }
          changeText("error", errorMessage);
          showLoginForm = true;
      });
    }
  }
  
  // Attaches an observer to the auth object
  // Gets called whenever the user's sign-in state changes
  firebase.auth().onAuthStateChanged(function(user) {
    // When signed in...
    if (user) {
      // save info of user in local variables
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;

      // change header text to welcome member
      changeText("header", "You're in! I knew you could do it.");
      // change login button text to say "sign out"
      changeText("signup-button", "Sign Out");
      // Clear any errors
      changeText("error", "");
      // hide form
      changeScreen();
      // hide login button
      changeView(["login-button"]);
    } else {
      changeText("signup-button", "Sign Up");
      changeText("login-button", "Log In");
      changeScreen()
    }
  });
  
  // When close button clicked
  function close() {
    changeScreen();
  }
  
  // Provide links to alternative sign-in types
  function accountLink(type) {
    if (type == "login") {
      changeText(
        "account-link",
        "Already have an account?&nbsp;<a class='login' href='#'>Log In</a>"
      );
      document.getElementById("signup-button").classList.add("submitButton");
      changeView(["reset"])
    } else {
      changeText(
        "account-link",
        "Don't have an account?&nbsp;<a class='signup' href='#'>Sign Up</a>"
      );
      changeView(["reset"], "show")
      showSignupForm = true;
      document.getElementById("login-button").classList.add("submitButton");
    } 
  }
  
  // Switch links to alternative sign-up type when link clicked
  document.getElementById("account-link").addEventListener("click", function() {
    changeText("error","");
    if (this.lastChild.className == "login") {
      showLoginForm = true;
      changeView(["login-button"], "show");
      changeView(["signup-button"]);
      accountLink("signup");
    } else {
      changeView(["signup-button"], "show");
      changeView(["login-button"]);
      showSignupForm = true;
      accountLink("login");    
    }
  })  
    
  function reset() {
    // If this is a password reset
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    // send link to reset password
    var auth = firebase.auth();
      auth
        .sendPasswordResetEmail(email)
        .then(function() {
          changeText(
            "message",
            "A link to reset your password has been sent to your inbox!"
          );
          changeScreen()
        })
        .catch(function(error) {
          showResetForm = true;
          var errorMessage = error.message;
          changeText("error", errorMessage);
          showLoginForm = true;
        });
    }

  function clickReset() {
    changeView(["password-label", "password", "reset", "account-link"])
    changeText("login-button", "Reset");
    showResetForm = true;
  }
  
  document.getElementById("signup-button").addEventListener("click", clickSignup);
  document.getElementById("login-button").addEventListener("click", clickLogin);
  document.getElementById("close").addEventListener("click", close);
  document.getElementById("reset").addEventListener("click", clickReset);
}

window.onload = function() {
  initApp();
};
