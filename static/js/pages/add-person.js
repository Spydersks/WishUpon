
const AddPersonPage = (() => {
    const app = document.getElementById('app');
    let personData = { name: '', birthday: '', contact: '', avatar: '' };
    let maxDate = '';

    const init = () => {
        const today = new Date();
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        maxDate = eighteenYearsAgo.toISOString().split("T")[0];

        render();
        bindEvents();
    };
    
    const sendBirthdaysToNative = (peopleList) => {
        if (window.Android && window.Android.scheduleAlarms) {
            console.log("Android interface found, sending birthday data for alarm scheduling.");
            const peopleJson = JSON.stringify(peopleList);
            window.Android.scheduleAlarms(peopleJson);
        } else {
            console.log("Android interface not found. Running in standard browser.");
        }
    };

    const render = () => {
        app.innerHTML = `
            <div class="container mx-auto px-4 py-8 md:py-12">
                <header class="mb-8">
                    <h1 class="text-4xl font-bold flex items-center gap-3">
                        ${UIComponents.getIcon('User', {class: 'w-8 h-8 text-primary'})}
                        <span class="gradient-text">Add New Connection</span>
                    </h1>
                    <p class="page-header-description">
                        Manually enter the details of the person you want to add.
                    </p>
                </header>

                <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div class="space-y-4 p-6 pt-6">
                        <div class="flex justify-center">
                            <div class="relative group avatar-container">
                                <div id="avatar-wrapper">
                                  ${UIComponents.getAvatarWithFallbackHTML(personData.avatar, personData.name, 'w-24 h-24')}
                                </div>
                                <button id="change-photo-btn" class="camera-btn btn btn-icon">
                                    ${UIComponents.getIcon('Camera', { class: 'h-5 w-5' })}
                                </button>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label for="name" class="label">Full Name</label>
                            <input id="name" class="input" placeholder="e.g. Jane Doe" value="${personData.name || ''}">
                        </div>

                        <div class="space-y-2">
                            <label for="birthday" class="label">Birthday</label>
                            <input id="birthday" type="date" max="${maxDate}" class="input" value="${personData.birthday ? personData.birthday.split('T')[0] : ''}">
                        </div>

                        <div class="space-y-2">
                            <label for="contact" class="label">WhatsApp Number</label>
                            <input id="contact" type="tel" class="input" placeholder="10-digit number" maxlength="10" value="${personData.contact || ''}">
                        </div>

                        <div class="flex justify-end gap-2 pt-4">
                            <button id="cancel-btn" class="btn secondary">
                                ${UIComponents.getIcon('ArrowLeft', { class: 'mr-2' })} Cancel
                            </button>
                            <button id="save-btn" class="btn primary">
                                ${UIComponents.getIcon('Save', { class: 'mr-2' })} Save Connection
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    };

    const bindEvents = () => {
        document.getElementById('name').addEventListener('input', (e) => handleChange('name', e.target.value));
        document.getElementById('birthday').addEventListener('input', (e) => handleChange('birthday', new Date(e.target.value).toISOString()));
        document.getElementById('contact').addEventListener('input', (e) => handleChange('contact', e.target.value));
        document.getElementById('change-photo-btn').addEventListener('click', handlePhotoUpdate);
        document.getElementById('cancel-btn').addEventListener('click', () => window.location.hash = 'people');
        document.getElementById('save-btn').addEventListener('click', handleSave);
    };

    const handleChange = (field, value) => {
        personData[field] = value;
        if(field === 'name') {
            document.getElementById('avatar-wrapper').innerHTML = UIComponents.getAvatarWithFallbackHTML(personData.avatar, personData.name, 'w-24 h-24');
        }
    };

    const handlePhotoUpdate = () => {
        UICore.showPhotoTaker((dataUri) => {
            personData.avatar = dataUri;
            document.getElementById('avatar-wrapper').innerHTML = UIComponents.getAvatarWithFallbackHTML(dataUri, personData.name, 'w-24 h-24');
            UICore.showToast({ title: "Photo selected!", description: "Save the connection to confirm." });
        });
    };

    const handleSave = async () => {
        if (!personData.name || !personData.birthday || !personData.contact) {
            return UICore.showToast({ title: "Incomplete Information", description: "Please fill out all fields.", variant: "destructive" });
        }
        if (!/^\d{10}$/.test(personData.contact)) {
            return UICore.showToast({ title: "Invalid Contact Number", description: "Please enter a valid 10-digit phone number.", variant: "destructive" });
        }

        const saveBtn = document.getElementById('save-btn');
        UICore.setButtonLoading(saveBtn, true, 'Saving...');

        try {
            const myProfile = Api.getLocalProfile();
            const existingPeople = await Api.getPeople();
            const isDuplicate = existingPeople.some(p => p.contact === personData.contact) || (myProfile && myProfile.contact === personData.contact);

            if(isDuplicate) {
                UICore.showToast({ title: "Connection Already Exists", description: "A person with this contact number is already in your connections or is your own profile.", variant: "destructive" });
                UICore.setButtonLoading(saveBtn, false, 'Save Connection');
                return;
            }
            
            const newPerson = {
                id: `person_${personData.contact}_${Date.now()}`,
                name: personData.name,
                birthday: personData.birthday,
                contact: personData.contact,
                avatar: personData.avatar || `https://placehold.co/128x128.png?text=${personData.name.split(' ').map(n => n[0]).join('')}&data-ai-hint=avatar`
            };

            await Api.addPerson(newPerson);
            const updatedPeople = await Api.getPeople();
            sendBirthdaysToNative(updatedPeople);
            
            UICore.showToast({ title: "Connection Added!", description: `${personData.name} has been added to your connections.` });
            window.location.hash = 'people';

        } catch (error) {
            console.error("Error saving connection:", error);
            UICore.showToast({ title: "Error", description: "Could not save connection. Please try again.", variant: "destructive" });
        } finally {
            if(saveBtn) UICore.setButtonLoading(saveBtn, false, `${UIComponents.getIcon('Save', {class:'mr-2'})}Save Connection`);
        }
    };

    return { init };
})();
