
const Api = (() => {
    let db = null;
    let useLocal = false; // This flag will be true only if Firebase fails to initialize

    // Initialize Firebase and determine mode (Firebase vs. Local)
    const init = () => {
        db = initializeFirebase();
        if (!db) {
            console.warn("API: Firebase initialization failed. Operating in Local Storage Fallback mode.");
            useLocal = true;
        } else {
            console.log("API: Firebase initialized. Operating in Firebase-first mode.");
            useLocal = false;
        }
    };

    // --- Helper Functions for Local Storage ---
    const getLocal = (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) { return null; }
    };

    const setLocal = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) { console.error("Error saving to local storage", error); }
    };

    const getUserId = () => {
        const profile = getLocal('profile'); // The user's own ID is always in local storage for quick access
        return profile ? profile.contact : null;
    };

    // ===== Profile & Auth =====
    const saveProfile = async (profile) => {
        setLocal('profile', profile); // Always save to local for session persistence and immediate access
        if (!useLocal && profile && profile.contact) {
            await db.ref(`users/${profile.contact}/profile`).set(profile);
        }
    };
    
    // getLocalProfile is synchronous and used for immediate UI updates (e.g., nav header)
    const getLocalProfile = () => {
        return getLocal('profile');
    };
    
    // This is the primary function for fetching the profile, ensuring it's synced from the DB.
    const getProfile = async () => {
        const userId = getUserId();
        if (useLocal || !userId) return getLocal('profile');
        try {
            const snapshot = await db.ref(`users/${userId}/profile`).once('value');
            const profile = snapshot.val();
            if (profile) {
                setLocal('profile', profile); // Update local cache with fresh data
                return profile;
            }
            return getLocal('profile'); // Fallback if DB has no profile for this user
        } catch (error) {
            console.warn("Firebase profile fetch failed, returning from local storage.", error);
            return getLocal('profile');
        }
    };

    const logout = () => {
        // Clear all keys from local storage that are used by the app
        const keysToRemove = Object.keys(localStorage);
        keysToRemove.forEach(key => {
            if (key.startsWith('firebase:')) return; // Don't clear Firebase SDK keys
            localStorage.removeItem(key);
        });
        console.log("Application local storage cleared for logout.");
    };

    const getUserRole = () => getLocal('userRole');
    const saveUserRole = (role) => setLocal('userRole', role);

    // ===== People =====
    const getPeople = async () => {
        const userId = getUserId();
        if (useLocal || !userId) return getLocal('people') || [];
        try {
            const snapshot = await db.ref(`users/${userId}/people`).once('value');
            const people = snapshot.val() ? Object.values(snapshot.val()) : [];
            setLocal('people', people); // Cache fresh data
            return people;
        } catch (error) {
            console.warn("Firebase getPeople failed, returning from local storage.", error);
            return getLocal('people') || [];
        }
    };

    const addPerson = async (person) => {
        const people = getLocal('people') || [];
        people.push(person);
        setLocal('people', people);
        
        if (!useLocal) {
            const userId = getUserId();
            await db.ref(`users/${userId}/people/${person.contact}`).set(person);
        }
    };

    const deletePerson = async (id, contact) => {
        let people = getLocal('people') || [];
        people = people.filter(p => p.id !== id);
        setLocal('people', people);

        if (!useLocal) {
            const userId = getUserId();
            await db.ref(`users/${userId}/people/${contact}`).remove();
        }
    };

    // ===== Wishes =====
    const getWishes = async (contact) => {
        if (useLocal) return getLocal(`wishes_${contact}`) || [];
        try {
            const snapshot = await db.ref(`wishes/${contact}`).once('value');
            const wishes = snapshot.val() ? Object.values(snapshot.val()) : [];
            setLocal(`wishes_${contact}`, wishes); // Cache wishes for this contact
            return wishes;
        } catch(error) {
            console.warn(`Firebase getWishes failed for ${contact}, returning from local storage.`, error);
            return getLocal(`wishes_${contact}`) || [];
        }
    };

    const addWish = async (wish) => {
        const wishes = getLocal(`wishes_${wish.recipientContact}`) || [];
        wishes.push(wish);
        setLocal(`wishes_${wish.recipientContact}`, wishes); // Optimistic update

        if (!useLocal) {
            // Use push() to generate a unique key for each wish to prevent overwrites
            await db.ref(`wishes/${wish.recipientContact}`).push(wish);
        }
    };

    const markWishAsPlayed = async (playedWish) => {
        // This is tricky without knowing the unique key from Firebase push().
        // For this app's scope, we'll manage "played" status locally.
        const wishes = getLocal(`wishes_${playedWish.recipientContact}`) || [];
        const wishIndex = wishes.findIndex(w => w.id === playedWish.id);
        if (wishIndex > -1) {
            wishes[wishIndex].played = true;
            setLocal(`wishes_${playedWish.recipientContact}`, wishes);
        }
        // A full-fledged app would update this in Firebase using the wish's unique key.
    };

    // ===== Admin & Requests =====
    const saveRequest = async (type, request) => {
         setLocal(`request_${type}_${request.contact}`, request); // Optimistic update
         if (!useLocal) {
            await db.ref(`requests/${type}/${request.contact}`).set(request);
         }
    };
    
    const getRequest = async (type, contact) => {
        if (useLocal) return getLocal(`request_${type}_${contact}`) || null;
        try {
            const snapshot = await db.ref(`requests/${type}/${contact}`).once('value');
            const request = snapshot.val();
            setLocal(`request_${type}_${contact}`, request);
            return request;
        } catch(error) {
            console.warn(`Firebase getRequest failed for ${contact}, returning local.`, error);
            return getLocal(`request_${type}_${contact}`) || null;
        }
    };
    
    const deleteRequest = async (type, contact) => {
        localStorage.removeItem(`request_${type}_${contact}`); // Optimistic
        if (!useLocal) {
            await db.ref(`requests/${type}/${contact}`).remove();
        }
    };
    
    // Checks if a user exists by their contact number
    const userExists = async (contact) => {
        if (useLocal) {
            console.warn("Cannot check user existence in local mode.");
            return false;
        }
        try {
            const snapshot = await db.ref(`users/${contact}`).once('value');
            return snapshot.exists();
        } catch(error) {
            console.error("Could not check user existence from Firebase.", error);
            return false; // Assume not existing on error
        }
    };

    const getAdminMessages = async (contact) => {
        if(useLocal) return getLocal('adminMessages') || [];
        try {
            const snapshot = await db.ref(`messages/${contact}`).orderByChild('timestamp').once('value');
            const messagesData = snapshot.val();
            const messages = messagesData ? Object.values(messagesData) : [];
            setLocal('adminMessages', messages);
            return messages;
        } catch(error) {
            console.warn("Could not get admin messages from Firebase.", error);
            return getLocal('adminMessages') || [];
        }
    };
    
    const markAdminMessagesAsRead = (contact) => {
         let messages = getLocal('adminMessages') || [];
         let changed = false;
         messages.forEach(m => {
            if(m.recipientContact === contact && !m.read) {
                m.read = true;
                changed = true;
            }
         });
         if (changed) {
            setLocal('adminMessages', messages);
         }
    };

    // Initialize the module
    init();

    return {
        // Profile
        saveProfile, getLocalProfile, getProfile, logout,
        getUserRole, saveUserRole, userExists,
        // People
        getPeople, addPerson, deletePerson,
        // Wishes
        getWishes, addWish, markWishAsPlayed,
        // Requests
        saveRequest, getRequest, deleteRequest,
        // Admin Messages
        getAdminMessages, markAdminMessagesAsRead,
    };
})();

    