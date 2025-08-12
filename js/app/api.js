const Api = (() => {
    let db = null;
    let useLocal = false;
    let localProfile = null; // Cache for local profile to reduce localStorage reads

    // Initialize Firebase and determine mode (Firebase vs. Local)
    const init = () => {
        db = initializeFirebase();
        if (!db) {
            console.warn("API operating in Local Storage mode.");
            useLocal = true;
        } else {
            console.log("API operating in Firebase mode.");
            useLocal = false;
        }
        localProfile = getLocal('profile'); // Initial load of local profile
    };

    // --- Helper Functions ---
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
        const profile = getLocalProfile();
        return profile ? profile.contact : null;
    };

    // ===== Profile & Auth =====
    const saveProfile = async (profile) => {
        localProfile = profile; // Update local cache
        setLocal('profile', profile); // Always save to local for session persistence
        if (!useLocal) {
            await db.ref(`users/${profile.contact}/profile`).set(profile);
        }
    };
    
    // getLocalProfile is synchronous and used for immediate UI updates
    const getLocalProfile = () => {
        if (!localProfile) {
            localProfile = getLocal('profile');
        }
        return localProfile;
    };
    
    // This function can be used to sync profile from DB if needed
    const syncProfileFromDb = async () => {
        const userId = getUserId();
        if (useLocal || !userId) return getLocalProfile();
        const snapshot = await db.ref(`users/${userId}/profile`).once('value');
        const profile = snapshot.val();
        if(profile) {
            localProfile = profile;
            setLocal('profile', profile);
        }
        return profile;
    };

    const getUserRole = () => getLocal('userRole');
    const saveUserRole = (role) => setLocal('userRole', role);


    // ===== People =====
    const getPeople = async () => {
        const userId = getUserId();
        if (useLocal || !userId) return getLocal('people') || [];
        const snapshot = await db.ref(`users/${userId}/people`).once('value');
        return snapshot.val() ? Object.values(snapshot.val()) : [];
    };

    const addPerson = async (person) => {
        const userId = getUserId();
        if (useLocal || !userId) {
            const people = getLocal('people') || [];
            people.push(person);
            return setLocal('people', people);
        }
        // In Firebase, we can use the person's contact as the key for easy lookup
        await db.ref(`users/${userId}/people/${person.contact}`).set(person);
    };

    const deletePerson = async (id, contact) => {
        const userId = getUserId();
        if (useLocal || !userId) {
            let people = getLocal('people') || [];
            people = people.filter(p => p.id !== id);
            return setLocal('people', people);
        }
        await db.ref(`users/${userId}/people/${contact}`).remove();
    };

    // ===== Wishes =====
    const getWishes = async (contact) => {
        if (useLocal) return getLocal('birthdayWishes') || [];
        const snapshot = await db.ref(`wishes/${contact}`).once('value');
        return snapshot.val() ? Object.values(snapshot.val()) : [];
    };

    const addWish = async (wish) => {
        if (useLocal) {
            const wishes = getLocal('birthdayWishes') || [];
            wish.id = `wish_${Date.now()}`;
            wishes.push(wish);
            return setLocal('birthdayWishes', wishes);
        }
        // Push generates a unique ID in Firebase
        await db.ref(`wishes/${wish.recipientContact}`).push(wish);
    };

    const markWishAsPlayed = async (wish) => {
        // This is a client-side only state, so localStorage is fine even in Firebase mode.
        // Or we would need a more complex data structure in Firebase (e.g., /wishes/{contact}/{wishId}/playedBy/{userId})
        // For simplicity, we keep this local.
        let wishes = getLocal('birthdayWishes') || [];
        const index = wishes.findIndex(w => w.id === wish.id);
        if (index > -1) {
            wishes[index].played = true;
            setLocal('birthdayWishes', wishes);
        }
    };
    
    const _getRequestRef = (type) => {
        const paths = {
            nameChange: 'requests/nameChanges',
            reRegistration: 'requests/reRegistrations'
        };
        return db.ref(paths[type]);
    }

    // ===== Admin & Requests =====
    const saveRequest = async (type, request) => {
        const localKey = type === 'nameChange' ? 'nameChangeRequest' : 'reRegistrationRequest';
         if (useLocal) return setLocal(localKey, request);
         await _getRequestRef(type).child(request.contact).set(request);
    };
    
    const getRequest = async (type, contact) => {
        const localKey = type === 'nameChange' ? 'nameChangeRequest' : 'reRegistrationRequest';
        if (useLocal) return getLocal(localKey);
        const snapshot = await _getRequestRef(type).child(contact).once('value');
        return snapshot.val();
    };
    
    const getAllRequests = async (type) => {
        if (useLocal) {
            const localKey = type === 'nameChange' ? 'nameChangeRequest' : 'reRegistrationRequest';
            const req = getLocal(localKey);
            return req ? { [req.contact]: req } : {};
        }
        const snapshot = await _getRequestRef(type).once('value');
        return snapshot.val() || {};
    };

    const deleteRequest = async (type, contact) => {
        if (useLocal) {
            const localKey = type === 'nameChange' ? 'nameChangeRequest' : 'reRegistrationRequest';
            return setLocal(localKey, null);
        }
        await _getRequestRef(type).child(contact).remove();
    };
    
    const getAllUsers = async () => {
        if (useLocal) {
            const profile = getLocalProfile();
            const people = getLocal('people') || [];
            return profile ? [profile, ...people] : people;
        }
        const snapshot = await db.ref('users').once('value');
        const usersData = snapshot.val();
        return usersData ? Object.values(usersData).map(u => u.profile) : [];
    };
    
    const updateUserName = async (contact, newName) => {
        if (useLocal) {
             let profile = getLocalProfile();
             if (profile && profile.contact === contact) {
                 profile.name = newName;
                 saveProfile(profile);
             }
             return;
        }
        await db.ref(`users/${contact}/profile/name`).set(newName);
    };
    
    const deleteUserByContact = async (contact) => {
        if(useLocal) {
            // In local mode, we only delete from connections, not the main profile
             let people = getLocal('people') || [];
             setLocal('people', people.filter(p => p.contact !== contact));
             return;
        }
        await db.ref(`users/${contact}`).remove();
    };

    // Admin Messages can also be moved to Firebase
    const addAdminMessage = async (message) => {
        const recipientContact = message.recipientContact;
        if(useLocal){
            let messages = getLocal('adminMessages') || [];
            message.id = `msg_${Date.now()}`;
            messages.push(message);
            return setLocal('adminMessages', messages);
        }
        await db.ref(`messages/${recipientContact}`).push(message);
    };

    const getAdminMessages = async (contact) => {
        if(useLocal) {
            const all = getLocal('adminMessages') || [];
            return all.filter(m => m.recipientContact === contact);
        }
        const snapshot = await db.ref(`messages/${contact}`).once('value');
        const messagesData = snapshot.val();
        return messagesData ? Object.values(messagesData) : [];
    };
    
    const markAdminMessagesAsRead = async (contact) => {
         // This is a client-side action, so we can keep it local
         // Or implement a more complex read-status system in Firebase.
         let messages = getLocal('adminMessages') || [];
         messages.forEach(m => {
            if(m.recipientContact === contact) m.read = true;
         });
         setLocal('adminMessages', messages);
    };

    // Initialize the module
    init();

    return {
        saveProfile, getLocalProfile, getUserRole, saveUserRole,
        getPeople, addPerson, deletePerson,
        getWishes, addWish, markWishAsPlayed,
        addAdminMessage, getAdminMessages, markAdminMessagesAsRead,
        saveRequest, getRequest, getAllRequests, deleteRequest,
        getAllUsers, updateUserName, deleteUserByContact,
    };
})();
