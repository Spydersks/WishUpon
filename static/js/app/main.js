
const App = (() => {
    
    const init = () => {
        navigate(window.location.hash);
        window.addEventListener('hashchange', () => navigate(window.location.hash));
        window.addEventListener('focus', async () => {
            const currentRoute = window.location.hash.split('?')[0];
            if (['#home', '#people', '#admin'].includes(currentRoute)) {
                await navigate(currentRoute);
            }
        });
    };

    const navigate = async (hash) => {
        UICore.renderSpinner();
        
        await new Promise(resolve => setTimeout(resolve, 50)); 
        
        const localProfile = Api.getLocalProfile();
        const isProfileComplete = localProfile && localProfile.id && localProfile.name && localProfile.name !== "Anonymous User" && localProfile.birthday && localProfile.contact;
        
        let route = hash.split('?')[0] || '#';
        const pageName = route.replace('#', '').split('/')[0];
        
        if (route === '#profile' && isProfileComplete && pageName !== 'profile') {
             route = '#home';
             window.history.replaceState(null, null, window.location.pathname + route);
        } else if (route === '#' || route === '') {
            route = isProfileComplete ? '#home' : '#profile';
            window.history.replaceState(null, null, window.location.pathname + route);
        } else if (!isProfileComplete && pageName !== 'profile') {
            route = '#profile';
            window.history.replaceState(null, null, window.location.pathname + route);
        }
        
        const finalPageName = route.replace('#', '').split('/')[0];
        const pageTitle = finalPageName.charAt(0).toUpperCase() + finalPageName.slice(1);
        document.title = `WishUpon | ${pageTitle || 'Welcome'}`;

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
