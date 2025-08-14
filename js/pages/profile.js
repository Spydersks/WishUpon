
const ProfilePage = (() => {
    const app = document.getElementById('app');
    let profileData = null; // This will hold the profile for the page's lifecycle
    let isSetup = false;
    let termsAccepted = false;
    
    let maxDate = '';

    const init = async () => {
        // Always start fresh. Get the profile from the current session or set up a new one.
        profileData = Api.getCurrentProfile();
        isSetup = !profileData;
        
        if (isSetup) {
            profileData = { name: 'Anonymous User', birthday: '', contact: '', avatar: '' };
        }
        
        const today = new Date();
        maxDate = today.toISOString().split("T")[0];

        termsAccepted = !isSetup;
        render();
        bindEvents();
    };
    
    const render = () => {
        const pageTitle = isSetup ? 'Create Your Profile' : 'Your Profile';
        const pageDescription = isSetup ? 'Set up your profile to start connecting with friends.' : 'Manage your personal information and QR code.';
        
        app.innerHTML = `
            <div class="profile-container container mx-auto px-4 max-w-2xl pt-6">
                <header class="page-header text-center">
                    <h1 class="text-4xl font-bold flex items-center justify-center gap-3">
                        ${UIComponents.getIcon('User', {class: 'w-8 h-8 text-primary'})}
                        <span class="gradient-text">${pageTitle}</span>
                    </h1>
                    <p class="page-header-description">${pageDescription}</p>
                </header>

                <div class="space-y-8">
                    <div class="card">
                        <div class="card-header">
                            <h2 class="card-title flex items-center gap-2 text-primary">${isSetup ? 'Enter Your Details' : 'Your Details'}</h2>
                        </div>
                        <div class="card-content space-y-6">
                            <div class="flex justify-center">
                                <div class="relative group avatar-container">
                                    <div id="avatar-wrapper">
                                      ${UIComponents.getAvatarWithFallbackHTML(profileData.avatar, profileData.name, 'w-24 h-24')}
                                    </div>
                                    <button id="change-photo-btn" class="camera-btn btn btn-icon">
                                        ${UIComponents.getIcon('Camera', { class: 'h-5 w-5' })}
                                    </button>
                                </div>
                            </div>
                            <div class="space-y-4">
                                ${isSetup ? getSetupFieldsHTML(profileData) : getDisplayFieldsHTML(profileData)}
                            </div>
                        </div>
                    </div>
                     ${isSetup ? getSetupButtonsHTML() : getDisplayButtonsAndQrHTML(profileData)}
                </div>
            </div>`;
    };

    const getSetupFieldsHTML = (p) => {
        return `
            <div class="space-y-4">
                <div class="space-y-2">
                    <label for="name" class="label">Name</label>
                    <input type="text" id="name" class="input" placeholder="Your Full Name" value="${p.name === 'Anonymous User' ? '' : p.name}">
                    <p class="text-xs text-muted-foreground mt-1">You can apply to change this later if you're not an admin.</p>
                </div>
                <div class="space-y-2">
                    <label for="contact" class="label">WhatsApp Number</label>
                    <input type="tel" id="contact" class="input" placeholder="10-digit number" maxlength="10" value="${p.contact || ''}">
                    <p class="text-xs text-muted-foreground mt-1">This will be used to log in and cannot be changed.</p>
                </div>
                <div class="space-y-2">
                    <label for="birthday" class="label">Birthday</label>
                    <input type="date" id="birthday" class="input" max="${maxDate}" value="${p.birthday ? p.birthday.split('T')[0] : ''}">
                    <p class="text-xs text-muted-foreground mt-1">This cannot be changed after setup.</p>
                </div>
            </div>
            <div class="checkbox-group">
                <input type="checkbox" id="terms-checkbox" class="checkbox">
                <label for="terms-checkbox" class="text-sm font-normal">
                    I agree to the <button id="terms-link" class="btn link" style="text-decoration: underline;">Terms and Conditions</button>
                </label>
            </div>`;
    };

    const getDisplayFieldsHTML = (p) => `
        <div class="text-center space-y-1">
            <p class="text-2xl font-bold">${p.name}</p>
            <p class="text-muted-foreground">Contact: ${p.contact}</p>
            <p class="text-muted-foreground">Birthday: ${new Date(p.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>`;

    const getSetupButtonsHTML = () => `
        <div class="space-y-2">
            <button id="save-profile-btn" class="btn primary w-full btn-lg" disabled>
                ${UIComponents.getIcon('Save', { class: 'mr-2' })}Create Profile
            </button>
            <button id="contact-admin-btn" class="btn ghost w-full">
                ${UIComponents.getIcon('ShieldQuestion', { class: 'mr-2' })} Can't Register? Contact Admin
            </button>
        </div>`;

    const getDisplayButtonsAndQrHTML = (p) => `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title flex items-center gap-2 text-primary">${UIComponents.getIcon('QrCode',{class:'w-5 h-5'})} Your Connection Code</h3>
                <p class="card-description">Have friends scan this code to add you.</p>
            </div>
            <div class="card-content flex flex-col items-center justify-center text-center p-8">
               <div id="qr-code-img" class="p-2 bg-white rounded-lg shadow-md">
                ${p.name && p.contact ? `<img src="${UIComponents.getQrCodeUrl(p)}" alt="Your Profile QR Code" width="200" height="200" />` : '<div class="flex flex-col items-center justify-center h-[200px] w-[200px]"><p class="text-muted-foreground">Complete your profile to generate a QR code.</p></div>'}
               </div>
               <p class="text-muted-foreground mt-4 text-sm">Point your friend's camera at this code from their "People" page.</p>
            </div>
        </div>
        <div class="space-y-4">
             ${Api.getUserRole() !== 'admin' ? `<button id="edit-profile-btn" class="btn secondary w-full">Apply to Edit Profile ${UIComponents.getIcon('ArrowRight', {class:'ml-2'})}</button>` : ''}
             <button id="go-to-connections-btn" class="btn primary w-full">Go to Connections ${UIComponents.getIcon('Users', {class:'ml-2'})}</button>
             <button id="logout-btn" class="btn outline w-full">Log Out ${UIComponents.getIcon('ArrowLeft', {class:'ml-2'})}</button>
        </div>`;

    const bindEvents = () => {
        document.getElementById('change-photo-btn')?.addEventListener('click', handlePhotoUpdate);
        
        if (isSetup) {
            document.getElementById('save-profile-btn')?.addEventListener('click', handleSaveProfileSetup);
            document.getElementById('contact-admin-btn')?.addEventListener('click', handleContactAdmin);
            document.getElementById('terms-link')?.addEventListener('click', (e) => { e.preventDefault(); UIComponents.showTermsModal(); });
            const termsCheckbox = document.getElementById('terms-checkbox');
            if (termsCheckbox) {
                termsCheckbox.addEventListener('change', (e) => {
                    termsAccepted = e.target.checked;
                    document.getElementById('save-profile-btn').disabled = !e.target.checked;
                });
            }
            document.getElementById('name')?.addEventListener('input', (e) => { profileData.name = e.target.value; });
            document.getElementById('contact')?.addEventListener('input', (e) => { profileData.contact = e.target.value; });
            document.getElementById('birthday')?.addEventListener('input', (e) => { profileData.birthday = new Date(e.target.value).toISOString(); });
        } else {
            document.getElementById('go-to-connections-btn')?.addEventListener('click', () => { window.location.hash = '#people' });
            document.getElementById('edit-profile-btn')?.addEventListener('click', handleRequestNameChange);
            document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
        }
    };
    
    const handleLogout = () => {
        Api.logout();
        window.location.hash = '#profile';
        window.location.reload();
    };
    
    const handlePhotoUpdate = async () => {
        UICore.showPhotoTaker(async (dataUri) => {
            profileData.avatar = dataUri;
            document.getElementById('avatar-wrapper').innerHTML = UIComponents.getAvatarWithFallbackHTML(profileData.avatar, profileData.name, 'w-24 h-24');
            UICore.showToast({ title: "Photo selected!", description: "Remember to save your profile to confirm." });
            if(!isSetup) { // If profile already exists, save it immediately
                 await Api.saveProfile(profileData);
                 UICore.showToast({ title: "Photo updated!", description: "Your new photo has been saved." });
            }
        });
    };
    
    const handleSaveProfileSetup = async () => {
        if (!profileData.name || !profileData.name.trim() || profileData.name === "Anonymous User" || !profileData.birthday || !profileData.contact) {
            return UICore.showToast({ title: "Profile Incomplete", description: "Please fill out all fields before saving.", variant: "destructive" });
        }
        if (!/^\d{10}$/.test(profileData.contact)) {
            return UICore.showToast({ title: "Invalid Contact", description: "Please enter a valid 10-digit WhatsApp number.", variant: "destructive" });
        }
        if (!termsAccepted) {
            return UICore.showToast({ title: "Terms and Conditions", description: "You must agree to the terms and conditions to continue.", variant: "destructive" });
        }
       
        const saveBtn = document.getElementById('save-profile-btn');
        UICore.setButtonLoading(saveBtn, true, 'Creating Profile...');

        try {
            const userAlreadyExists = await Api.userExists(profileData.contact);
            if(userAlreadyExists) {
                UICore.showToast({ title: "Number Already Registered", description: "This contact number is already in use. Please use the 'Log in here' link instead.", variant: "destructive" });
                return;
            }

            const finalAvatar = profileData.avatar || `https://placehold.co/128x128.png?text=${profileData.name.split(' ').map(n => n[0]).join('')}&data-ai-hint=avatar`;
            const role = 'user'; // All new signups are users
            const newProfile = { id: `user_${profileData.contact}`, ...profileData, avatar: finalAvatar, role: role };

            await Api.saveProfile(newProfile);
            Api.saveUserRole(role);
            
            UICore.showToast({ title: "Profile Saved!", description: "Welcome! Your profile is saved." });
            window.location.hash = 'home';
        } catch (error) {
            UICore.showToast({ title: "Error", description: `An error occurred: ${error.message}`, variant: "destructive" });
        } finally {
            if(saveBtn) UICore.setButtonLoading(saveBtn, false, `${UIComponents.getIcon('Save', {class: 'mr-2'})}Create Profile`);
        }
    };
    
    const handleLogin = () => {
        UICore.showModal(
            'Log In',
            `<div class="space-y-2"><label for="login-contact" class="label">Enter your 10-digit contact number</label><input type="tel" id="login-contact" class="input" placeholder="10-digit number" maxlength="10"></div>`,
            'login-modal',
            [
                {id: 'cancel-login', text: 'Cancel', variant: 'outline', closes: true},
                {id: 'confirm-login', text: 'Log In', variant: 'primary'}
            ],
            async (modal, modalId, buttonId) => {
                if (buttonId !== 'confirm-login') return;

                const contactInput = modal.querySelector('#login-contact');
                const contact = contactInput.value;

                if (!/^\d{10}$/.test(contact)) {
                    return UICore.showToast({ title: "Invalid Number", description: "Please enter a valid 10-digit number.", variant: "destructive" });
                }

                const loginBtn = modal.querySelector('#confirm-login');
                UICore.setButtonLoading(loginBtn, true, 'Logging in...');
                
                try {
                    const profile = await Api.fetchProfileByContact(contact);
                    if (profile) {
                        Api.saveUserRole(profile.role || 'user');
                        UICore.showToast({ title: "Login Successful!", description: `Welcome back, ${profile.name}!` });
                        window.location.hash = 'home';
                        UICore.closeModal(modalId);
                    } else {
                        UICore.showToast({ title: "Login Failed", description: "No profile found with this number. Please create one.", variant: "destructive" });
                    }
                } catch(e) {
                    UICore.showToast({ title: "Error", description: "Could not perform login. Check connection.", variant: "destructive" });
                } finally {
                    UICore.setButtonLoading(loginBtn, false, 'Log In');
                }
            },
            'Enter the number you used to create your account.'
        );
    };

    const handleRequestNameChange = async () => {
        const currentRequest = await Api.getRequest('nameChange', profileData.contact);

        const actionHandlers = {
            onSubmit: async (newName, reason, modal, modalId) => {
                 const confirmBtn = modal.querySelector('#confirm-name-change-btn');
                 UICore.setButtonLoading(confirmBtn, true, 'Submitting...');
                 try {
                     if (!newName || !reason || newName === profileData.name) {
                        UICore.setButtonLoading(confirmBtn, false);
                        return UICore.showToast({ title: "Invalid Request", description: "Please provide a new, different name and a reason.", variant: "destructive" });
                     }
                     await Api.saveRequest('nameChange', {
                         contact: profileData.contact, newName, reason, status: 'pending'
                     });
                     UICore.showToast({title: "Request Sent", description: "Your name change request has been submitted."});
                     UICore.closeModal(modalId);
                 } catch(e) {
                      UICore.showToast({title: "Error", description: "Could not submit request.", variant: "destructive"});
                 } finally {
                     UICore.setButtonLoading(confirmBtn, false);
                 }
            },
            onCancel: async (modal, modalId) => {
                 await Api.deleteRequest('nameChange', profileData.contact);
                 UICore.showToast({ title: "Request Cancelled"});
                 UICore.closeModal(modalId);
            },
            onCheckStatus: async (modal, modalId) => {
                 const req = await Api.getRequest('nameChange', profileData.contact);
                 if (req && req.status === 'approved') {
                    const updatedProfile = await Api.fetchProfileByContact(profileData.contact);
                    Api.setCurrentProfile(updatedProfile);
                    UICore.showToast({ title: "Approved!", description: `Your name was changed to ${req.newName}.` });
                    await init(); // Re-init page to show fresh data
                    UICore.closeModal(modalId);
                 } else if (req && req.status === 'rejected') {
                    UICore.showToast({ title: "Request Rejected", variant: 'destructive'});
                    await Api.deleteRequest('nameChange', profileData.contact);
                    UICore.closeModal(modalId);
                 } else {
                    UICore.showToast({ title: "Still Pending", description: "Your request has not been reviewed yet." });
                 }
            }
        };
        
        UIComponents.showNameChangeModal(profileData, currentRequest, actionHandlers);
    };

    const handleContactAdmin = async () => {
        const myNumber = document.getElementById('contact')?.value;
        const currentRequest = myNumber ? await Api.getRequest('reRegistration', myNumber) : null;
        
        const submitHandler = async (modal, modalId) => {
            const contact = modal.querySelector('#contact-admin-number').value;
            const reason = modal.querySelector('#contact-admin-reason').value;
            
            if (!contact || !reason || !/^\d{10}$/.test(contact)) {
                return UICore.showToast({ title: 'Invalid Input', description: 'Please provide a valid 10-digit contact number and a reason.', variant: 'destructive' });
            }
            
            const confirmBtn = modal.querySelector('#submit-rereg-btn');
            UICore.setButtonLoading(confirmBtn, true, 'Submitting...');
            
            try {
                await Api.saveRequest('reRegistration', { contact, reason, status: 'pending' });
                UICore.showToast({ title: "Request Sent", description: "Your re-registration request has been sent." });
                UICore.closeModal(modalId);
            } catch(e) {
                 UICore.showToast({ title: "Error", description: "Could not submit request.", variant: "destructive" });
            } finally {
                UICore.setButtonLoading(confirmBtn, false);
            }
        };

        UIComponents.showReRegistrationModal(currentRequest, submitHandler);
    };

    return { init };
})();
