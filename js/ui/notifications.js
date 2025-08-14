
const UINotifications = (() => {

    const renderNotificationAlert = (container) => {
        if (!('Notification' in window) || Notification.permission === 'granted' || !container) {
            if (container) container.innerHTML = '';
            return;
        }
        container.innerHTML = `
        <div class="alert alert-accent has-icon">
            <div class="alert-icon">${UIComponents.getIcon('BellRing', {class:'text-accent'})}</div>
            <div>
                <h3 class="alert-title font-bold">Enable Birthday Notifications</h3>
                <p class="alert-description" style="color: hsl(var(--muted-foreground));">
                   Get notified on your device when it's a friend's birthday.
                   <button id="enable-notifications-btn" class="btn link" style="padding: 0; margin-left: 0.5rem; height: auto; color: hsl(var(--accent));">Enable Now</button>
                </p>
            </div>
        </div>`;
        document.getElementById('enable-notifications-btn')?.addEventListener('click', requestNotificationPermission);
    };

    const requestNotificationPermission = async () => {
        // For WebView, we might call a native interface instead
        if (window.Android && window.Android.requestNotificationPermission) {
            window.Android.requestNotificationPermission();
            // The native side should handle the UI feedback
            const container = document.getElementById('notification-alert-container');
            if (container) container.innerHTML = '';
            return;
        }

        // Standard web flow
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            UICore.showToast({ title: "Notifications Enabled!", description: "You'll now get birthday reminders.", variant: "success" });
            const container = document.getElementById('notification-alert-container');
            if (container) container.innerHTML = ''; // Remove the alert
        } else if (permission === 'denied') {
            UICore.showToast({ title: 'Notifications Blocked', description: 'You can enable them in browser settings if you change your mind.', variant: 'destructive' });
        }
    };
    
    const showNotification = (title, body) => {
        // Let the native app handle notifications if it can
        if (window.Android && window.Android.showNotification) {
            window.Android.showNotification(title, body);
            return;
        }

        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        
        const options = {
            body,
            icon: '/favicon.ico',
            badge: '/apple-touch-icon.png'
        };

        new Notification(title, options);
    };

    return {
        renderNotificationAlert,
        requestNotificationPermission,
        showNotification
    };

})();
