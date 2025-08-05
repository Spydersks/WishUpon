
"use client";

import { useState, useEffect, useRef } from "react";
import type { Person, AdminMessage, BirthdayWish } from "@/lib/types";
import { differenceInDays, isSameDay, parseISO, format, differenceInYears, formatDistanceToNow, addDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Cake, Gift, PartyPopper, MessageSquare, BellRing, Loader2, PlayCircle, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/use-notifications";
import { useRouter } from "next/navigation";


const ConfettiPiece = ({ style }: { style: React.CSSProperties }) => {
    return <div className="absolute w-2 h-4" style={style}></div>;
};

const ConfettiExplosion = () => {
    const [pieces, setPieces] = useState<React.ReactElement[]>([]);

    useEffect(() => {
        const newPieces = Array.from({ length: 50 }).map((_, i) => {
            const style: React.CSSProperties = {
                left: `${Math.random() * 100}%`,
                top: `${-20 + Math.random() * 20}%`,
                animation: `confetti-fall ${3 + Math.random() * 2}s ${Math.random() * 2}s ease-out forwards`,
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                transform: `rotate(${Math.random() * 360}deg)`,
                borderRadius: '0.125rem', // rounded-sm
            };
            return <ConfettiPiece key={i} style={style} />;
        });
        setPieces(newPieces);
    }, []);

    return <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-50 pointer-events-none">{pieces}</div>;
};


export function HomePage() {
  const [loading, setLoading] = useState(true);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<Person[]>([]);
  const [todaysBirthdays, setTodaysBirthdays] = useState<Person[]>([]);
  const [tomorrowsBirthdays, setTomorrowsBirthdays] = useState<Person[]>([]);
  const [profile, setProfile] = useState<Person | null>(null);
  const [isMyBirthday, setIsMyBirthday] = useState(false);
  const [myAge, setMyAge] = useState(0);
  const [myBirthdayWishes, setMyBirthdayWishes] = useState<BirthdayWish[]>([]);

  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isMessagesDialogOpen, setMessagesDialogOpen] = useState(false);
  const { notificationPermission, requestNotificationPermission, showNotification } = useNotifications();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);


  const getNextBirthday = (birthday: Date): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const birthDateThisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  
    if (birthDateThisYear < today) {
      return new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
    }
    return birthDateThisYear;
  };

  const addAdminBirthdayWish = (userProfile: Person) => {
    try {
        const adminProfileData = localStorage.getItem("adminProfile");
        if (!adminProfileData) return;
        
        const adminProfile: Person = JSON.parse(adminProfileData);

        const wishesData = localStorage.getItem('birthdayWishes');
        const allWishes: BirthdayWish[] = wishesData ? JSON.parse(wishesData) : [];

        const alreadyWished = allWishes.some(w => w.fromAdmin && w.recipientContact === userProfile.contact && w.timestamp.startsWith(new Date().getFullYear().toString()));

        if (!alreadyWished) {
            const adminWish: BirthdayWish = {
                id: `wish_admin_${userProfile.contact}_${new Date().getFullYear()}`,
                senderName: adminProfile.name,
                senderAvatar: adminProfile.avatar,
                recipientContact: userProfile.contact!,
                textMessage: "Happy Birthday! Wishing you a day filled with happiness and a year filled with joy.",
                timestamp: new Date().toISOString(),
                fromAdmin: true,
            };
            
            const updatedWishes = [...allWishes, adminWish];
            localStorage.setItem('birthdayWishes', JSON.stringify(updatedWishes));
        }

    } catch(e) {
        console.error("Could not add admin birthday wish", e);
    }
  }
  
  const loadData = () => {
     try {
      const storedProfile = localStorage.getItem("profile");
      if (storedProfile) {
        const parsedProfile: Person = JSON.parse(storedProfile);
        setProfile(parsedProfile);

        if(parsedProfile.birthday) {
            const today = new Date();
            const birthdayDate = parseISO(parsedProfile.birthday);
            if (isSameDay(new Date(0, birthdayDate.getMonth(), birthdayDate.getDate()), new Date(0, today.getMonth(), today.getDate()))) {
                setIsMyBirthday(true);
                setMyAge(differenceInYears(today, birthdayDate));
                addAdminBirthdayWish(parsedProfile);

                const wishesData = localStorage.getItem('birthdayWishes');
                if (wishesData) {
                    const allWishes: BirthdayWish[] = JSON.parse(wishesData);
                    const wishesForMe = allWishes.filter(w => w.recipientContact === parsedProfile.contact);
                    setMyBirthdayWishes(wishesForMe.sort((a,b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()));
                }
            }
        }

        const messagesData = localStorage.getItem("adminMessages");
        if(messagesData && parsedProfile.contact){
            const allMessages: AdminMessage[] = JSON.parse(messagesData);
            const userMessages = allMessages.filter(m => m.recipientContact === parsedProfile.contact);
            setAdminMessages(userMessages.sort((a,b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()));
            setUnreadMessagesCount(userMessages.filter(m => !m.read).length);
        }
      }

      const storedPeople = localStorage.getItem("people");
      if (storedPeople) {
        const parsedPeople: Person[] = JSON.parse(storedPeople);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = addDays(today, 1);

        const birthdaysToday = parsedPeople.filter(person => {
            if (!person.birthday) return false;
            const birthdayDate = parseISO(person.birthday);
            return isSameDay(new Date(0, birthdayDate.getMonth(), birthdayDate.getDate()), new Date(0, today.getMonth(), today.getDate()));
        });
        setTodaysBirthdays(birthdaysToday);

        const birthdaysTomorrow = parsedPeople.filter(person => {
            if (!person.birthday) return false;
            const birthdayDate = parseISO(person.birthday);
            return isSameDay(new Date(0, birthdayDate.getMonth(), birthdayDate.getDate()), new Date(0, tomorrow.getMonth(), tomorrow.getDate()));
        });
        setTomorrowsBirthdays(birthdaysTomorrow);
        
        const upcoming = parsedPeople
          .map(person => ({
            ...person,
            nextBirthday: getNextBirthday(parseISO(person.birthday)),
          }))
          .filter(person => {
            const daysUntil = differenceInDays(person.nextBirthday, today);
            return daysUntil > 1 && daysUntil <= 30; // Exclude today and tomorrow
          })
          .sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime());
        
        setUpcomingBirthdays(upcoming);
        
        sendBirthdaysToNative(parsedPeople);
      }
    } catch (error) {
      console.error("Failed to load data from local storage", error);
    } finally {
        setLoading(false);
    }
  }

  const sendBirthdaysToNative = (people: Person[]) => {
      if ((window as any).Android && (window as any).Android.scheduleAlarms) {
          console.log("Android interface found, sending birthday data.");
          const peopleJson = JSON.stringify(people);
          (window as any).Android.scheduleAlarms(peopleJson);
      } else {
          console.log("Android interface not found. Running in standard browser.");
      }
  };

  useEffect(() => {
    loadData();
    const handleFocus = () => {
      loadData();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (isMyBirthday && myBirthdayWishes.length > 0) {
      const latestUnplayedWish = myBirthdayWishes.find(w => w.audioDataUri && !w.played);
      
      if (latestUnplayedWish && audioRef.current) {
        audioRef.current.src = latestUnplayedWish.audioDataUri!;
        audioRef.current.play().catch(error => {
          console.warn("Autoplay was prevented by the browser. A user interaction is required to play audio.", error);
        });

        const allWishesData = localStorage.getItem('birthdayWishes');
        if (allWishesData) {
            const allWishes: BirthdayWish[] = JSON.parse(allWishesData);
            const updatedAllWishes = allWishes.map((w: BirthdayWish) => 
                w.id === latestUnplayedWish.id ? { ...w, played: true } : w
            );
            localStorage.setItem('birthdayWishes', JSON.stringify(updatedAllWishes));
            
            const wishesForMe = updatedAllWishes.filter(w => w.recipientContact === profile?.contact);
            setMyBirthdayWishes(wishesForMe.sort((a,b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime()));
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyBirthday, myBirthdayWishes]);

   useEffect(() => {
    if (notificationPermission === 'granted') {
        if (todaysBirthdays.length > 0) {
            const names = todaysBirthdays.map(p => p.name).join(', ');
            showNotification('Happy Birthday!', `Don't forget to wish a happy birthday to ${names}.`);
        }
        if (tomorrowsBirthdays.length > 0) {
            const names = tomorrowsBirthdays.map(p => p.name).join(', ');
            showNotification("Get Ready! Birthday Tomorrow!", `It's ${names}'s birthday tomorrow. Prepare your wishes!`);
        }
    }
  }, [todaysBirthdays, tomorrowsBirthdays, notificationPermission, showNotification]);

  const openMessages = () => {
    setMessagesDialogOpen(true);
    if(unreadMessagesCount > 0 && profile?.contact) {
        try {
            const messagesData = localStorage.getItem("adminMessages");
            if (!messagesData) return;
            const allMessages: AdminMessage[] = JSON.parse(messagesData);
            const updatedMessages = allMessages.map(msg => 
                msg.recipientContact === profile.contact ? { ...msg, read: true } : msg
            );
            localStorage.setItem("adminMessages", JSON.stringify(updatedMessages));
            setUnreadMessagesCount(0);
            setAdminMessages(prev => prev.map(m => ({...m, read: true})));

        } catch (error) {
            console.error("Failed to mark messages as read", error);
        }
    }
  }
  
  const handleWishClick = (personId: string) => {
    router.push(`/people?wish=${personId}`);
  };

  const playAudio = (audioDataUri: string) => {
    if (audioRef.current) {
        audioRef.current.src = audioDataUri;
        audioRef.current.play();
    }
  };

  const getDaysUntil = (birthday: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextBirthday = getNextBirthday(parseISO(birthday));
    const days = differenceInDays(nextBirthday, today);
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow!';
    return `in ${days} days`;
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
    <audio ref={audioRef} className="hidden" />
    <div className="container mx-auto px-4 py-8 md:py-12 relative">
        {isMyBirthday && <ConfettiExplosion />}
        <header className="mb-8 relative z-10">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary">
                        <AvatarImage src={profile?.avatar} alt={profile?.name}/>
                        <AvatarFallback>{profile?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Welcome back, {profile?.name}!</h1>
                        <p className="text-muted-foreground">Here are the upcoming birthdays.</p>
                    </div>
                </div>
                <div className="relative">
                    <Button variant="ghost" size="icon" onClick={openMessages}>
                        <MessageSquare className="h-6 w-6 text-primary" />
                    </Button>
                    {unreadMessagesCount > 0 && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></div>
                    )}
                </div>
            </div>
        </header>

         {notificationPermission !== 'granted' && (
            <Alert className="mb-8 border-accent bg-accent/10 relative z-10">
                <BellRing className="h-5 w-5 text-accent" />
                <AlertTitle className="font-bold text-accent">Enable Birthday Notifications</AlertTitle>
                <AlertDescription>
                   Get notified on your device when it's a friend's birthday.
                   <Button variant="link" className="p-0 h-auto ml-2 text-accent" onClick={requestNotificationPermission}>Enable Now</Button>
                </AlertDescription>
            </Alert>
        )}
        
        {isMyBirthday && (
            <Card className="mb-8 bg-gradient-to-tr from-primary via-accent to-pink-400 border-2 border-primary/30 shadow-xl overflow-hidden relative z-10">
                <CardContent className="pt-6 text-white">
                    <div className="flex flex-col items-center text-center gap-2">
                      <Avatar className="w-32 h-32 border-4 border-white/50">
                        <AvatarImage src={profile?.avatar} alt={profile?.name} />
                        <AvatarFallback>{profile?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Happy Birthday, {profile?.name}! 🥳
                      </h2>
                      <p className="text-xl font-bold text-white/90">You're {myAge} today! 🎂</p>
                    </div>
                    
                    {myBirthdayWishes.length > 0 ? (
                        <div className="mt-6 space-y-3 bg-white/20 p-4 rounded-lg">
                            <h4 className="font-bold text-center flex items-center justify-center gap-2">
                                <Gift size={20}/>
                                You've received {myBirthdayWishes.length} wish(es)!
                            </h4>
                             <ScrollArea className="h-48">
                                <div className="space-y-3 pr-4">
                                {myBirthdayWishes.map(wish => (
                                    <div key={wish.id} className="bg-background/80 p-4 rounded-lg shadow-md flex gap-4 items-start text-foreground">
                                        <Avatar className="w-10 h-10 border-2 border-primary">
                                            <AvatarImage src={wish.senderAvatar} />
                                            <AvatarFallback>{wish.senderName.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-primary">{wish.senderName}</p>
                                                    {wish.fromAdmin && <p className="text-xs text-muted-foreground -mt-1">From the WishUpon Team</p>}
                                                </div>
                                                {wish.audioDataUri && (
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => playAudio(wish.audioDataUri!)}>
                                                        <PlayCircle className="text-primary h-6 w-6" />
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm mt-2 text-foreground/80 italic">"{wish.textMessage}"</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </ScrollArea>
                        </div>
                    ) : (
                        <p className="mt-4 text-center text-white/90">Wishing you a fantastic day filled with joy and laughter! 🎉😊</p>
                    )}
                </CardContent>
            </Card>
        )}
        
        <div className="space-y-6">
            {todaysBirthdays.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-primary mb-4">Today's Birthdays!</h2>
                    <Alert className="bg-gradient-to-r from-primary to-accent text-accent-foreground border-none relative z-10 p-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <PartyPopper className="h-6 w-6 mr-4" />
                            <div>
                                <AlertTitle className="font-bold">
                                    It's a special day!
                                </AlertTitle>
                                 <AlertDescription className="text-accent-foreground/90">
                                    Don&apos;t forget to wish a happy birthday to <span className="font-semibold">{todaysBirthdays.map(p => p.name).join(', ')}</span>.
                                </AlertDescription>
                            </div>
                        </div>
                         <Button asChild variant="link" className="p-0 h-auto text-white hover:text-white/80 font-bold inline-flex items-center shrink-0">
                             <Link href={`/people?wish=${todaysBirthdays[0].id}`}>
                                Send a wish now! <PartyPopper className="ml-2 h-5 w-5 animate-bounce"/>
                             </Link>
                        </Button>
                    </Alert>
                </div>
            )}
            
            {tomorrowsBirthdays.length > 0 && (
                 <div>
                    <h2 className="text-2xl font-bold text-accent mb-4">Tomorrow's Birthdays</h2>
                    <div className="space-y-4 relative z-10">
                        {tomorrowsBirthdays.map(person => (
                             <Link href="/people" key={person.id} className="block">
                                 <Card className="p-4 flex items-center justify-between transition-all hover:shadow-md border-accent">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage src={person.avatar} alt={person.name} />
                                            <AvatarFallback>
                                                {person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{person.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(parseISO(person.birthday), 'MMMM do')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                       <div className="flex items-center gap-2 text-accent font-bold">
                                         <Gift size={16} />
                                         <span>Tomorrow!</span>
                                       </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {upcomingBirthdays.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-primary mb-4">Upcoming birthdays</h2>
                    <div className="space-y-4 relative z-10">
                        {upcomingBirthdays.map(person => (
                             <Link href="/people" key={person.id} className="block">
                                <Card className="p-4 flex items-center justify-between transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage src={person.avatar} alt={person.name} />
                                            <AvatarFallback>
                                                {person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{person.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(parseISO(person.birthday), 'MMMM do')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                       <div className="flex items-center gap-2 text-primary font-bold">
                                         <Cake size={16} />
                                         <span>{getDaysUntil(person.birthday)}</span>
                                       </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            
            {(todaysBirthdays.length === 0 && tomorrowsBirthdays.length === 0 && upcomingBirthdays.length === 0 && !isMyBirthday) && (
                 <Card className="text-center py-12 px-6 border-2 border-dashed rounded-lg relative z-10">
                     <CardContent className="flex flex-col items-center justify-center pt-6">
                        <Users className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">It's a bit quiet...</h3>
                        <p className="text-muted-foreground mb-6">
                        There are no birthdays in the next 30 days. Why not add some more friends?
                        </p>
                        <Button onClick={() => router.push('/people')}>Go to Connections</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>

    <Dialog open={isMessagesDialogOpen} onOpenChange={setMessagesDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-primary">
                    <MessageSquare />
                    Messages from Admin
                </DialogTitle>
                <DialogDescription>
                    Here are the recent messages sent to you by the admin.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-72 w-full rounded-md border p-4">
                {adminMessages.length > 0 ? (
                    <div className="space-y-4">
                        {adminMessages.map(msg => (
                            <div key={msg.id} className="p-3 bg-muted rounded-lg">
                                <p className="text-sm">{msg.message}</p>
                                <p className="text-xs text-muted-foreground text-right mt-2">
                                    {formatDistanceToNow(parseISO(msg.timestamp), { addSuffix: true })}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No messages here.</p>
                    </div>
                )}
            </ScrollArea>
        </DialogContent>
    </Dialog>
    </>
  );
}
