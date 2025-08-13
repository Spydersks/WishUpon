
const App = (() => {
    
    const init = () => {
        // We defer the initial navigation until we know the user's state.
        // This prevents trying to render authenticated content before we are ready.
        window.addEventListener('hashchange', () => navigate(window.location.hash));
        window.addEventListener('focus', async () => {
            const currentRoute = window.location.hash.split('?')[0];
            if (['#home', '#people', '#admin'].includes(currentRoute)) {
                await navigate(currentRoute); // Re-run navigation on focus to refresh data
            }
        });
        
        // Initial navigation call
        navigate(window.location.hash);
    };

    const navigate = async (hash) => {
        // The initial spinner is now shown from index.html by default.
        // We no longer need to render it here with JS.
        // We just wait for the page logic to replace it.
        
        const localProfile = Api.getLocalProfile();
        const userRole = Api.getUserRole();
        const isProfileComplete = localProfile && localProfile.id && localProfile.name && localProfile.name !== "Anonymous User" && localProfile.birthday && localProfile.contact && userRole;
        
        let route = hash.split('?')[0] || '#';
        
        // Centralized Routing Logic
        if (route === '#' || route === '') {
            // If no hash, decide where to go based on profile completion
            route = isProfileComplete ? '#home' : '#profile';
        } else if (!isProfileComplete && route !== '#profile') {
            // If profile is not complete, force user to the profile page
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
            case 'admin':
                // Extra check for admin route security
                if (userRole !== 'admin') {
                    window.location.hash = '#home'; // Redirect non-admins
                    await HomePage.init();
                } else {
                    await AdminPage.init();
                }
                break;
            case 'profile':
                await ProfilePage.init();
                break;
            default:
                // Fallback to a safe page (home if complete, profile otherwise)
                window.location.hash = isProfileComplete ? '#home' : '#profile';
                if(isProfileComplete) await HomePage.init();
                else await ProfilePage.init();
                break;
        }

        // IMPORTANT: Render the floating nav AFTER the page has loaded and user state is certain.
        UIComponents.renderFloatingNav();
    };
    
    return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
