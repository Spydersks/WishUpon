
const Api = (() => {
    let db = null;
    let currentUserProfile = null; // In-memory profile for the current session

    // Initialize Firebase. It's mandatory for the static-hosted version.
    const init = () => {
        db = initializeFirebase();
        if (!db) {
            console.error("CRITICAL: API could not connect to Firebase. The app will not function.");
            // The initializeFirebase function already handles showing an error to the user.
        }
    };
    
    // ===== Profile & Auth =====

    const setCurrentProfile = (profile) => {
        currentUserProfile = profile;
    };
    
    const getCurrentProfile = () => {
        return currentUserProfile;
    };

    const saveProfile = async (profile) => {
        if (!db) throw new Error("Database not connected.");
        if (!profile || !profile.contact) throw new Error("Invalid profile data.");
        
        await db.ref(`users/${profile.contact}/profile`).set(profile);
        setCurrentProfile(profile); // Update in-memory profile
    };
    
    // Fetches a profile from DB. This is used on initial load/login.
    const fetchProfileByContact = async (contact) => {
        if (!db) throw new Error("Database not connected.");
        const snapshot = await db.ref(`users/${contact}/profile`).once('value');
        const profile = snapshot.val();
        if (profile) {
            setCurrentProfile(profile);
        }
        return profile;
    };

    const logout = () => {
        currentUserProfile = null;
        // Also clear the user role from session if it exists
        try {
            localStorage.removeItem('userRole'); // Okay to use for non-critical session hints
        } catch(e) {
            console.warn("Could not clear user role from storage on logout.");
        }
    };

    // This can still use a non-critical storage for convenience during a session
    const getUserRole = () => { try { return localStorage.getItem('userRole'); } catch(e) { return null; } };
    const saveUserRole = (role) => { try { localStorage.setItem('userRole', role); } catch(e) {} };


    const userExists = async (contact) => {
        if (!db) throw new Error("Database not connected.");
        const snapshot = await db.ref(`users/${contact}`).once('value');
        return snapshot.exists();
    };

    // ===== People =====
    const getPeople = async () => {
        const userId = currentUserProfile?.contact;
        if (!db || !userId) return [];
        const snapshot = await db.ref(`users/${userId}/people`).once('value');
        return snapshot.val() ? Object.values(snapshot.val()) : [];
    };

    const addPerson = async (person) => {
        const userId = currentUserProfile?.contact;
        if (!db || !userId) throw new Error("User not logged in.");
        await db.ref(`users/${userId}/people/${person.contact}`).set(person);
    };

    const deletePerson = async (id, contact) => {
        const userId = currentUserProfile?.contact;
        if (!db || !userId) throw new Error("User not logged in.");
        await db.ref(`users/${userId}/people/${contact}`).remove();
    };

    // ===== Wishes =====
    const getWishes = async (contact) => {
        if (!db) return [];
        const snapshot = await db.ref(`wishes/${contact}`).once('value');
        const wishesData = snapshot.val();
        return wishesData ? Object.keys(wishesData).map(key => ({...wishesData[key], firebaseId: key})) : [];
    };

    const addWish = async (wish) => {
        if (!db) throw new Error("Database not connected.");
        await db.ref(`wishes/${wish.recipientContact}`).push(wish);
    };

    const markWishAsPlayed = async (playedWish) => {
       if (!db || !playedWish.firebaseId) throw new Error("Cannot mark wish as played without its ID.");
       await db.ref(`wishes/${playedWish.recipientContact}/${playedWish.firebaseId}/played`).set(true);
    };

    // ===== Admin & Requests =====
    const saveRequest = async (type, request) => {
         if (!db) throw new Error("Database not connected.");
         await db.ref(`requests/${type}/${request.contact}`).set(request);
    };
    
    const getRequest = async (type, contact) => {
        if (!db) return null;
        const snapshot = await db.ref(`requests/${type}/${contact}`).once('value');
        return snapshot.val();
    };
    
    const deleteRequest = async (type, contact) => {
        if (!db) throw new Error("Database not connected.");
        await db.ref(`requests/${type}/${contact}`).remove();
    };
    
    const getAdminMessages = async (contact) => {
        if(!db) return [];
        const snapshot = await db.ref(`messages/${contact}`).orderByChild('timestamp').once('value');
        const messagesData = snapshot.val();
        return messagesData ? Object.values(messagesData) : [];
    };
    
    // This action doesn't persist, it's just for the current session UI update
    const markAdminMessagesAsRead = (contact) => {
        // This is now a client-side only operation for the session.
        // The data will appear as unread again on next load, which is acceptable.
        // A more complex solution would involve storing read status in the DB per user.
    };

    // Initialize the module
    init();

    return {
        // Profile
        saveProfile, getCurrentProfile, fetchProfileByContact, logout, setCurrentProfile,
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
