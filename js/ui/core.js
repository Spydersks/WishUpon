
const UICore = (() => {

    const showToast = (options) => {
        const { title, description, variant = 'default', duration = 3000 } = options;
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toastId = `toast-${Date.now()}`;
        
        const variantClasses = {
            default: "border bg-background text-foreground",
            destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
            success: "success group border-green-500 bg-green-500 text-white"
        }
        
        const toastHTML = `
            <li class="toast ${variantClasses[variant]}" id="${toastId}" data-state="open">
                <div class="grid gap-1">
                  ${title ? `<div class="text-sm font-semibold">${title}</div>` : ''}
                  ${description ? `<div class="text-sm opacity-90">${description}</div>` : ''}
                </div>
                <button class="toast-close-btn">
                    ${UIComponents.getIcon('X', {class:'h-4 w-4'})}
                </button>
            </li>
        `;
        
        container.insertAdjacentHTML('beforeend', toastHTML);
        const toastElement = document.getElementById(toastId);
        
        setTimeout(() => {
            if(document.body.contains(toastElement)) {
                toastElement.setAttribute('data-state', 'closed');
                toastElement.addEventListener('animationend', () => toastElement.remove());
            }
        }, duration);

        toastElement.querySelector('.toast-close-btn').addEventListener('click', () => {
            toastElement.setAttribute('data-state', 'closed');
            toastElement.addEventListener('animationend', () => toastElement.remove());
        });
    };
    
    const closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
             modal.setAttribute('data-state', 'closed');
             modal.addEventListener('animationend', () => modal.remove());
        }
    }

    const showModal = (title, content, modalId, footerButtons = [], onConfirm, description, options = {}) => {
        const existingModal = document.getElementById(modalId);
        if (existingModal) existingModal.remove();
        
        const footerHTML = footerButtons.map(btn => {
            return `<button class="btn ${btn.variant || 'primary'}" id="${btn.id}">${btn.text}</button>`
        }).join('');

        const contentClass = options.contentClass || 'p-6';

        const modalHTML = `
            <div id="${modalId}" class="modal-overlay" data-state="open">
                <div class="modal-content">
                     <div class="modal-header">
                        ${title ? `<h2 class="card-title">${title}</h2>` : ''}
                        ${description ? `<p class="card-description">${description}</p>` : ''}
                    </div>
                    <div class="modal-body ${contentClass}">${content}</div>
                    ${footerButtons.length > 0 ? `<div class="modal-footer">${footerHTML}</div>` : ''}
                    <button id="close-${modalId}" class="btn btn-icon ghost modal-close-btn">${UIComponents.getIcon('X', {class:"h-4 w-4"})}</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modalElement = document.getElementById(modalId);
        
        modalElement.addEventListener('click', (e) => {
            if (options.isEventDelegation && onConfirm) {
                 onConfirm(modalElement, modalId, null, e);
                 return;
            }
            if (e.target === modalElement) closeModal(modalId);
        });
        
        document.getElementById(`close-${modalId}`).addEventListener('click', () => closeModal(modalId));
        
        footerButtons.forEach(btn => {
            const buttonEl = modalElement.querySelector(`#${btn.id}`);
            if (buttonEl) {
                buttonEl.addEventListener('click', async (e) => {
                    if (onConfirm) await onConfirm(modalElement, modalId, btn.id, e);
                    if (btn.closes) closeModal(modalId);
                });
            }
        });
        
        return modalId;
    };
    
    const renderSpinner = () => {
        const app = document.getElementById('app');
        if (app) app.innerHTML = `<div class="spinner-container">${UIComponents.getSpinnerHTML({size:32})}</div>`;
    };

    const setButtonLoading = (button, isLoading, loadingText = '...') => {
        if (!button) return;
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = `<div class="spinner"></div> ${loadingText}`;
        } else {
            button.disabled = false;
            if (button.dataset.originalText) {
                button.innerHTML = button.dataset.originalText;
            }
        }
    };
    
    const dateHelpers = {
        addDays: (date, days) => { const r = new Date(date); r.setDate(r.getDate() + days); return r; },
        getNextBirthday: (birthdayDate) => {
            const today = new Date(); today.setHours(0,0,0,0);
            const birthDateThisYear = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
            return birthDateThisYear < today ? new Date(today.getFullYear() + 1, birthdayDate.getMonth(), birthdayDate.getDate()) : birthDateThisYear;
        },
        differenceInDays: (d1, d2) => Math.ceil((new Date(d1) - new Date(d2)) / (1000 * 60 * 60 * 24)),
        formatDistanceToNow: (date) => {
            if (!date) return '';
            const seconds = Math.floor((new Date() - new Date(date)) / 1000);
            let interval = seconds / 31536000;
            if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
            interval = seconds / 2592000;
            if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
            interval = seconds / 86400;
            if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
            interval = seconds / 3600;
            if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
            interval = seconds / 60;
            if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " minute ago" : " minutes ago");
            return "just now";
        },
        isSameDay: (d1, d2, ignoreYear = false) => {
            if (ignoreYear) {
                return d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
            }
            return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
        },
    }

    const showPhotoTaker = (callback) => {
        let videoStream = null;

        const cleanupAndClose = (modalId) => {
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
            }
            closeModal(modalId);
        };
        
        const content = `
            <div id="photo-taker-content" class="space-y-4">
                <div class="w-full aspect-video rounded-md bg-muted overflow-hidden">
                    <video id="video-preview" muted autoplay playsinline class="w-full h-full object-cover"></video>
                </div>
                <div id="camera-alert-container"></div>
            </div>`;

        const modalId = UICore.showModal(
            'Update Profile Photo', 
            content, 
            'photo-taker-modal',
            [
                { id: 'upload-photo-btn', text: UIComponents.getIcon('Upload', {class: 'mr-2'}) + 'Upload', variant: 'secondary' },
                { id: 'take-photo-btn', text: UIComponents.getIcon('Camera', {class: 'mr-2'}) + 'Take Photo', variant: 'primary' }
            ],
            null,
            'Use your camera or upload an image.'
        );

        const modalElement = document.getElementById(modalId);
        const video = modalElement.querySelector('#video-preview');
        const alertContainer = modalElement.querySelector('#camera-alert-container');
        const takeBtn = modalElement.querySelector('#take-photo-btn');
        const uploadBtn = modalElement.querySelector('#upload-photo-btn');
        
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        const startCamera = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Camera not supported');
                videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = videoStream;
                takeBtn.disabled = false;
            } catch (error) {
                const message = error.name === 'NotAllowedError' ? 'Camera access was denied. Please enable it in your browser settings.' : 'Could not access the camera. Please check permissions.';
                alertContainer.innerHTML = UIComponents.getAlertHTML('Camera Access Denied', message, 'destructive');
                takeBtn.disabled = true;
            }
        };

        takeBtn.addEventListener('click', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const dataUri = canvas.toDataURL('image/png');
            if (callback) callback(dataUri);
            cleanupAndClose(modalId);
        });
        
        uploadBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (callback) callback(e.target.result);
                    cleanupAndClose(modalId);
                };
                reader.readAsDataURL(file);
            }
        });

        modalElement.querySelector(`#close-${modalId}`).addEventListener('click', () => cleanupAndClose(modalId));
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) cleanupAndClose(modalId);
        });

        startCamera();
    };

    return {
        showToast,
        showModal,
        closeModal,
        renderSpinner,
        setButtonLoading,
        dateHelpers,
        showPhotoTaker
    };

})();
