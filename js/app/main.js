
const App = (() => {
    
    const init = () => {
        window.addEventListener('hashchange', () => navigate(window.location.hash));
        window.addEventListener('focus', async () => {
            const currentRoute = window.location.hash.split('?')[0];
            if (['#home', '#people'].includes(currentRoute)) {
                await navigate(currentRoute); // Re-run navigation on focus to refresh data
            }
        });
        
        // Initial navigation call
        navigate(window.location.hash);
    };

    const navigate = async (hash) => {
        const app = document.getElementById('app');
        if (app) app.innerHTML = UIComponents.getSpinnerHTML({ size: 32 });

        const currentProfile = Api.getCurrentProfile();
        const userRole = Api.getUserRole();
        const isProfileComplete = currentProfile && currentProfile.id && currentProfile.name && currentProfile.name !== "Anonymous User" && currentProfile.birthday && currentProfile.contact && userRole;
        
        let route = hash.split('?')[0] || '#';
        
        // Centralized Routing Logic
        if (route === '#') {
            route = isProfileComplete ? '#home' : '#profile';
        } else if (!isProfileComplete && route !== '#profile') {
            route = '#profile';
        }
        
        // Update URL if it was changed by the logic above
        if (route !== (hash.split('?')[0] || '#')) {
            window.history.replaceState(null, null, window.location.pathname + route);
        }
        
        const finalPageName = route.replace('#', '').split('/')[0] || 'profile';
        const pageTitle = finalPageName.charAt(0).toUpperCase() + finalPageName.slice(1);
        document.title = `WishUpon | ${pageTitle}`;

        // Render the correct page based on the final, validated route
        switch(finalPageName) {
            case 'home':
                await HomePage.init();
                break;
            case 'people':
                await PeoplePage.init();
                break;
            case 'add-person':
                await AddPersonPage.init();
                break;
            case 'profile':
                await ProfilePage.init();
                break;
            default:
                // Fallback to a safe page
                window.location.hash = isProfileComplete ? '#home' : '#profile';
                break;
        }

        // Render the floating nav AFTER the page has loaded.
        UIComponents.renderFloatingNav();
    };
    
    return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
