/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Initializes TipOnDemand.
function TipOnDemand() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.tiptoshow = document.getElementById('tiptoshow');
  this.tiptextfield = document.getElementById('tip');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // Saves message on form submit.
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Toggle for the button.
  var saveTipHandler = this.saveTip.bind(this);
  this.tiptextfield.addEventListener('keydown', saveTipHandler);

  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
TipOnDemand.prototype.initFirebase = function() {
  // TODO(DEVELOPER): Initialize Firebase.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

TipOnDemand.prototype.getTip = function () {
  if(this.checkSignedInWithMessage) {
    this.userRef = this.database.ref('users/' + this.auth.currentUser.uid);
    this.userRef.once('value').then(function(snapshot) {
      var i = 0;
      var rand = Math.floor(Math.random() * snapshot.numChildren());
      snapshot.forEach(function(childSnapshot){
        if(i == rand) {
          document.getElementById('tiptoshow').innerHTML = "<h3>" + childSnapshot.val().tip +"</h3";
        }
        i++;
      });

    });
  }
};

// Signs-in Friendly Chat.
TipOnDemand.prototype.signIn = function() {
  // TODO(DEVELOPER): Sign in Firebase with credential from the Google user.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out of Friendly Chat.
TipOnDemand.prototype.signOut = function() {
  // TODO(DEVELOPER): Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
TipOnDemand.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;
    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')'; 
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    this.getTip();

  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
TipOnDemand.prototype.checkSignedInWithMessage = function() {
  /* TODO(DEVELOPER): Check if user is signed-in Firebase. */
  if (this.auth.currentUser) {
    return true;
  }
  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

TipOnDemand.prototype.saveTip = function(e) {
  if (e.which == 13) {
    if (this.checkSignedInWithMessage()) {
      this.userRef = this.database.ref('users/' + this.auth.currentUser.uid);
      this.userRef.push(
        {tip: this.tiptextfield.value}).then(function() {
      this.tiptextfield.value = "";
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });

    }
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
TipOnDemand.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions.');
  } else if (config.storageBucket === '') {
    window.alert('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' +
        'actually a Firebase bug that occurs rarely. ' +
        'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
        'and make sure the storageBucket attribute is not empty. ' +
        'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
        'displayed there.');
  }
};

window.onload = function() {
  window.tipOnDemand = new TipOnDemand();
};
