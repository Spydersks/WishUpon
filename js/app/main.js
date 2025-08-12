
const App = (() => {
    
    const init = async () => {
        // Show spinner immediately
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = UIComponents.getSpinnerHTML();
        }
        
        // Wait a moment for any async data loading from API if needed
        await new Promise(resolve => setTimeout(resolve, 50)); 

        // Now, perform navigation
        await navigate(window.location.hash);
        
        // Set up event listeners for future navigation
        window.addEventListener('hashchange', () => navigate(window.location.hash));
        window.addEventListener('focus', async () => {
            const currentRoute = window.location.hash.split('?')[0];
            if (['#home', '#people', '#admin'].includes(currentRoute)) {
                await navigate(currentRoute);
            }
        });
    };

    const navigate = async (hash) => {
        const appContainer = document.getElementById('app');
        // Render spinner at the start of every navigation to provide user feedback
        if(appContainer) {
            appContainer.innerHTML = UIComponents.getSpinnerHTML();
        }
        
        // Let the spinner render
        await new Promise(resolve => setTimeout(resolve, 50)); 
        
        const localProfile = Api.getLocalProfile();
        const isProfileComplete = localProfile && localProfile.id && localProfile.name && localProfile.name !== "Anonymous User" && localProfile.birthday && localProfile.contact;
        
        let route = hash.split('?')[0] || '#';
        const pageName = route.replace('#', '').split('/')[0];
        let needsRedirect = false;

        if (route === '#profile' && isProfileComplete && pageName !== 'profile') {
             route = '#home';
             needsRedirect = true;
        } else if (route === '#' || route === '') {
            route = isProfileComplete ? '#home' : '#profile';
            needsRedirect = true;
        } else if (!isProfileComplete && pageName !== 'profile') {
            route = '#profile';
            needsRedirect = true;
        }

        if (needsRedirect) {
            window.history.replaceState(null, null, window.location.pathname + route);
        }
        
        const finalPageName = route.replace('#', '').split('/')[0];
        const pageTitle = finalPageName.charAt(0).toUpperCase() + finalPageName.slice(1);
        document.title = `WishUpon | ${pageTitle || 'Welcome'}`;

        // Clear the app container before rendering new page content
        if(appContainer) appContainer.innerHTML = '';

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
                window.history.replaceState(null, null, window.location.pathname + '#profile');
                await ProfilePage.init();
                break;
        }

        UIComponents.renderFloatingNav();
    };
    
    return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
