
const AdminPage = (() => {
    const app = document.getElementById('app');
    let allUsersCache = [];
    let nameChangeRequestsCache = {};
    let reRegRequestsCache = {};

    const init = async () => {
        renderSkeleton();
        // Load data sequentially to ensure the API has time to fetch from Firebase first
        allUsersCache = await Api.getAllUsers();
        nameChangeRequestsCache = await Api.getAllRequests('nameChange');
        reRegRequestsCache = await Api.getAllRequests('reRegistration');
        
        // Now that data is loaded and cached, render the full UI
        renderNameRequests();
        renderReRegRequests();
        renderAllUsers();
        bindGlobalEvents();
    };

    const renderSkeleton = () => {
        app.innerHTML = `
            <div class="container mx-auto px-4 py-8 md:py-12">
                <header class="mb-8">
                    <h1 class="text-4xl font-bold flex items-center gap-3">
                         ${UIComponents.getIcon('Shield', {class: 'text-primary'})} <span class="gradient-text">Admin Panel</span>
                    </h1>
                    <p class="text-muted-foreground">Manage pending user requests and view all users.</p>
                </header>
                <div class="grid md:grid-cols-2 gap-8">
                    <div class="space-y-8">
                        <div class="card">
                            <div class="card-header"><h3 class="card-title flex items-center gap-2 text-primary">${UIComponents.getIcon('User', {class:'text-primary'})} Name Change Request</h3><p class="card-description">Review the pending name change request below.</p></div>
                            <div class="card-content" id="name-requests-container">${UIComponents.getSpinnerHTML()}</div>
                        </div>
                        <div class="card">
                           <div class="card-header"><h3 class="card-title flex items-center gap-2 text-primary">${UIComponents.getIcon('ShieldQuestion', {class:'text-primary'})} Re-Registration Request</h3><p class="card-description">Review the pending request to re-register a number.</p></div>
                            <div class="card-content" id="rereg-requests-container">${UIComponents.getSpinnerHTML()}</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <div class="flex justify-between items-center">
                                <h3 class="card-title flex items-center gap-2">
                                    <span class="gradient-text flex items-center gap-2">${UIComponents.getIcon('Users')} All Users (<span id="user-count">...</span>)</span>
                                </h3>
                                <button id="search-toggle-btn" class="btn btn-icon ghost">${UIComponents.getIcon('Search', {class: 'h-5 w-5'})}</button>
                            </div>
                             <div id="search-container" class="mt-2 hidden"><input id="search-input" class="input" placeholder="Search by name or contact number..."></div>
                        </div>
                        <div class="card-content" id="all-users-container">${UIComponents.getSpinnerHTML()}</div>
                    </div>
                </div>
            </div>
        `;
    };

    const bindGlobalEvents = () => {
        document.getElementById('search-toggle-btn')?.addEventListener('click', (e) => {
            const searchContainer = document.getElementById('search-container');
            const isVisible = !searchContainer.classList.contains('hidden');
            searchContainer.classList.toggle('hidden', isVisible);
            e.currentTarget.innerHTML = isVisible ? UIComponents.getIcon('Search', { class: 'h-5 w-5' }) : UIComponents.getIcon('X', { class: 'h-5 w-5' });
        });
        document.getElementById('search-input')?.addEventListener('input', (e) => renderAllUsers(e.target.value));
    };

    const renderNameRequests = () => {
        const container = document.getElementById('name-requests-container');
        const requests = nameChangeRequestsCache;
        const pendingRequests = requests ? Object.values(requests).filter(r => r.status === 'pending') : [];
        
        if (pendingRequests.length > 0) {
            container.innerHTML = pendingRequests.map(request => `
                <div class="space-y-4">
                    <div><p class="text-sm text-muted-foreground">Requested by Contact</p><p class="font-semibold">${request.contact}</p></div>
                    <div><p class="text-sm text-muted-foreground">Reason</p><p class="font-semibold">${request.reason}</p></div>
                    <div><p class="text-sm text-muted-foreground">Requested New Name</p><p class="font-semibold text-primary">${request.newName}</p></div>
                    <div class="flex justify-end gap-2 pt-4">
                        <button class="btn destructive reject-name-btn" data-contact="${request.contact}">${UIComponents.getIcon('UserX', {class:'mr-2'})} Reject</button>
                        <button class="btn primary approve-name-btn" data-contact="${request.contact}">${UIComponents.getIcon('UserCheck', {class:'mr-2'})} Approve</button>
                    </div>
                </div>`
            ).join('');
            
            document.querySelectorAll('.reject-name-btn').forEach(b => b.addEventListener('click', (e) => handleNameRequestUpdate(requests[b.dataset.contact], 'rejected', e.currentTarget)));
            document.querySelectorAll('.approve-name-btn').forEach(b => b.addEventListener('click', (e) => handleNameRequestUpdate(requests[b.dataset.contact], 'approved', e.currentTarget)));

        } else {
            container.innerHTML = UIComponents.getEmptyPlaceholderHTML('No Pending Name Changes', 'There are currently no name change requests to review.', null, null, 'Ghost');
        }
    };

    const renderReRegRequests = () => {
        const container = document.getElementById('rereg-requests-container');
        const requests = reRegRequestsCache;
        const pendingRequests = requests ? Object.values(requests).filter(r => r.status === 'pending') : [];

        if (pendingRequests.length > 0) {
             container.innerHTML = pendingRequests.map(request => `
                <div class="space-y-4">
                    <div><p class="text-sm text-muted-foreground flex items-center gap-2">${UIComponents.getIcon('Phone', {size:14})} Contact Number</p><p class="font-semibold">${request.contact}</p></div>
                    <div><p class="text-sm text-muted-foreground flex items-center gap-2">${UIComponents.getIcon('MessageSquare', {size:14})} Reason</p><p class="font-semibold text-primary">${request.reason}</p></div>
                    <div class="flex justify-end gap-2 pt-4">
                        <button class="btn destructive reject-rereg-btn" data-contact="${request.contact}">${UIComponents.getIcon('UserX', {class:'mr-2'})} Reject</button>
                        <button class="btn primary approve-rereg-btn" data-contact="${request.contact}">${UIComponents.getIcon('UserCheck', {class:'mr-2'})} Approve</button>
                    </div>
                </div>`
            ).join('');

            document.querySelectorAll('.reject-rereg-btn').forEach(b => b.addEventListener('click', (e) => handleReRegRequestUpdate(requests[b.dataset.contact], 'rejected', e.currentTarget)));
            document.querySelectorAll('.approve-rereg-btn').forEach(b => b.addEventListener('click', (e) => handleReRegRequestUpdate(requests[b.dataset.contact], 'approved', e.currentTarget)));
        } else {
            container.innerHTML = UIComponents.getEmptyPlaceholderHTML('No Pending Re-Registrations', 'There are currently no re-registration requests to review.', null, null, 'Ghost');
        }
    };
    
    const renderAllUsers = (query = '') => {
        const container = document.getElementById('all-users-container');
        const adminProfile = Api.getLocalProfile();
        
        if (!allUsersCache) {
             container.innerHTML = `<div class="text-center py-8"><p class="text-muted-foreground">No users found.</p></div>`;
             return;
        }

        const filtered = allUsersCache.filter(p => 
            p && (p.name.toLowerCase().includes(query.toLowerCase()) || 
            (p.contact || '').includes(query))
        );

        document.getElementById('user-count').textContent = filtered.length;

        if (filtered.length > 0) {
            container.innerHTML = `<div class="space-y-4">${filtered.map(p => getUserRowHTML(p, adminProfile)).join('')}</div>`;
            bindUserRowEvents(filtered, adminProfile);
        } else {
            container.innerHTML = `<div class="text-center py-8"><p class="text-muted-foreground">No users found for your search.</p></div>`;
        }
    };
    
    const bindUserRowEvents = (users, adminProfile) => {
        users.forEach(person => {
            const row = document.querySelector(`.user-row[data-contact="${person.contact}"]`);
            if (row) {
                if (person.role !== 'admin' && person.contact !== adminProfile.contact) {
                    row.querySelector('.message-btn')?.addEventListener('click', () => openMessageDialog(person));
                    row.querySelector('.delete-btn')?.addEventListener('click', () => handleDeleteUser(person));
                }
                row.querySelector('.avatar-trigger')?.addEventListener('click', () => UIComponents.showAvatarModal(person.avatar, person.name));
            }
        });
    };

    const handleNameRequestUpdate = async (request, status, button) => {
        if (!request) return;
        UICore.setButtonLoading(button, true);
        try {
            if (status === 'approved') {
                await Api.updateUserName(request.contact, request.newName);
            }
            await Api.saveRequest('nameChange', { ...request, status }); // Save status change
            // No, we should NOT delete the request. We should mark it as resolved. For simplicity now we save and refresh.
            
            // Re-fetch data to reflect changes
            nameChangeRequestsCache = await Api.getAllRequests('nameChange');
            allUsersCache = await Api.getAllUsers();
            
            // Re-render components
            renderNameRequests();
            renderAllUsers();
            UICore.showToast({ title: `Request ${status}`, description: `The name change request has been updated.` });
        } catch (error) {
            UICore.showToast({ title: "Error", description: "Could not update request.", variant: "destructive" });
        } finally {
            UICore.setButtonLoading(button, false, status === 'approved' ? 'Approve' : 'Reject');
        }
    };

    const handleReRegRequestUpdate = async (request, status, button) => {
        if (!request) return;
        UICore.setButtonLoading(button, true);
        try {
            if (status === 'approved') {
                await Api.deleteUserByContact(request.contact);
            }
            await Api.saveRequest('reRegistration', { ...request, status });
            
            reRegRequestsCache = await Api.getAllRequests('reRegistration');
            allUsersCache = await Api.getAllUsers();

            renderReRegRequests();
            renderAllUsers();
            UICore.showToast({ title: `Request ${status}`, description: `The re-registration request has been updated.` });
        } catch (error) {
            UICore.showToast({ title: "Error", description: "Could not update request.", variant: "destructive" });
        } finally {
            UICore.setButtonLoading(button, false, status === 'approved' ? 'Approve' : 'Reject');
        }
    };
    
    const handleDeleteUser = (personToDelete) => {
        const modalId = UICore.showModal(
            'Are you sure?', 
            `<p class="text-sm text-muted-foreground">This action will permanently delete ${personToDelete.name}. This cannot be undone.</p>`,
            'confirm-user-delete-modal',
            [
                {id: 'cancel-delete', text: 'Cancel', variant: 'outline', closes: true},
                {id: 'confirm-user-delete', text: 'Delete User', variant: 'destructive'}
            ],
            async (modal, mId, buttonId) => {
                if (buttonId !== 'confirm-user-delete') return;

                const confirmBtn = modal.querySelector('#confirm-user-delete');
                UICore.setButtonLoading(confirmBtn, true, 'Deleting...');
                try {
                    await Api.deleteUserByContact(personToDelete.contact);
                    allUsersCache = await Api.getAllUsers();
                    renderAllUsers();
                    UICore.showToast({ title: "User Deleted", description: `${personToDelete.name} has been removed.` });
                    UICore.closeModal(modalId);
                } catch (error) {
                    UICore.showToast({ title: "Error", description: `Could not delete ${personToDelete.name}.`, variant: "destructive" });
                    UICore.setButtonLoading(confirmBtn, false, 'Delete User');
                }
            }
        );
    };

    const openMessageDialog = (person) => {
        const modalId = UICore.showModal(
            `<span class="text-primary">Send Message to ${person.name}</span>`, 
            `<div><textarea id="admin-message-content" class="textarea" style="height: 120px;" placeholder="Type your message here..."></textarea></div>`,
            'send-message-modal',
            [
                {id: 'cancel-msg', text: 'Cancel', variant: 'outline', closes: true},
                {id: 'send-msg', text: `${UIComponents.getIcon('Send', {class:'mr-2'})}Send Message`, variant: 'default'}
            ],
            async (modal, mId, buttonId) => {
                if (buttonId !== 'send-msg') return;

                const sendBtn = modal.querySelector('#send-msg');
                const content = modal.querySelector('#admin-message-content').value;
                if (content) {
                    UICore.setButtonLoading(sendBtn, true, 'Sending...');
                    try {
                        await Api.addAdminMessage({
                            recipientContact: person.contact,
                            message: content,
                            timestamp: new Date().toISOString(),
                            read: false,
                        });
                        UICore.showToast({ title: "Message Sent!", description: `Your message has been sent to ${person.name}.` });
                        UICore.closeModal(modalId);
                    } catch (error) {
                        UICore.showToast({ title: "Error", description: "Could not send the message.", variant: "destructive" });
                        UICore.setButtonLoading(sendBtn, false, `${UIComponents.getIcon('Send', {class:'mr-2'})}Send Message`);
                    }
                } else {
                    UICore.showToast({ title: "Message cannot be empty.", variant: "destructive" });
                }
            },
            'The user will be notified on their home page.'
        );
    };

    const getUserRowHTML = (person, adminProfile) => {
        if (!person) return '';
        const isAdmin = person.role === 'admin';
        return `
            <div class="user-row flex items-center justify-between p-2 rounded-md hover:bg-muted" data-contact="${person.contact}">
                <div class="flex items-center gap-4">
                    <div class="avatar-trigger cursor-pointer">
                        ${UIComponents.getAvatarWithFallbackHTML(person.avatar, person.name, 'w-12 h-12')}
                    </div>
                    <div>
                        <div class="font-semibold flex items-center gap-2">
                            ${person.name}
                            ${isAdmin ? '<div class="badge">Admin</div>' : ''}
                        </div>
                        <p class="text-sm text-muted-foreground">
                            Contact: ${person.contact}
                        </p>
                    </div>
                </div>
                <div class="flex items-center">
                    ${!isAdmin && person.contact !== adminProfile.contact ? `
                        <button class="btn btn-icon ghost message-btn" title="Send Message">${UIComponents.getIcon('MessageSquare', {class:'h-5 w-5 text-primary'})}</button>
                        <button class="btn btn-icon ghost delete-btn" title="Delete User">${UIComponents.getIcon('Trash2', {class:'h-5 w-5 text-destructive'})}</button>
                    ` : ''}
                </div>
            </div>`;
    };

    return { init };
})();
