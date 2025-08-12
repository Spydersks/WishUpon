
const UIHomeComponents = (() => {

    const getConfettiHTML = () => {
        return `<div class="confetti-container">${Array.from({ length: 50 }).map(() => `<div class="confetti-piece" style="left:${Math.random()*100}%;animation:confetti-fall ${3+Math.random()*2}s ${Math.random()*2}s ease-out forwards;background-color:hsl(${Math.random()*360},70%,60%);transform:rotate(${Math.random()*360}deg);"></div>`).join('')}</div>`;
    };

    const getWishCardHTML = (wish) => {
        return `
            <div class="flex gap-4 items-start wish-card p-4 rounded-lg shadow-md">
                ${UIComponents.getAvatarWithFallbackHTML(wish.senderAvatar, wish.senderName, 'w-10 h-10 border-2 border-primary')}
                <div class="flex-1">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-bold text-primary">${wish.senderName}</p>
                            ${wish.fromAdmin ? `<p class="text-xs text-muted-foreground -mt-1">From the WishUpon Team</p>` : ''}
                        </div>
                        ${wish.audioDataUri ? `<button class="btn btn-icon ghost h-8 w-8 shrink-0 play-audio-btn" data-audio-id="${wish.id}" data-audio="${wish.audioDataUri}">${UIComponents.getIcon('PlayCircle', {class: 'text-primary h-6 w-6'})}</button>` : ''}
                    </div>
                    <p class="text-sm mt-2 text-foreground/80 italic">"${wish.textMessage}"</p>
                </div>
            </div>`;
    };

    const getMyBirthdayCardHTML = (profile, age, wishes) => `
         <div class="mb-8 card-my-birthday shadow-xl overflow-hidden relative z-10 rounded-lg text-white">
            <div class="p-6">
                <div class="flex flex-col items-center text-center gap-2">
                  ${UIComponents.getAvatarWithFallbackHTML(profile.avatar, profile.name, 'w-32 h-32 border-4 border-white/50')}
                  <h2 class="text-2xl font-bold tracking-tight">Happy Birthday, ${profile.name}! 🥳</h2>
                  <p class="text-xl font-bold text-white/90">You're ${age} today! 🎂</p>
                </div>
                
                ${wishes.length > 0 ? `
                    <div class="mt-6 space-y-3 bg-white/20 p-4 rounded-lg">
                        <h4 class="font-bold text-center flex items-center justify-center gap-2">
                            ${UIComponents.getIcon('Gift', {size:20})}
                            You've received ${wishes.length} wish(es)!
                        </h4>
                         <div class="h-48 overflow-y-auto pr-4 space-y-3 scroll-area">
                            ${wishes.map(getWishCardHTML).join('')}
                        </div>
                    </div>` 
                : `<p class="mt-4 text-center text-white/90">Wishing you a fantastic day filled with joy and laughter! 🎉😊</p>`}
            </div>
        </div>
    `;
    
    const getTodaysBirthdayAlertHTML = (people) => `
        <div class="alert bg-gradient-to-r from-primary to-accent text-accent-foreground border-none z-10 flex items-center justify-between">
             <div class="flex items-center">
                ${UIComponents.getIcon('PartyPopper', {size: 24, class: 'mr-4'})}
                <div>
                    <h5 class="alert-title font-bold">It's a special day!</h5>
                    <div class="alert-description text-accent-foreground/90">Don't forget to wish a happy birthday to <span class="font-semibold">${people.map(p => p.name).join(', ')}</span>.</div>
                </div>
             </div>
             <a href="#people?wish=${people[0].id}" class="btn link text-white hover:text-white/80 font-bold p-0 h-auto shrink-0">
                Send a wish now! ${UIComponents.getIcon('PartyPopper', {class: 'ml-2 h-5 w-5 animate-bounce'})}
             </a>
        </div>`;

    const getTomorrowsBirthdayCardHTML = (person) => {
        const birthdayDate = new Date(person.birthday);
        const day = birthdayDate.getDate();
        const daySuffix = (day > 3 && day < 21) ? 'th' : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][day % 10];
        const formattedDate = `${birthdayDate.toLocaleString('default', { month: 'long' })} ${day}${daySuffix}`;
        
        return `<a href="#people" class="block birthday-card-link">
            <div class="card p-4 flex items-center justify-between transition-all border-accent">
                <div class="flex items-center gap-4">
                     ${UIComponents.getAvatarWithFallbackHTML(person.avatar, person.name, 'w-12 h-12')}
                     <div><p class="font-semibold">${person.name}</p><p class="text-sm text-muted-foreground">${formattedDate}</p></div>
                </div>
                <div class="text-right"><div class="flex items-center gap-2 text-accent font-bold">${UIComponents.getIcon('Gift',{size:16})}<span>Tomorrow!</span></div></div>
            </div>
        </a>`;
    };

    const getUpcomingBirthdayCardHTML = (person) => {
        const { getNextBirthday, differenceInDays } = UICore.dateHelpers;
        const today = new Date(); today.setHours(0,0,0,0);
        const nextBirthday = getNextBirthday(new Date(person.birthday));
        const daysUntil = differenceInDays(nextBirthday, today);
        
        const birthdayDate = new Date(person.birthday);
        const day = birthdayDate.getDate();
        const daySuffix = (day > 3 && day < 21) ? 'th' : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][day % 10];
        const formattedDate = `${birthdayDate.toLocaleString('default', { month: 'long' })} ${day}${daySuffix}`;

        return `<a href="#people" class="block birthday-card-link">
            <div class="card p-4 flex items-center justify-between transition-all">
                <div class="flex items-center gap-4">
                     ${UIComponents.getAvatarWithFallbackHTML(person.avatar, person.name, 'w-12 h-12')}
                     <div><p class="font-semibold">${person.name}</p><p class="text-sm text-muted-foreground">${formattedDate}</p></div>
                </div>
                <div class="text-right"><div class="flex items-center gap-2 text-primary font-bold">${UIComponents.getIcon('Cake',{size:16})}<span>in ${daysUntil} days</span></div></div>
            </div>
        </a>`;
    };
    
    return {
        getConfettiHTML,
        getMyBirthdayCardHTML,
        getTodaysBirthdayAlertHTML,
        getTomorrowsBirthdayCardHTML,
        getUpcomingBirthdayCardHTML
    };
})();
