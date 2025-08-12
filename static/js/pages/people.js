
const PeoplePage = (() => {

    let mediaRecorder = null;
    let audioChunks = [];
    let recordedAudioUri = null;
    const app = document.getElementById('app');

    const init = async () => {
        app.innerHTML = `<div class="container mx-auto px-4 py-8 md:py-12"><div id="people-grid">${UIComponents.getSpinnerHTML()}</div></div>`;
        await loadPeople();
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

    const render = (people) => {
        const { getNextBirthday } = UICore.dateHelpers;
        const today = new Date(); today.setHours(0,0,0,0);
        const sortedPeople = people.sort((a,b) => getNextBirthday(new Date(a.birthday)) - getNextBirthday(new Date(b.birthday)));

        app.innerHTML = `
            <div class="container mx-auto px-4 py-8 md:py-12">
                <header class="mb-8 flex justify-between items-center">
                    <div>
                        <h1 class="text-4xl font-bold flex items-center gap-3 gradient-text">
                         ${UIComponents.getIcon('Users')} Connections
                        </h1>
                        <p class="text-muted-foreground">Manage your birthday connections.</p>
                    </div>
                    <button id="add-person-btn" class="btn primary">
                        ${UIComponents.getIcon('PlusCircle', {class: "mr-2 h-4 w-4"})} Add Connection
                    </button>
                </header>
                <div id="people-grid" class="people-grid-container">
                    ${sortedPeople.length > 0 ? sortedPeople.map(p => UIComponents.getPersonCardHTML(p)).join('') : UIComponents.getEmptyPlaceholderHTML('No Connections Yet', 'Click "Add Connection" to connect with your friends and family.')}
                </div>
            </div>`;
        bindEvents(sortedPeople);
    }
    
    const loadPeople = async () => {
        try {
            const people = await Api.getPeople();
            render(people);
            
            const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
            const wishPersonId = urlParams.get('wish');
            if (wishPersonId) {
                const personToWish = people.find(p => p.id === wishPersonId);
                if (personToWish) {
                    openWishStation(personToWish);
                    window.history.replaceState(null, null, window.location.pathname + '#people');
                }
            }

        } catch (error) {
            console.error("Failed to load people:", error);
            document.getElementById('people-grid').innerHTML = UIComponents.getEmptyPlaceholderHTML('Error', 'Could not load your connections.');
        }
    };

    const bindEvents = (people) => {
        document.getElementById('add-person-btn')?.addEventListener('click', handleAddPerson);
        people.forEach(person => {
            const cardElement = document.querySelector(`.person-card[data-person-id="${person.id}"]`);
            
            cardElement?.querySelector('.btn-delete-person')?.addEventListener('click', (e) => {
               e.stopPropagation();
               handleDeletePerson(person);
            });
            
            cardElement?.querySelector('.avatar-trigger')?.addEventListener('click', (e) => {
               e.stopPropagation();
               UIComponents.showAvatarModal(person.avatar, person.name);
            });

            if (cardElement?.classList.contains('clickable')) {
                cardElement.addEventListener('click', () => openWishStation(person));
            }
       });
    };

    const handleDeletePerson = (person) => {
         const modalId = UICore.showModal(
            'Are you sure?',
            `<p class="text-sm text-muted-foreground">This will remove ${person.name} from your connections.</p>`,
            'delete-person-modal',
            [
                {id: 'cancel-delete', text: 'Cancel', variant: 'outline', closes: true},
                {id: 'confirm-delete', text: 'Remove', variant: 'destructive'}
            ],
            async (modal, mId, buttonId) => {
                if(buttonId !== 'confirm-delete') return;

                const confirmBtn = modal.querySelector('#confirm-delete');
                UICore.setButtonLoading(confirmBtn, true, 'Removing...');
                try {
                    await Api.deletePerson(person.id, person.contact);
                    const updatedPeople = await Api.getPeople();
                    sendBirthdaysToNative(updatedPeople);
                    await loadPeople();
                    UICore.showToast({ title: "Connection Removed", description: `${person.name} removed from your connections.` });
                    UICore.closeModal(modalId);
                } catch (error) {
                    UICore.showToast({ title: "Error", description: "Failed to remove connection.", variant: "destructive" });
                    UICore.setButtonLoading(confirmBtn, false, 'Remove');
                }
            }
        );
    };

    const handleAddPerson = () => {
        const modalId = UICore.showModal(
            `<span class="flex items-center gap-2 text-primary">${UIComponents.getIcon('User', {class:"w-5 h-5"})} Add New Connection</span>`,
            UIComponents.getAddPersonModalContentHTML(),
            'add-person-modal',
            [],
            (modal, mId, buttonId, event) => {
                const target = event.target.closest('button');
                if (target && target.id === 'add-manual-btn') {
                    window.location.hash = 'add-person';
                    UICore.closeModal(modalId);
                } else if (target && target.id === 'scan-qr-btn') {
                     UICore.showToast({ title: 'Feature Not Available', description: 'QR scanning is only available in the native app version.', variant: 'default' });
                }
            },
            'How would you like to add a new person to your connections?',
            {isEventDelegation: true}
        );
    };

    const openWishStation = (person) => {
        recordedAudioUri = null;
        const modalId = UICore.showModal(
            `<span class="flex items-center gap-2">${UIComponents.getIcon('Gift', {class:'text-primary'})} Wish ${person.name} a Happy Birthday!</span>`,
            UIComponents.getWishStationContentHTML(),
            'wish-station-modal',
            [
                { id: 'cancel-wish-btn', text: 'Cancel', variant: 'outline', closes: true },
                { id: 'send-wish-btn', text: `${UIComponents.getIcon('Send', {class:'mr-2'})} Send Wish`, variant: 'default' }
            ],
            (modal) => {
                const suggestBtn = modal.querySelector('#suggest-btn');
                const recordBtn = modal.querySelector('#record-btn');
                const sendBtn = modal.querySelector('#send-wish-btn');
                
                suggestBtn.addEventListener('click', () => handleGenerateSuggestions(person, modal));
                recordBtn.addEventListener('mousedown', startRecording);
                recordBtn.addEventListener('mouseup', stopRecording);
                recordBtn.addEventListener('touchstart', startRecording);
                recordBtn.addEventListener('touchend', stopRecording);
                sendBtn.addEventListener('click', () => handleSendWish(person, modal, modalId));
            },
            'Record an audio message and/or write a note.'
        );
    };

    const handleGenerateSuggestions = (person, wishStationModal) => {
        const suggestionsModalId = UICore.showModal(
            `<span class="flex items-center gap-2">${UIComponents.getIcon('Sparkles', {class:'text-primary'})} Message Suggestions</span>`,
            `<div class="h-72 w-full rounded-md border p-4">${UIComponents.getLoadingSkeletonHTML('suggestion', 5)}</div>`,
            'suggestions-modal',
            [{ id: 'close-suggestions', text: 'Close', variant: 'ghost', closes: true }],
            (suggestionsModal) => {
                 setTimeout(() => {
                    const suggestions = [
                        `Happy Birthday, ${person.name}! Hope you have a fantastic day.`,
                        `Wishing you all the best on your birthday, ${person.name}!`,
                        `Happy Birthday! May your day be as amazing as you are.`,
                        `Cheers to another year, ${person.name}! Happy Birthday!`,
                        `Hope you get everything you wished for, ${person.name}! Happy Birthday.`
                    ];
                    suggestionsModal.querySelector('.modal-body').innerHTML = UIComponents.getSuggestionsListHTML(suggestions);
                    suggestionsModal.querySelectorAll('.suggestion-item').forEach(item => {
                        item.addEventListener('click', () => {
                            wishStationModal.querySelector('#wish-message').value = item.textContent.trim();
                            UICore.closeModal(suggestionsModalId);
                        });
                    });
                }, 1500);
            },
            `Here are some AI-powered suggestions for ${person.name}. Click one to use it.`
        );
    };

    const startRecording = async (e) => {
        e.preventDefault();
        const recordBtn = document.getElementById('record-btn');
        const recordStatus = document.getElementById('record-status');
        if (!recordBtn || !recordStatus) return;

        recordBtn.classList.add('is-recording');
        recordStatus.innerHTML = `<p class="text-destructive font-medium">Recording...</p>`;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = []; recordedAudioUri = null;
            mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    recordedAudioUri = reader.result;
                    recordStatus.innerHTML = `<p class="text-primary font-medium flex items-center gap-2">${UIComponents.getIcon('CheckCircle', {size: 16})} Audio recorded!</p>`;
                };
                 mediaRecorder.stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.start();
        } catch (err) {
            recordStatus.innerHTML = `<p>Tap and hold to record</p>`;
            recordBtn.classList.remove('is-recording');
            UICore.showToast({ title: 'Microphone Access Denied', description: 'Please enable microphone permissions.', variant: 'destructive' });
        }
    };

    const stopRecording = (e) => {
        e.preventDefault();
        const recordBtn = document.getElementById('record-btn');
        if (recordBtn) recordBtn.classList.remove('is-recording');
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
    };

    const handleSendWish = async (person, modal, modalId) => {
        const message = modal.querySelector('#wish-message').value;
        if (!message && !recordedAudioUri) return UICore.showToast({ title: "Empty Wish", description: "Please write a message or record audio.", variant: "destructive" });
        
        const sendBtn = modal.querySelector('#send-wish-btn');
        UICore.setButtonLoading(sendBtn, true, 'Sending...');

        try {
            const currentUser = Api.getLocalProfile();
            await Api.addWish({
                id: `wish_${person.contact}_${Date.now()}`, recipientContact: person.contact,
                senderName: currentUser.name, senderAvatar: currentUser.avatar,
                textMessage: message, audioDataUri: recordedAudioUri,
                timestamp: new Date().toISOString(), played: false
            });
            
            if (message) { window.open(`https://wa.me/${person.contact}?text=${encodeURIComponent(message)}`, '_blank'); }
            UICore.showToast({ title: "Wish Saved In-App!", description: `${person.name} will see your wish in their app.` });
            UICore.closeModal(modalId);
        } catch (error) {
            UICore.showToast({ title: "Error", description: "Failed to send wish.", variant: "destructive" });
        } finally {
            if(sendBtn) UICore.setButtonLoading(sendBtn, false, `${UIComponents.getIcon('Send', {class:'mr-2'})} Send Wish`);
        }
    };

    return { init };
})();
