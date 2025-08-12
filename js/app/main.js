
const App = (() => {
    
    const init = async () => {
        const appContainer = document.getElementById('app');
        // Ensure the spinner is shown immediately while the app initializes
        if (appContainer) {
            appContainer.innerHTML = UIComponents.getSpinnerHTML();
        }

        // The core issue was here. The app was navigating before the API 
        // had initialized and loaded the profile. We must wait for the API.
        await Api.init(); // Wait for API (and profile) to be ready

        // Now that the API is initialized and profile is loaded, we can navigate.
        await navigate(window.location.hash);
        
        // Set up event listeners for future navigation
        window.addEventListener('hashchange', () => navigate(window.location.hash));
        window.addEventListener('focus', async () => {
            // Re-check and refresh data on window focus for dynamic content updates
            const currentRoute = window.location.hash.split('?')[0];
            if (['#home', '#people', '#admin'].includes(currentRoute)) {
                await navigate(currentRoute);
            }
        });
    };

    const navigate = async (hash) => {
        const appContainer = document.getElementById('app');
        if(appContainer) {
            // Show a spinner during navigation between pages for a better user experience
            appContainer.innerHTML = UIComponents.getSpinnerHTML();
            // Allow spinner to render before proceeding
            await new Promise(resolve => setTimeout(resolve, 50)); 
        }
        
        const localProfile = Api.getLocalProfile();
        const isProfileComplete = localProfile && localProfile.id && localProfile.name && localProfile.name !== "Anonymous User" && localProfile.birthday && localProfile.contact;
        
        let route = hash.split('?')[0] || '#';
        const pageName = route.replace('#', '').split('/')[0];
        let needsRedirect = false;

        // Determine the correct route based on profile completion status
        if (route === '#' || route === '') {
            route = isProfileComplete ? '#home' : '#profile';
            needsRedirect = true;
        } else if (!isProfileComplete && pageName !== 'profile' && pageName !== '') {
            // If the profile is not complete, force redirect to profile page
            route = '#profile';
            needsRedirect = true;
        }

        if (needsRedirect) {
            window.history.replaceState(null, null, window.location.pathname + route);
        }
        
        const finalPageName = route.replace('#', '').split('/')[0] || 'profile';
        const pageTitle = finalPageName.charAt(0).toUpperCase() + finalPageName.slice(1);
        document.title = `WishUpon | ${pageTitle}`;

        // Clear the app container before rendering new page content
        if(appContainer) appContainer.innerHTML = '';

        // Load the appropriate page module
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
                await AdminPage.init();
                break;
            case 'profile':
                await ProfilePage.init();
                break;
            default:
                // Fallback to the profile page if the route is unknown
                window.history.replaceState(null, null, window.location.pathname + '#profile');
                await ProfilePage.init();
                break;
        }

        // Render the floating navigation menu, which now correctly checks profile status
        UIComponents.renderFloatingNav();
    };
    
    return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
