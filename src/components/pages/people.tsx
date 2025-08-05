
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, User, Trash2, Send, Cake, Sparkles, Wand2, Gift, QrCode, Loader2, Mic, StopCircle, Camera } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Person, BirthdayWish } from "@/lib/types";
import { differenceInDays, isSameDay, parseISO } from "date-fns";
import { Textarea } from "../ui/textarea";
import { suggestMessages } from "@/ai/flows/suggest-messages-flow";
import { speechToText } from "@/ai/flows/text-to-speech-flow";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import jsQR from "jsqr";

export function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [isAddPersonDialogOpen, setAddPersonDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isWishStationOpen, setWishStationOpen] = useState(false);
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsOpen, setSuggestionsOpen] = useState(false);
  const [isGenerating, setGenerating] = useState(false);
  const [wishMessage, setWishMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // QR Scanner refs and state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scannerMessage, setScannerMessage] = useState("Requesting camera permission...");
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let stream: MediaStream;
    let animationFrameId: number;

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
            if (code) {
                handleScanResult(code.data);
                return; // Stop scanning
            }
        }
      }
      if (isScanning) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    const startScan = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true"); // Required for iOS
          videoRef.current.play();
          setScannerMessage("Point camera at a QR code...");
          setIsScanning(true);
          animationFrameId = requestAnimationFrame(tick);
        }
      } catch (err) {
        setScannerMessage("Camera permission denied. Please enable it in your browser settings.");
        setScannerOpen(false);
        toast({
            title: "Camera Access Denied",
            description: "Please enable camera permissions in your browser settings to use this feature.",
            variant: "destructive",
        });
      }
    };
    
    const stopScan = () => {
        setIsScanning(false);
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }

    if (isScannerOpen) {
      startScan();
    } else {
        stopScan();
    }

    return () => {
      stopScan();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScannerOpen]);


  const getNextBirthday = (birthday: Date): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const birthDateThisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  
    if (birthDateThisYear < today) {
      return new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
    }
    return birthDateThisYear;
  };
  
  const sendBirthdaysToNative = (peopleList: Person[]) => {
      if ((window as any).Android && (window as any).Android.scheduleAlarms) {
          console.log("Android interface found, sending birthday data for alarm scheduling.");
          const peopleJson = JSON.stringify(peopleList);
          (window as any).Android.scheduleAlarms(peopleJson);
      } else {
          console.log("Android interface not found. Running in standard browser.");
      }
  };

  const loadPeople = () => {
    setLoading(true);
    try {
      const storedPeople = localStorage.getItem("people");
      if (storedPeople) {
        const parsedPeople: Person[] = JSON.parse(storedPeople);
        const sortedPeople = parsedPeople.sort((a, b) => {
          const nextBirthdayA = getNextBirthday(parseISO(a.birthday));
          const nextBirthdayB = getNextBirthday(parseISO(b.birthday));
          return nextBirthdayA.getTime() - nextBirthdayB.getTime();
        });
        setPeople(sortedPeople);
        sendBirthdaysToNative(sortedPeople);
        return sortedPeople;
      }
      return [];
    } catch (error) {
      console.error("Failed to load people from local storage", error);
      return [];
    } finally {
        setLoading(false);
    }
  }
  
  useEffect(() => {
    const peopleList = loadPeople();
    const wishPersonId = searchParams.get('wish');
    if (wishPersonId) {
        const personToWish = peopleList.find(p => p.id === wishPersonId);
        if (personToWish) {
            handleCardClick(personToWish, true);
        }
        router.replace('/people', { scroll: false });
    }

    const handleFocus = () => {
      loadPeople();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const addPerson = (person: Person) => {
    const storedPeople = localStorage.getItem("people");
    const currentPeople: Person[] = storedPeople ? JSON.parse(storedPeople) : [];
    const storedProfile = localStorage.getItem("profile");
    const profile: Person | null = storedProfile ? JSON.parse(storedProfile) : null;


    if (currentPeople.some(p => p.contact === person.contact) || (profile && profile.contact === person.contact)) {
      toast({
        title: "Already Connected",
        description: `You are already connected with ${person.name}.`,
        variant: "destructive"
      });
      return;
    }
    
    const newPeople = [...currentPeople, person];
    localStorage.setItem("people", JSON.stringify(newPeople));
    loadPeople();
    sendBirthdaysToNative(newPeople);

     toast({
        title: "Connection Added!",
        description: `You are now connected with ${person.name}.`,
      });
  };

  const deletePerson = (id: string) => {
    const updatedPeople = people.filter(p => p.id !== id);
    setPeople(updatedPeople);
    localStorage.setItem("people", JSON.stringify(updatedPeople));
    sendBirthdaysToNative(updatedPeople);
    toast({
      title: "Connection Removed",
      description: "The person has been removed from your connections.",
    });
  }

  const handleScanResult = (result: string | null) => {
    if (result) {
      setScannerOpen(false);
      try {
        const person = JSON.parse(result);
        
        if (person.id && person.name && person.birthday && person.contact) {
            const finalPerson: Person = {
                id: person.id,
                name: person.name,
                birthday: person.birthday,
                contact: person.contact,
                avatar: person.avatar || `https://placehold.co/128x128.png?text=${person.name.split(' ').map((n: string) => n[0]).join('')}`
            };
          addPerson(finalPerson);
        } else {
          toast({
            title: "Invalid QR Code",
            description: "The scanned QR code is missing required profile information.",
            variant: "destructive",
          });
        }
      } catch (e) {
        toast({
            title: "Invalid QR Code",
            description: "Could not read the data from the QR code.",
            variant: "destructive",
        });
      }
    }
  };


  const openScanner = () => {
    setAddPersonDialogOpen(false);
    setScannerOpen(true);
  }

  const openManualAdd = () => {
    setAddPersonDialogOpen(false);
    router.push('/people/add');
  }
  
  const handleCardClick = (person: Person, forceOpen = false) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const birthdayDate = parseISO(person.birthday);
    const birthdayThisYear = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());

    if (isSameDay(birthdayThisYear, today) || forceOpen) {
        setSelectedPerson(person);
        setWishMessage('');
        setRecordedAudioUri(null);
        setWishStationOpen(true);
    } else {
        toast({
            title: "Not their birthday yet!",
            description: `You can send a wish on ${person.name}'s birthday.`
        });
    }
  };

  const handleSendWish = () => {
    if (isRecording) {
      stopRecording();
    }
    if (!selectedPerson || (!wishMessage && !recordedAudioUri)) {
        toast({ title: "Empty Wish", description: "Please write a message or record audio.", variant: "destructive" });
        return;
    }
    
    setIsSaving(true);
    try {
        const storedWishes = localStorage.getItem("birthdayWishes");
        const allWishes: BirthdayWish[] = storedWishes ? JSON.parse(storedWishes) : [];
        const currentUserProfile = JSON.parse(localStorage.getItem('profile') || '{}');

        const newWish: BirthdayWish = {
            id: `wish_${selectedPerson.contact}_${Date.now()}`,
            recipientContact: selectedPerson.contact!,
            senderName: currentUserProfile.name || 'Anonymous',
            senderAvatar: currentUserProfile.avatar || '',
            textMessage: wishMessage,
            audioDataUri: recordedAudioUri || undefined,
            timestamp: new Date().toISOString(),
            played: false
        };

        const updatedWishes = [...allWishes, newWish];
        localStorage.setItem("birthdayWishes", JSON.stringify(updatedWishes));
        
        toast({
            title: "Wish Saved In-App!",
            description: `${selectedPerson.name} will see your wish in their app.`,
        });

        // Also open WhatsApp
        if (wishMessage) {
            const whatsappUrl = `https://wa.me/${selectedPerson.contact}?text=${encodeURIComponent(wishMessage)}`;
            window.open(whatsappUrl, '_blank');
        }

        setWishStationOpen(false);

    } catch (error) {
        console.error("Failed to save wish", error);
        toast({
            title: "Error",
            description: "Could not save the wish. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsSaving(false);
    }
  };

  const getBirthdayStatus = (birthday: string) => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const bday = parseISO(birthday);
      
      const bdayThisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());

      if (isSameDay(bdayThisYear, today)) return 'today';

      const nextBday = getNextBirthday(bday);
      const daysUntil = differenceInDays(nextBday, today);

      if (daysUntil > 0 && daysUntil <= 3) return 'soon';
      return 'later';
  }

  const handleGenerateSuggestions = async () => {
    if (!selectedPerson) return;
    setGenerating(true);
    setSuggestionsOpen(true);
    try {
      const result = await suggestMessages({ recipientName: selectedPerson.name });
      if (result.suggestions) {
        setSuggestions(result.suggestions);
      }
    } catch (error) {
      console.error("Failed to generate suggestions", error);
      toast({
        title: "Error",
        description: "Could not generate message suggestions. Please try again.",
        variant: "destructive",
      });
      setSuggestionsOpen(false);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setWishMessage(suggestion);
    setSuggestionsOpen(false);
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({ title: 'Audio Recording not supported', variant: 'destructive' });
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      setRecordedAudioUri(null);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const audioUri = reader.result as string;
          setRecordedAudioUri(audioUri);
          
          setIsTranscribing(true);
          try {
            const { text } = await speechToText({ audioDataUri: audioUri });
            setWishMessage(prev => prev ? `${prev} ${text}`.trim() : text);
          } catch (e) {
             toast({ title: "Transcription Failed", description: "Could not convert speech to text.", variant: "destructive" });
          } finally {
              setIsTranscribing(false);
          }
        };
         // Stop all media tracks to turn off the mic indicator
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      toast({ title: 'Microphone Access Denied', description: 'Please enable microphone permissions.', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({length: 4}).map((_, i) => (
            <Card key={i} className="p-4">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="w-24 h-24 rounded-full" />
                    <Skeleton className="h-6 w-3/4" />
                </div>
            </Card>
        ))}
    </div>
  );

  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-12">
          <header className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    <Users className="w-8 h-8 text-primary"/>
                    Connections
                </h1>
                <p className="text-muted-foreground">Manage your birthday connections.</p>
            </div>
            <Button onClick={() => setAddPersonDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Connection
            </Button>
          </header>
          
          {loading ? (
             renderLoadingSkeleton()
          ) : people.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {people.map(person => {
                const bdayStatus = getBirthdayStatus(person.birthday);
                
                const cardClasses = {
                  today: 'cursor-pointer text-white bg-gradient-to-tr from-primary via-accent to-pink-400 shadow-lg',
                  soon: 'cursor-pointer border-2 border-accent',
                  later: 'hover:shadow-md'
                };

                const cardContentClasses = {
                  today: '',
                  soon: 'bg-background rounded-lg',
                  later: ''
                };

                return (
                  <Card 
                    key={person.id} 
                    className={cn('text-center p-0.5 transition-all relative overflow-hidden rounded-lg', cardClasses[bdayStatus])}
                    onClick={() => handleCardClick(person)}
                  >
                     <div className={cn('p-4 rounded-[7px] h-full flex flex-col justify-center', cardContentClasses[bdayStatus], bdayStatus !== 'today' && 'text-foreground')}>
                      {bdayStatus === 'today' && (
                         <div className="absolute top-2 right-2 text-white animate-bounce">
                          <Cake size={24} />
                        </div>
                      )}
                      <Dialog>
                        <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary cursor-pointer">
                                <AvatarImage src={person.avatar} alt={person.name} />
                                <AvatarFallback>
                                    {person.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                        </DialogTrigger>
                        <DialogContent className="p-0 max-w-md bg-transparent border-none">
                             <DialogHeader>
                                <DialogTitle className="sr-only">Profile photo of {person.name}</DialogTitle>
                             </DialogHeader>
                             <Image src={person.avatar || ''} alt={person.name} width={512} height={512} className="rounded-lg w-full h-auto" />
                        </DialogContent>
                      </Dialog>
                      <CardTitle className="text-lg">{person.name}</CardTitle>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "absolute bottom-2 right-2",
                              bdayStatus === 'today' ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-destructive"
                              )} 
                            onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove {person.name} from your connections.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deletePerson(person.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 px-6 border-2 border-dashed rounded-lg">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4"/>
                <h3 className="text-xl font-semibold mb-2">No Connections Yet</h3>
                <p className="text-muted-foreground">
                  Click "Add Connection" to connect with your friends and family.
                </p>
            </div>
          )}
      </div>

      <Dialog open={isScannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              {scannerMessage}
            </DialogDescription>
          </DialogHeader>
           <div className="h-64 flex items-center justify-center rounded-lg overflow-hidden bg-muted relative">
            <video ref={videoRef} className={cn("w-full h-full object-cover", isScanning ? 'opacity-100' : 'opacity-0')} />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center text-center p-4 pointer-events-none">
                <div className="w-48 h-48 border-4 border-white/50 rounded-lg"></div>
            </div>
            {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                    <Camera className="w-12 h-12 text-muted-foreground"/>
                    <p className="text-muted-foreground">{scannerMessage}</p>
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isWishStationOpen} onOpenChange={setWishStationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="text-primary"/>
              Wish {selectedPerson?.name} a Happy Birthday!
            </DialogTitle>
             <DialogDescription>Record an audio message and/or write a note.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="wish-message">Write a message</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerateSuggestions}
                        disabled={!selectedPerson || isGenerating}
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Suggest
                    </Button>
                  </div>
                  <Textarea 
                    id="wish-message"
                    value={wishMessage} 
                    onChange={(e) => setWishMessage(e.target.value)} 
                    placeholder="Happy Birthday!..."
                    rows={3}
                  />
              </div>

               <div className="space-y-2">
                    <Label>Record and Transcribe</Label>
                    <div className="flex items-center gap-4 p-2 border rounded-md">
                         <Button
                            size="icon"
                            variant="ghost"
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onTouchStart={startRecording}
                            onTouchEnd={stopRecording}
                            className={cn(
                                "rounded-full w-12 h-12 text-muted-foreground",
                                isRecording && "text-destructive bg-destructive/20"
                            )}
                            disabled={isTranscribing}
                            >
                            {isRecording ? <StopCircle size={24} /> : <Mic size={24} />}
                        </Button>
                        <div className="flex-1 text-sm text-muted-foreground">
                            {isRecording ? (
                                <p className="text-destructive font-medium">Recording...</p>
                            ) : isTranscribing ? (
                                <p className="text-primary font-medium flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin"/> Transcribing...
                                </p>
                            ) : recordedAudioUri ? (
                                <p className="text-green-600 font-medium">Audio recorded and transcribed!</p>
                            ) : (
                                <p>Tap and hold to record</p>
                            )}
                        </div>
                    </div>
               </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWishStationOpen(false)}>Cancel</Button>
            <Button onClick={handleSendWish} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2" /> Send Wish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuggestionsOpen} onOpenChange={setSuggestionsOpen}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-primary"/>
              Message Suggestions
            </DialogTitle>
            <DialogDescription>
              Here are some AI-powered suggestions for {selectedPerson?.name}. Click one to use it.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-72 w-full rounded-md border p-4">
            {isGenerating ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-full" />
                 <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
            )}
          </ScrollArea>
           <DialogFooter>
            <Button variant="ghost" onClick={() => setSuggestionsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       <Dialog open={isAddPersonDialogOpen} onOpenChange={setAddPersonDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <User className="w-5 h-5"/>
                Add New Connection
                </DialogTitle>
              <DialogDescription>
                How would you like to add a new person to your connections?
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={openManualAdd}>
                    <PlusCircle className="w-6 h-6"/>
                    <span className="text-base">Add Manually</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={openScanner}>
                    <QrCode className="w-6 h-6"/>
                    <span className="text-base">Scan QR Code</span>
                </Button>
            </div>
          </DialogContent>
        </Dialog>
    </>
  );
}
