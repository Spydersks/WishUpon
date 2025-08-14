// This file will be populated with your Firebase configuration.
const firebaseConfig = {
  apiKey: "AIzaSyCp1vdQD8R2IEs78wMXnbfJIHje02doO8I",
  authDomain: "blank-slate-rj6bs.firebaseapp.com",
  databaseURL: "https://blank-slate-rj6bs-default-rtdb.firebaseio.com",
  projectId: "blank-slate-rj6bs",
  storageBucket: "blank-slate-rj6bs.appspot.com",
  messagingSenderId: "456747938226",
  appId: "1:456747938226:web:4fa6cf32cd511f84d674ab"
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
