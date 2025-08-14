
const UIComponents = (() => {

    const icons = {
        User: `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>`,
        Home: `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>`,
        Users: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`,
        UserCircle: `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>`,
        PlusCircle: `<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>`,
        Shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>`,
        MoreVertical: `<circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>`,
        Menu: `<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>`,
        X: `<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>`,
        Camera: `<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle>`,
        Save: `<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline>`,
        QrCode: `<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect>`,
        ArrowRight: `<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>`,
        ArrowLeft: `<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>`,
        MessageSquare: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>`,
        PlayCircle: `<circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon>`,
        PartyPopper: `<path d="M5.8 11.3 2 22l10.7-3.79"></path><path d="m22 2-1.5 3.8-3.8-1.5L22 2z"></path><path d="M10.6 15.6 14 14l3.4 5.4"></path><path d="M14 2a3.4 3.4 0 1 1-4.8 4.8 3.4 3.4 0 1 1 4.8-4.8z"></path><path d="M14.8 12.2 6.4 20.6"></path>`,
        Cake: `<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"></path><path d="M4 16s.5-1 2-1 2.5 1 4 1 2.5-1 4-1 2.5 1 4 1 2-1 2-1"></path><path d="M2 21h20"></path><path d="M7 8v2"></path><path d="M12 8v2"></path><path d="M17 8v2"></path><path d="M7 4h.01"></path><path d="M12 4h.01"></path><path d="M17 4h.01"></path>`,
        BellRing: `<path d="M14 12a4 4 0 1 0-8 0"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M18.63 13A2.4 2.4 0 0 0 16 11.23V7a6 6 0 1 0-12 0v4.23c-.11.26-.22.52-.31.79a2.4 2.4 0 0 0 5.23 2.52"></path><path d="M20.66 17A2.4 2.4 0 0 1 22 19.36a1 1 0 0 1-1 1h-1"></path><path d="M3.34 17a2.4 2.4 0 0 0-1.2 2.36 1 1 0 0 0 1 1h1"></path>`,
        Trash2: `<path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>`,
        Search: `<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>`,
        UserX: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="17" y1="8" x2="22" y2="13"></line><line x1="22" y1="8" x2="17" y2="13"></line>`,
        UserCheck: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline>`,
        Ghost: `<path d="M9 10h.01"></path><path d="M15 10h.01"></path><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 21l3-3V10a8 8 0 0 0-8-8z"></path>`,
        Phone: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>`,
        Upload: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>`,
        Crop: `<path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path>`,
        ShieldQuestion: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path>`,
        HelpCircle: `<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line>`,
        XCircle: `<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>`,
        FileText: `<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line>`,
        Wand2: `<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"></path><path d="m14 7 3 3"></path><path d="M5 6v4"></path><path d="M19 14v4"></path><path d="M10 2v2"></path><path d="M7 8H3"></path><path d="M17 18H3"></path><path d="M21 10h-2"></path>`,
        Sparkles: `<path d="m12 3-1.9 4.2-4.1.6 3 2.9-1 4.3 4-2.2 4 2.2-1-4.3 3-2.9-4.1-.6L12 3Z"></path><path d="M5 12.5 3.1 17 2 12.5l-4.2-1.9L2 8.7 3.1 4 5 8.7l4.2 1.9L5 12.5Z"></path><path d="M19 12.5 17.1 17 16 12.5l-4.2-1.9L16 8.7 17.1 4 19 8.7l4.2 1.9L19 12.5Z"></path>`,
        Mic: `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line>`,
        StopCircle: `<circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6"></rect>`,
        Send: `<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>`,
        Gift: `<polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>`,
        CheckCircle: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>`,
        ShieldCheck: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path>`
    };
    
    const getIcon = (name, options = {}) => {
        const { size = 20, color = 'currentColor', class: className = '' } = options;
        const svgContent = icons[name] || '';
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${className}">${svgContent}</svg>`;
    };
    
    const getSpinnerHTML = (options = {}) => {
         const { size = 32 } = options;
         return `<div class="flex items-center justify-center p-4"><div class="spinner" style="width: ${size}px; height: ${size}px;"></div></div>`;
    }

    const getAvatarWithFallbackHTML = (avatar, name, className = '') => {
        const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '';
        const fallbackContent = `<div class="avatar-fallback">${initials ? `<span>${initials}</span>` : getIcon('User')}</div>`;
        return `
            <div class="avatar ${className}">
                ${avatar ? `<img src="${avatar}" class="avatar-img" alt="${name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"/>${fallbackContent}` : fallbackContent}
            </div>`;
    };

    const getEmptyPlaceholderHTML = (title, description, buttonText, buttonHref, iconName = 'Users') => `
        <div class="card text-center py-12 px-6 border-2 border-dashed rounded-lg">
            <div class="card-content flex flex-col items-center justify-center pt-6">
                ${getIcon(iconName, {size: 64, class: 'text-muted-foreground mb-4'})}
                <h3 class="text-xl font-semibold mb-2">${title}</h3>
                <p class="text-muted-foreground mb-6">${description || ''}</p>
                ${buttonText ? `<a href="${buttonHref}" class="btn primary">${buttonText}</a>` : ''}
            </div>
        </div>`;
    
    const getAddPersonModalContentHTML = () => `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <button id="add-manual-btn" class="btn secondary h-24 flex-col gap-2">
                ${getIcon('PlusCircle', {class:"w-6 h-6"})}
                <span class="text-base">Add Manually</span>
            </button>
            <button id="scan-qr-btn" class="btn secondary h-24 flex-col gap-2">
                ${getIcon('QrCode', {class:"w-6 h-6"})}
                <span class="text-base">Scan QR Code</span>
            </button>
        </div>`;

    const getQrCodeUrl = (profile) => {
         const profileDataForQr = JSON.stringify({
          id: profile.id, name: profile.name, birthday: profile.birthday,
          contact: profile.contact
      });
      return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(profileDataForQr)}&size=200x200&bgcolor=ffffff&t=${Date.now()}`;
    };

    const renderFloatingNav = () => {
        const navContainer = document.getElementById('floating-nav-container');
        if (!navContainer) return;

        const profile = Api.getCurrentProfile();
        const onSetupPage = window.location.hash.startsWith('#profile') && !profile;

        if (onSetupPage) {
            navContainer.innerHTML = '';
            return;
        }

        const userRole = Api.getUserRole();
        const allNavItems = [
            { href: "#home", label: "Home", iconName: 'Home', roles: ['user', 'admin'] },
            { href: "#people", label: "People", iconName: 'Users', roles: ['user', 'admin'] },
            { href: "#profile", label: "Profile", iconName: 'UserCircle', roles: ['user', 'admin'] },
        ];
        
        const navItems = allNavItems.filter(item => item.roles.includes(userRole));
        const path = window.location.hash || '#home';
    
        navContainer.innerHTML = `
            <div class="relative">
                <button id="nav-toggle" class="nav-toggle-btn">
                    <span class="icon-open">${getIcon('Menu', {class:"w-6 h-6"})}</span>
                    <span class="icon-close">${getIcon('X', {class:"w-6 h-6"})}</span>
                </button>
                <div id="nav-menu-popover" class="nav-menu-popover hidden">
                    <ul class="nav-menu">
                        ${navItems.map(item => `
                           <li class="nav-menu-item">
                               <a href="${item.href}" class="${path.startsWith(item.href) ? 'active' : ''}">
                                   <span class="icon">${getIcon(item.iconName)}</span>
                                   <span class="font-medium">${item.label}</span>
                               </a>
                           </li>
                        `).join('')}
                    </ul>
                </div>
            </div>`;
    
        const toggle = document.getElementById('nav-toggle');
        const menu = document.getElementById('nav-menu-popover');
        
        const handleToggle = (e) => {
            const isNavToggle = toggle && toggle.contains(e.target);
            const isMenuClick = menu && menu.contains(e.target);
            const isOpen = menu && !menu.classList.contains('hidden');

            if (isNavToggle) {
                menu.classList.toggle('hidden');
                toggle.classList.toggle('is-open', !menu.classList.contains('hidden'));
            } else if (isOpen && !isMenuClick) {
                menu.classList.add('hidden');
                toggle.classList.remove('is-open');
            }
        };
        
        document.body.addEventListener('click', handleToggle, true);
    };
    
    const getPersonCardHTML = (person) => {
        const { isSameDay, getNextBirthday, differenceInDays } = UICore.dateHelpers;
        const today = new Date(); 
        today.setHours(0, 0, 0, 0);
        
        const bday = new Date(person.birthday);
        bday.setHours(0,0,0,0);

        const isToday = isSameDay(bday, today, true);
        const nextBday = getNextBirthday(bday);
        const daysUntil = differenceInDays(nextBday, today);
        const isSoon = daysUntil > 0 && daysUntil <= 3;

        let cardClass = "person-card clickable";
        let cardContentHTML = '';
        let countdownText = '';
        let actionIcon = '';

        if(isToday) {
            cardClass += ' today wish-trigger';
            actionIcon = `<div class="cake-icon">${getIcon('Cake', { size: 24, color: 'white' })}</div>`;
        } else if (isSoon) {
            cardClass += ' soon';
            countdownText = `<p class="text-sm font-bold text-accent mt-1">in ${daysUntil} days</p>`;
        } else {
             countdownText = `<p class="text-sm text-muted-foreground mt-1">in ${daysUntil} days</p>`;
        }
        
        const avatarHTML = getAvatarWithFallbackHTML(person.avatar, person.name, 'w-24 h-24 mx-auto mb-2');
        
        cardContentHTML = `
            ${actionIcon}
            <div class="avatar-trigger cursor-pointer flex flex-col items-center">
                ${avatarHTML}
                <h3 class="person-card-title">${person.name}</h3>
                ${countdownText}
            </div>
        `;
        
        const innerCard = `<div class="person-card-inner">${cardContentHTML}</div>`;
        
        return `<div class="${cardClass}" data-person-id="${person.id}">${innerCard}</div>`;
    };
    
    const showAvatarModal = (avatar, name) => {
        const content = `<img src="${avatar || `https://placehold.co/512x512.png?text=${name.split(' ').map(n=>n[0]).join('')}`}" alt="${name}" class="rounded-lg w-full h-auto">`;
        UICore.showModal('', content, `avatar-modal-${Date.now()}`, [], null, '', { contentClass: 'p-0 bg-transparent border-none' });
    };
    
    const getWishStationContentHTML = () => `
        <div class="py-4 space-y-4">
           <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label for="wish-message" class="label">Write a message</label>
                <button id="suggest-btn" class="btn ghost text-sm font-medium">
                    ${getIcon('Wand2', {class:'mr-2 h-4 w-4'})} Suggest
                </button>
              </div>
              <textarea id="wish-message" class="textarea" placeholder="Happy Birthday!..." rows="3"></textarea>
          </div>
           <div class="space-y-2">
                <label class="label">Record and Transcribe</label>
                <div class="flex items-center gap-4 p-2 border rounded-md">
                     <button id="record-btn" class="btn btn-icon ghost rounded-full w-12 h-12 record-btn">
                        <span class="mic-icon">${getIcon('Mic', {size: 24})}</span>
                        <span class="stop-icon">${getIcon('StopCircle', {size: 24})}</span>
                    </button>
                    <div id="record-status" class="flex-1 text-sm text-muted-foreground">
                        <p>Tap and hold to record</p>
                    </div>
                </div>
           </div>
      </div>`;
      
    const getSuggestionsListHTML = (suggestions) => `
        <div class="space-y-2">
            ${suggestions.map(s => `<div class="p-2 rounded-md hover:bg-accent cursor-pointer text-sm suggestion-item">${s}</div>`).join('')}
        </div>`;
        
    const getLoadingSkeletonHTML = (type, count = 1) => {
        const skeletonCard = `
            <div class="card p-4">
                <div class="flex flex-col items-center gap-4">
                    <div class="w-24 h-24 rounded-full animate-pulse bg-muted"></div>
                    <div class="h-6 w-3/4 animate-pulse bg-muted rounded-md"></div>
                </div>
            </div>`;
        const suggestion = `<div class="space-y-3">
                <div class="h-5 w-4/5 animate-pulse bg-muted rounded-md"></div>
                <div class="h-5 w-full animate-pulse bg-muted rounded-md"></div>
                <div class="h-5 w-3/4 animate-pulse bg-muted rounded-md"></div></div>`;
        const skeletons = {
            personCard: skeletonCard,
            suggestion: suggestion,
        };
        return Array(count).fill(skeletons[type] || '').join('');
    };
    
    const getAlertHTML = (title, description, variant = 'default', iconName = 'HelpCircle') => {
         const alertClass = variant === 'destructive' ? 'alert-destructive' : 'alert-accent';
        return `
            <div class="alert has-icon ${alertClass}">
                <div class="alert-icon">${getIcon(iconName, {class: variant === 'destructive' ? 'text-destructive': 'text-accent'})}</div>
                <div>
                    <h5 class="alert-title">${title}</h5>
                    <div class="alert-description">${description}</div>
                </div>
            </div>`;
    };

    const getQrScannerModalContentHTML = () => {
        return `
            <div class="py-4 space-y-4">
                <div id="qr-reader" style="width: 100%;"></div>
                <div id="qr-status"></div>
            </div>
        `;
    };

    const showNameChangeModal = (profile, request, actionHandlers) => {
         const isPending = request && request.status === 'pending';
         const content = `
            ${isPending ? getAlertHTML('Request Pending', 'Your request is awaiting approval. You can cancel it or check the status.', 'default', 'HelpCircle') : ''}
            <div class="space-y-4">
                <div class="space-y-2">
                    <label for="current-name" class="label">Current Name</label>
                    <input id="current-name" class="input" value="${profile.name}" disabled>
                </div>
                <div class="space-y-2">
                    <label for="requested-name" class="label">New Name</label>
                    <input id="requested-name" class="input" value="${isPending ? request.newName : ''}" ${isPending ? 'disabled' : ''}>
                </div>
                 <div class="space-y-2">
                    <label for="request-reason" class="label">Reason for Change</label>
                    <textarea id="request-reason" class="textarea" placeholder="e.g., Legal name change..." ${isPending ? 'disabled' : ''}>${isPending ? request.reason : ''}</textarea>
                </div>
            </div>`;
        
        const footerButtons = isPending ? [
            {id: 'cancel-req-btn', text: 'Cancel Request', variant: 'destructive'},
            {id: 'check-status-btn', text: 'Check Status', variant: 'default'}
        ] : [
            {id: 'cancel-name-change-btn', text: 'Cancel', variant: 'outline', closes: true},
            {id: 'confirm-name-change-btn', text: 'Submit Request', variant: 'default'}
        ];
        
        const modalId = UICore.showModal(
            `<span class="gradient-text">Request Profile Change</span>`,
             content, 
             'name-change-modal',
             footerButtons, 
             (modal, mId, buttonId) => {
                 if(isPending) {
                     if (buttonId === 'cancel-req-btn' && actionHandlers.onCancel) actionHandlers.onCancel(modal, mId);
                     if (buttonId === 'check-status-btn' && actionHandlers.onCheckStatus) actionHandlers.onCheckStatus(modal, mId);
                 } else {
                      if (buttonId === 'confirm-name-change-btn' && actionHandlers.onSubmit) {
                           const newName = modal.querySelector('#requested-name').value;
                           const reason = modal.querySelector('#request-reason').value;
                           actionHandlers.onSubmit(newName, reason, modal, mId);
                      }
                 }
             },
            'Submit a request to change your name. An admin will review it.'
        );
    };

    const showReRegistrationModal = (request, submitHandler) => {
        let statusContent = '';
        if (request) {
            if (request.status === 'pending') statusContent = getAlertHTML('Request Pending', 'Your request is awaiting approval.', 'default', 'HelpCircle');
            if (request.status === 'rejected') statusContent = getAlertHTML('Request Rejected', 'Your previous request was not approved.', 'destructive');
            if (request.status === 'approved') statusContent = getAlertHTML('Request Approved!', 'You can now register with this number.', 'default', 'ShieldCheck');
        }
        
        const content = `
            ${statusContent}
            <div class="space-y-4">
                <div class="space-y-2">
                    <label for="contact-admin-number" class="label">Your Contact Number</label>
                    <input id="contact-admin-number" type="tel" class="input" placeholder="10-digit number" maxlength="10" ${request?.status === 'pending' ? 'disabled' : ''}>
                </div>
                 <div class="space-y-2">
                    <label for="contact-admin-reason" class="label">Reason for Re-Registration</label>
                    <textarea id="contact-admin-reason" class="textarea" placeholder="e.g., Lost access to my old device..." ${request?.status === 'pending' ? 'disabled' : ''}></textarea>
                </div>
            </div>`;
         const footerButtons = request?.status === 'pending' ? [
            {id: 'close-rereg-btn', text: 'Close', variant: 'outline', closes: true}
         ] : [
            {id: 'cancel-rereg-btn', text: 'Cancel', variant: 'outline', closes: true},
            {id: 'submit-rereg-btn', text: 'Submit Request', variant: 'default'}
        ];
        
        const modalId = UICore.showModal(
            `<span class="gradient-text">Contact Admin</span>`,
             content, 
             'rereg-modal',
             footerButtons, 
             (modal, mid, buttonId) => {
                if(buttonId === 'submit-rereg-btn') {
                     if (submitHandler) submitHandler(modal, mid);
                }
             },
            'If your number is already registered and you need to re-register, submit a request.'
        );
    };

    const showTermsModal = () => {
        const content = `
            <div class="scroll-area h-72">
                <div class="space-y-4 text-sm text-muted-foreground">
                    <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
                    <h3 class="font-semibold text-foreground">1. Data Storage and Privacy</h3>
                    <p>This application stores all your data, including your profile information (name, birthday, contact number, avatar) and your connections' information, on Firebase's secure servers. We do not store your personal data anywhere else. Your data is protected by Firebase security rules.</p>
                    <h3 class="font-semibold text-foreground">2. Data Usage</h3>
                    <p>The data you provide is used solely for the functionality of the app, such as scheduling birthday reminders and creating connections. Your contact number is used to uniquely identify you and your connections. AI features may process non-identifiable data (like a recipient's first name) to generate message suggestions, but this data is not stored.</p>
                    <h3 class="font-semibold text-foreground">3. User Responsibilities</h3>
                    <p>You are responsible for the accuracy of the information you provide. You agree not to use the application for any unlawful purposes or to harass others. You are responsible for keeping your account access secure.</p>
                    <h3 class="font-semibold text-foreground">4. Data Deletion</h3>
                    <p>You can request account deletion by contacting the administrator. This action is irreversible and will permanently delete all your profile and connection data from our servers.</p>
                </div>
            </div>`;
        UICore.showModal(
            `<span class="flex items-center gap-2">${UIComponents.getIcon('FileText')} Terms and Conditions</span>`,
            content,
            'terms-modal',
            [{ id: 'close-terms', text: 'Close', variant: 'outline', closes: true }],
            null,
            'Please read our terms carefully before using the application.'
        );
    };


    return {
        getIcon,
        getSpinnerHTML,
        getAvatarWithFallbackHTML,
        getEmptyPlaceholderHTML,
        getAddPersonModalContentHTML,
        getQrCodeUrl,
        renderFloatingNav,
        getPersonCardHTML,
        showAvatarModal,
        getWishStationContentHTML,
        getSuggestionsListHTML,
        getAlertHTML,
        showNameChangeModal,
        getLoadingSkeletonHTML,
        showTermsModal,
        showReRegistrationModal,
        getQrScannerModalContentHTML
    };

})();
