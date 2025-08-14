

const HomePage = (() => {

    const app = document.getElementById('app');

    const init = async () => {
        await loadData();
    };

    const loadData = async () => {
        const profile = Api.getCurrentProfile();
        if (!profile || !profile.contact) {
            window.location.hash = "#profile";
            UICore.showToast({title: "Session Expired", description: "Please set up your profile again.", variant: "destructive"});
            return;
        }

        try {
            const [adminMessages, allWishes, people] = await Promise.all([
                Api.getAdminMessages(profile.contact),
                Api.getWishes(profile.contact),
                Api.getPeople()
            ]);
            
            // For now, unread count is not reliably persisted, so we'll treat all as read for the session.
            const unreadMessagesCount = 0;
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const birthdayDate = new Date(profile.birthday);
            const isMyBirthday = birthdayDate.getDate() === today.getDate() && birthdayDate.getMonth() === today.getMonth();
            const age = today.getFullYear() - birthdayDate.getFullYear();
            
            const peopleWithoutSelf = people.filter(p => p.contact !== profile.contact);
            const { getNextBirthday, differenceInDays, isSameDay } = UICore.dateHelpers;
            
            const todaysBirthdays = peopleWithoutSelf.filter(p => {
                const bday = new Date(p.birthday);
                bday.setHours(0,0,0,0);
                return isSameDay(bday, today, true);
            });
            
            const upcomingBirthdays = peopleWithoutSelf
              .map(p => ({...p, nextBirthday: getNextBirthday(new Date(p.birthday))}))
              .filter(p => { 
                  const daysUntil = differenceInDays(p.nextBirthday, today); 
                  return daysUntil >= 1 && daysUntil <= 30; 
              })
              .sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime());
            
            render({
                profile,
                unreadMessagesCount,
                isMyBirthday,
                age,
                myBirthdayWishes: allWishes.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
                todaysBirthdays,
                upcomingBirthdays,
                adminMessages
            });
            
            if (todaysBirthdays.length > 0) {
                UINotifications.showNotification('Happy Birthday!', `Don't forget to wish a happy birthday to ${todaysBirthdays.map(p => p.name).join(', ')}.`);
            }
        } catch(error) {
            console.error("Error loading home page data:", error);
            UICore.showToast({title: "Error", description: "Could not load your data. Please try refreshing.", variant: "destructive"});
            app.innerHTML = UIComponents.getEmptyPlaceholderHTML("Error Loading Data", "Could not connect to the database.", "Refresh", "#home");
        }
    };

    const render = (data) => {
        const { profile, unreadMessagesCount, isMyBirthday, age, myBirthdayWishes, todaysBirthdays, upcomingBirthdays, adminMessages } = data;

        app.innerHTML = `
            <div class="container mx-auto px-4 relative pt-6">
                ${isMyBirthday ? UIHomeComponents.getConfettiHTML() : ''}
                <header class="page-header relative z-10">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-4">
                            ${UIComponents.getAvatarWithFallbackHTML(profile.avatar, profile.name, 'w-16 h-16')}
                            <div>
                                <h1 class="text-3xl font-bold gradient-text">Welcome back, ${profile.name}!</h1>
                                <p class="text-muted-foreground">Here are the upcoming birthdays.</p>
                            </div>
                        </div>
                        <div class="relative">
                            <button id="messages-btn" class="btn btn-icon ghost">
                                ${UIComponents.getIcon('MessageSquare', { class: 'h-6 w-6 text-primary' })}
                            </button>
                            ${unreadMessagesCount > 0 ? '<div class="unread-badge"></div>' : ''}
                        </div>
                    </div>
                </header>

                <div id="notification-alert-container" class="mb-8"></div>
                
                <div class="space-y-6">
                    ${isMyBirthday ? UIHomeComponents.getMyBirthdayCardHTML(profile, age, myBirthdayWishes) : ''}
                    ${todaysBirthdays.length > 0 ? `<div><h2 class="text-2xl font-bold text-primary mb-4">Today's Birthdays!</h2>${UIHomeComponents.getTodaysBirthdayAlertHTML(todaysBirthdays)}</div>` : ''}
                    ${upcomingBirthdays.length > 0 ? `<div><h2 class="text-2xl font-bold text-primary mb-4">Upcoming birthdays</h2><div class="space-y-4 relative z-10">${upcomingBirthdays.map(p => UIHomeComponents.getUpcomingBirthdayCardHTML(p)).join('')}</div></div>` : ''}
                    ${(todaysBirthdays.length === 0 && upcomingBirthdays.length === 0 && !isMyBirthday) ? UIComponents.getEmptyPlaceholderHTML("It's a bit quiet...", "There are no birthdays in the next 30 days. Why not add some more friends?", "Go to Connections", "#people") : ''}
                </div>
            </div>`;
        
        bindEvents(data);
    };

    const bindEvents = (data) => {
        UINotifications.renderNotificationAlert(document.getElementById('notification-alert-container'));
        
        document.getElementById('messages-btn')?.addEventListener('click', () => {
            showAdminMessagesModal(data.adminMessages);
            Api.markAdminMessagesAsRead(data.profile.contact);
            const badge = document.querySelector('.unread-badge');
            if(badge) badge.remove();
        });

        if (data.isMyBirthday) {
            bindWishCardEvents(data.myBirthdayWishes);
            const latestUnplayedWish = data.myBirthdayWishes.find(w => w.audioDataUri && !w.played);
            if (latestUnplayedWish) {
                const audioPlayer = document.getElementById('audio-player');
                if (audioPlayer) {
                    audioPlayer.src = latestUnplayedWish.audioDataUri;
                    audioPlayer.play().catch(e => console.warn("Autoplay blocked", e));
                    Api.markWishAsPlayed(latestUnplayedWish);
                }
            }
        }
    };

    const bindWishCardEvents = (wishes) => {
         wishes.forEach(wish => {
            const button = document.querySelector(`.play-audio-btn[data-audio-id="${wish.id}"]`);
            button?.addEventListener('click', (e) => {
                e.stopPropagation();
                const audioUri = e.currentTarget.dataset.audio;
                const audioPlayer = document.getElementById('audio-player');
                if (audioPlayer) {
                    audioPlayer.src = audioUri;
                    audioPlayer.play();
                }
            });
         });
    };
    
    const showAdminMessagesModal = (messages) => {
        const sortedMessages = messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const content = `
            <div class="scroll-area h-72">
                ${sortedMessages.length > 0 ? `
                    <div class="space-y-4">
                        ${sortedMessages.map(msg => `
                            <div class="p-3 bg-muted rounded-lg">
                                <p class="text-sm">${msg.message}</p>
                                <p class="text-xs text-muted-foreground text-right mt-2">${UICore.dateHelpers.formatDistanceToNow(new Date(msg.timestamp))}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : `<div class="text-center py-12 text-muted-foreground"><p>No messages here.</p></div>`
                }
            </div>`;
        UICore.showModal(
            `<span class="flex items-center gap-2 text-primary">${UIComponents.getIcon('MessageSquare')} Messages from Admin</span>`,
            content,
            'admin-messages-modal',
            [{id: 'close-msg-btn', text: 'Close', variant: 'outline', closes: true}],
             null,
            'Here are the recent messages sent to you by the admin.'
        );
    };

    return { init };
})();
