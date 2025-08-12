// This file will be populated with your Firebase configuration.
const firebaseConfig = {
  apiKey: "AIzaSyCp1vdQD8R2IEs78wMXnbfJIHje02doO8I",
  authDomain: "wishupon-73a11.firebaseapp.com",
  databaseURL: "https://wishupon-73a11-default-rtdb.firebaseio.com",
  projectId: "wishupon",
  storageBucket: "wishupon-73a11.appspot.com",
  messagingSenderId: "456747938226",
  appId: "1:456747938226:web:4fa6cf32cd511f84d674ab"
};

// --- Local Development Switch ---
// Set this to true to force localStorage mode even with a valid config.
const FORCE_LOCAL_MODE = false;

// This function initializes Firebase and returns the database instance.
const initializeFirebase = () => {
    const isLocalFile = window.location.protocol === 'file:';

    if (firebaseConfig.apiKey && firebaseConfig.databaseURL && !isLocalFile && !FORCE_LOCAL_MODE) {
        try {
            console.log("Attempting to initialize Firebase...");
            const app = firebase.initializeApp(firebaseConfig);
            console.log("Firebase initialized successfully.");
            return firebase.database();
        } catch (error) {
            console.error("Firebase initialization failed, falling back to local mode.", error);
            return null; // Indicates failure
        }
    } else {
        if(isLocalFile) console.warn("Running from local file system. Firebase is disabled. Using local storage instead.");
        if(FORCE_LOCAL_MODE) console.warn("FORCE_LOCAL_MODE is true. Using local storage instead.");
        if(!firebaseConfig.apiKey) console.warn("Firebase configuration is missing. Using local storage instead.");
        return null; // Indicates fallback to local mode
    }
}

// We will now call initializeFirebase() from api.js to ensure it's ready before API calls are made.
