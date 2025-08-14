// This file will be populated with your Firebase configuration.
const firebaseConfig = {
  apiKey: "AIzaSyBLvNLcHKXL98UK-fhtL1xtRR39cF1LNZc",
  authDomain: "artify-m8l08.firebaseapp.com",
  databaseURL: "https://artify-m8l08-default-rtdb.firebaseio.com",
  projectId: "artify-m8l08",
  storageBucket: "artify-m8l08.appspot.com",
  messagingSenderId: "24730237560",
  appId: "1:24730237560:web:87237a335eef1cc9a78b8d"
};

// This function initializes Firebase and returns the database instance.
// For the hosted static version, we ALWAYS want to connect to Firebase.
const initializeFirebase = () => {
    if (firebaseConfig.apiKey && firebaseConfig.databaseURL) {
        try {
            console.log("Hosted App: Attempting to initialize Firebase...");
            const app = firebase.initializeApp(firebaseConfig);
            console.log("Hosted App: Firebase initialized successfully.");
            return firebase.database();
        } catch (error) {
            console.error("CRITICAL: Firebase initialization failed. The application cannot function.", error);
            document.body.innerHTML = `<div style="padding: 2rem; text-align: center;"><h1>Connection Error</h1><p>The application could not connect to the database. Please check the Firebase configuration and your internet connection.</p></div>`;
            return null; // Indicates failure
        }
    } else {
        console.error("Firebase configuration is missing. The application cannot function.");
        document.body.innerHTML = `<div style="padding: 2rem; text-align: center;"><h1>Configuration Error</h1><p>Firebase configuration is missing. The application cannot start.</p></div>`;
        return null; 
    }
}
