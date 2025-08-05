
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, QrCode, ArrowRight, Save, Camera, HelpCircle, ShieldCheck, XCircle, Upload, Crop, Trash2, ShieldQuestion, Users as UsersIcon, Loader2, FileText, LogOut } from "lucide-react";
import type { Person } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";


type NameChangeRequest = {
    contact: string;
    newName: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
}

type ReRegistrationRequest = {
    contact: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
};

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}


export function ProfilePage({ onProfileSaved, isSetup }: { onProfileSaved?: () => void, isSetup?: boolean }) {
  const [profile, setProfile] = useState<Person | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const [nameChangeRequest, setNameChangeRequest] = useState<NameChangeRequest | null>(null);
  const [reRegRequest, setReRegRequest] = useState<ReRegistrationRequest | null>(null);

  const [requestedName, setRequestedName] = useState('');
  const [requestReason, setRequestReason] = useState('');
  
  const [isPhotoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [isEditRequestDialogOpen, setEditRequestDialogOpen] = useState(false);
  const [isContactAdminDialogOpen, setContactAdminDialogOpen] = useState(false);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [completedCrop, setCompletedCrop] = useState<CropType>()

  const [isAdminChecked, setIsAdminChecked] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [contactForAdmin, setContactForAdmin] = useState('');
  const [reasonForAdmin, setReasonForAdmin] = useState('');

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [maxDate, setMaxDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    setMaxDate(eighteenYearsAgo.toISOString().split("T")[0]);
  }, []);


 useEffect(() => {
    let isMounted = true;
    const loadProfile = () => {
        try {
            const role = localStorage.getItem("userRole");
            if(isMounted) setUserRole(role);

            const profileData = localStorage.getItem("profile");
            if (profileData) {
                const storedProfile: Person = JSON.parse(profileData);
                if (isMounted) {
                    setProfile(storedProfile);
                    setRequestedName(storedProfile.name);
                }
            } else {
                 if (isMounted) setProfile({ id: '', name: "Anonymous User", birthday: '', contact: '', avatar: '' });
            }

            const nameRequestData = localStorage.getItem("nameChangeRequest");
            if(nameRequestData && isMounted) setNameChangeRequest(JSON.parse(nameRequestData));
            
            const reRegRequestData = localStorage.getItem("reRegistrationRequest");
            if(reRegRequestData && isMounted) setReRegRequest(JSON.parse(reRegRequestData));

        } catch (error) {
            console.error("Failed to parse profile from local storage", error);
        } finally {
            if (isMounted) setLoading(false);
        }
    }
    loadProfile();
    return () => { isMounted = false; }
  }, []);

  useEffect(() => {
    if (profile && profile.id && profile.name && profile.birthday && profile.contact) {
      const profileDataForQr = JSON.stringify({
          id: profile.id,
          name: profile.name,
          birthday: profile.birthday,
          contact: profile.contact,
          avatar: profile.avatar
      });
      const url = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(profileDataForQr)}&size=200x200&bgcolor=ffffff&t=${Date.now()}`;
      setQrCodeUrl(url);
    } else {
      setQrCodeUrl('');
    }
  }, [profile]);


    useEffect(() => {
        if (isPhotoDialogOpen) {
            if (!imageToCrop) {
                const getCameraPermission = async () => {
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        setHasCameraPermission(false);
                        return;
                    }
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                        setHasCameraPermission(true);

                        if (videoRef.current) {
                            videoRef.current.srcObject = stream;
                        }
                    } catch (error) {
                        setHasCameraPermission(false);
                    }
                };
                getCameraPermission();
            }
        } else {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            setImageToCrop(null);
            setCrop(undefined);
            setCompletedCrop(undefined);
        }
    }, [isPhotoDialogOpen, imageToCrop]);

  const handleProfileChange = (field: keyof Person, value: string) => {
    setProfile(p => {
        if (!p) return null;
        const newProfile = { ...p, [field]: value };
        
        // Save immediately only if not in setup and admin is editing
        if (!isSetup && userRole === 'admin') {
             try {
                localStorage.setItem("profile", JSON.stringify(newProfile));
                localStorage.setItem("adminProfile", JSON.stringify(newProfile));
            } catch (error) {
                console.error("Failed to save profile on change", error);
            }
        }

        return newProfile;
    });
  };
  
  const handleSave = () => {
    if (!profile || !profile.name || profile.name === "Anonymous User" || !profile.birthday || !profile.contact) {
        toast({ title: "Profile Incomplete", description: "Please fill out all fields before saving.", variant: "destructive" });
        return;
    }
     if (!/^\d{10}$/.test(profile.contact)) {
        toast({ title: "Invalid Number", description: "Please enter a valid 10-digit WhatsApp number.", variant: "destructive" });
        return;
    }
    if(isSetup && !termsAccepted) {
        toast({ title: "Terms and Conditions", description: "You must agree to the terms and conditions to continue.", variant: "destructive" });
        return;
    }

    try {
        let role = 'user';
        if (isAdminChecked) {
            if (adminId === process.env.NEXT_PUBLIC_ADMIN_ID && adminPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
                role = 'admin';
                 const adminProfile: Person = {
                    id: `user_${process.env.NEXT_PUBLIC_ADMIN_ID}`,
                    name: "WishUpon Admin",
                    birthday: "2000-01-01T00:00:00.000Z",
                    contact: process.env.NEXT_PUBLIC_ADMIN_ID,
                    avatar: "/icon.png"
                };
                localStorage.setItem("adminProfile", JSON.stringify(adminProfile));
            } else {
                toast({ title: "Invalid Admin Credentials", description: "The ID or password is incorrect.", variant: "destructive" });
                return;
            }
        } else {
            const peopleData = localStorage.getItem("people");
            const people = peopleData ? JSON.parse(peopleData) : [];
            const adminProfileData = localStorage.getItem("adminProfile");
            const adminProfile = adminProfileData ? JSON.parse(adminProfileData) : null;

            if (people.some((p: Person) => p.contact === profile.contact) || (adminProfile && adminProfile.contact === profile.contact)) {
                toast({ title: "User Exists", description: "This contact number is already registered. Contact admin for re-registration.", variant: "destructive" });
                return;
            }
        }

        const updatedProfile = {...profile};
        if (!profile.avatar) {
            updatedProfile.avatar = `https://placehold.co/128x128.png?text=${profile.name.split(' ').map(n => n[0]).join('')}`;
        }
        
        updatedProfile.id = `user_${profile.contact}`;
        
        setProfile(updatedProfile);
        localStorage.setItem("userRole", role);
        localStorage.setItem("profile", JSON.stringify(updatedProfile));
        toast({ title: "Profile Saved!", description: "Your profile has been saved successfully." });
        
        if(onProfileSaved) onProfileSaved();
        
    } catch (error) {
        console.error("Failed to save profile", error);
        toast({ title: "Error", description: "Could not save your profile. Please try again.", variant: "destructive" });
    }
  };

  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if(context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/png');
        setImageToCrop(dataUri);

        // Stop camera stream
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setImageToCrop(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfilePhoto = (dataUri: string) => {
     try {
        if (!profile) return;
        const updatedProfile = { ...profile, avatar: dataUri };
        
        localStorage.setItem("profile", JSON.stringify(updatedProfile));
        if (userRole === 'admin') {
            localStorage.setItem("adminProfile", JSON.stringify(updatedProfile));
        }

        setProfile(updatedProfile); // This will trigger the QR code useEffect
       
        toast({ title: "Photo Updated!", description: "Your profile photo has been updated." });
        setPhotoDialogOpen(false);
    } catch (error) {
        console.error("Failed to save photo", error);
        toast({ title: "Error", description: "Could not save your photo.", variant: "destructive" });
    }
  }


  const handleRequestNameChange = () => {
    if (!profile || !requestedName || requestedName === profile.name || !requestReason) {
        toast({ title: "Invalid Request", description: "Please enter a new name and a reason for the change.", variant: "destructive" });
        return;
    }
    const newRequest: NameChangeRequest = { contact: profile.contact!, newName: requestedName, reason: requestReason, status: 'pending' };
    localStorage.setItem("nameChangeRequest", JSON.stringify(newRequest));
    setNameChangeRequest(newRequest);
    setEditRequestDialogOpen(false);
    toast({ title: "Request Sent", description: "Your name change request has been submitted for review." });
  };

  const handleCancelRequest = () => {
     if (!profile) return;
    localStorage.removeItem("nameChangeRequest");
    setNameChangeRequest(null);
    setRequestedName(profile.name);
    setRequestReason('');
    toast({ title: "Request Cancelled", description: "Your name change request has been cancelled." });
  }

  const handleCheckNameChangeStatus = () => {
     if (!profile) return;
     const requestData = localStorage.getItem("nameChangeRequest");
     if(requestData){
        const request: NameChangeRequest = JSON.parse(requestData);
        setNameChangeRequest(request);

        if(request.status === 'approved') {
            const updatedProfile = {...profile, name: request.newName};
            setProfile(updatedProfile);
            setRequestedName(request.newName);
            localStorage.setItem("profile", JSON.stringify(updatedProfile));
            localStorage.removeItem("nameChangeRequest");
            setNameChangeRequest(null);
            toast({ title: "Name Change Approved!", description: "Your name has been updated." });
        } else if (request.status === 'rejected') {
            toast({ title: "Request Rejected", description: "Your name change request was not approved. You can submit a new one." });
            localStorage.removeItem("nameChangeRequest");
            setNameChangeRequest(null);
        } else {
            toast({ title: "Request Status", description: `Your request is currently: ${request.status}.` });
        }
     } else {
        toast({ title: "No Pending Request", description: "You do not have a pending name change request." });
     }
  }

  const handleSubmitReRegRequest = () => {
    if (!contactForAdmin || !/^\d{10}$/.test(contactForAdmin) || !reasonForAdmin) {
      toast({ title: 'Invalid Input', description: 'Please provide a valid 10-digit contact number and a reason.', variant: 'destructive' });
      return;
    }
    const newRequest: ReRegistrationRequest = { contact: contactForAdmin, reason: reasonForAdmin, status: 'pending' };
    localStorage.setItem('reRegistrationRequest', JSON.stringify(newRequest));
    setReRegRequest(newRequest);
    setContactAdminDialogOpen(false);
    toast({ title: 'Request Sent', description: 'Your request for re-registration has been sent to the admin.' });
  };

  const handleCheckReRegStatus = () => {
    const requestData = localStorage.getItem('reRegistrationRequest');
    if (requestData) {
      const request: ReRegistrationRequest = JSON.parse(requestData);
      setReRegRequest(request);
      if (request.status === 'approved') {
        toast({ title: 'Request Approved!', description: 'Your number has been cleared for re-registration. Please try creating your profile again.' });
        localStorage.removeItem('reRegistrationRequest');
        setReRegRequest(null);
      } else {
        toast({ title: 'Request Status', description: `Your re-registration request is currently: ${request.status}.` });
      }
    } else {
      toast({ title: 'No Pending Request', description: 'You do not have a pending re-registration request.' });
    }
  };


  const handleClearData = () => {
    try {
      localStorage.clear();
      toast({
        title: "Data Cleared",
        description: "Your data has been cleared. The app will now reload.",
      });
      setTimeout(() => window.location.href = '/', 500);
    } catch (error) {
      toast({ title: "Error", description: "Could not clear your data.", variant: "destructive" });
    }
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1))
  }

  async function handleCropAndSave() {
    const image = imgRef.current
    if (!image || !completedCrop) {
      throw new Error('Crop details not available')
    }

    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('No 2d context')
    }

    const crop = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
    }

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    )
    
    const base64Image = canvas.toDataURL('image/jpeg');
    updateProfilePhoto(base64Image);
  }
  
  if (loading) {
     return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }
  
  if (!profile) {
     return (
        <div className="flex items-center justify-center h-screen">
           <p>Could not load profile. Please try refreshing.</p>
        </div>
    );
  }

  const pageTitle = isSetup ? 'Create Your Profile' : 'Your Profile';
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
        <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                <User className="w-8 h-8 text-primary"/>
                {pageTitle}
            </h1>
            <p className="text-muted-foreground">
              {isSetup ? 'Set up your profile to start connecting with friends.' : 'Manage your personal information and QR code.'}
            </p>
        </header>

        <div className="space-y-8">
            <Card className="bg-card/70 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                        {isSetup ? 'Enter Your Details' : 'Your Details'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="flex justify-center">
                        <div className="relative group">
                            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary shadow-md">
                                <AvatarImage src={profile.avatar || ''} alt={profile.name} />
                                <AvatarFallback>
                                    <User />
                                </AvatarFallback>
                            </Avatar>
                           <Button
                                size="icon"
                                variant="outline"
                                className="absolute bottom-4 right-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background"
                                onClick={() => setPhotoDialogOpen(true)}
                            >
                                <Camera className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input 
                                id="name" 
                                value={profile.name === 'Anonymous User' ? '' : profile.name || ''}
                                onChange={(e) => handleProfileChange('name', e.target.value)}
                                placeholder="Your Full Name"
                                disabled={!isSetup && userRole !== 'admin'}
                            />
                             {isSetup && <p className="text-xs text-muted-foreground">You can apply to change this later if you're not an admin.</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact">WhatsApp Number</Label>
                            <Input 
                                id="contact"
                                type="tel"
                                value={profile.contact || ''}
                                onChange={(e) => handleProfileChange('contact', e.target.value)}
                                placeholder="10-digit number"
                                maxLength={10}
                                disabled={!isSetup}
                            />
                            {isSetup && <p className="text-xs text-muted-foreground">This cannot be changed after setup.</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="birthday">Birthday</Label>
                            <Input 
                                id="birthday" 
                                type="date"
                                max={maxDate}
                                value={profile.birthday ? profile.birthday.split('T')[0] : ''}
                                onChange={(e) => handleProfileChange('birthday', new Date(e.target.value).toISOString())}
                                disabled={!isSetup}
                            />
                            {isSetup && <p className="text-xs text-muted-foreground">You must be at least 18 years old. This cannot be changed after setup.</p>}
                        </div>
                    </div>

                    {isSetup && (
                        <>
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="isAdmin" checked={isAdminChecked} onCheckedChange={(checked) => setIsAdminChecked(!!checked)} />
                                <Label htmlFor="isAdmin" className="font-medium">Are you an admin?</Label>
                            </div>
                            {isAdminChecked && (
                                <div className="space-y-2 pl-6 border-l-2 border-primary ml-2">
                                    <div>
                                        <Label htmlFor="adminId">Admin ID</Label>
                                        <Input id="adminId" type="tel" value={adminId} onChange={(e) => setAdminId(e.target.value)} placeholder="Enter Admin ID" />
                                    </div>
                                    <div>
                                        <Label htmlFor="adminPassword">Admin Password</Label>
                                        <Input id="adminPassword" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Enter Admin Password" />
                                    </div>
                                </div>
                            )}
                        </div>
                         <div className="flex items-center space-x-2">
                                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} />
                                <Label htmlFor="terms" className="text-sm font-normal">
                                I agree to the{' '}
                                <Button variant="link" className="p-0 h-auto" onClick={() => setIsTermsDialogOpen(true)}>
                                    Terms and Conditions
                                </Button>
                                </Label>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {isSetup ? (
                <div className="space-y-2">
                    <Button onClick={handleSave} className="w-full text-lg py-6" disabled={!termsAccepted}>
                        <Save className="mr-2"/> Save and Enter App
                    </Button>
                    <Button onClick={() => setContactAdminDialogOpen(true)} className="w-full" variant="ghost">
                        <ShieldQuestion className="mr-2" /> Can't Register? Contact Admin
                    </Button>
                </div>
            ) : (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary"><QrCode className="w-5 h-5 text-primary"/> Your Connection Code</CardTitle>
                            <CardDescription>Have friends scan this code to add you.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center text-center p-8">
                            {qrCodeUrl ? (
                                <Image src={qrCodeUrl} alt="Your Profile QR Code" width={200} height={200} className="rounded-lg bg-white p-2 shadow-md" />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center p-8 h-[200px]">
                                    <p className="text-muted-foreground">Complete your profile to generate a QR code.</p>
                                </div>
                            )}
                             <p className="text-muted-foreground mt-4 text-sm">Point your friend's camera at this code from their "People" page.</p>
                        </CardContent>
                    </Card>
                    <div className="space-y-4">
                        {userRole !== 'admin' &&
                            <Button onClick={() => setEditRequestDialogOpen(true)} className="w-full" variant="secondary">
                               Apply to Edit Profile <ArrowRight className="ml-2"/>
                            </Button>
                        }
                         <Button onClick={() => router.push('/people')} className="w-full">
                           Go to Connections <UsersIcon className="ml-2"/>
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full">
                                    <Trash2 className="mr-2"/> Clear All Data
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will remove your profile and connections list. This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearData}>
                                    Yes, clear my data
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </>
            )}
        </div>
         <Dialog open={isPhotoDialogOpen} onOpenChange={setPhotoDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Profile Photo</DialogTitle>
                    <DialogDescription>
                        {imageToCrop ? "Adjust your photo" : "Use your camera or upload an image."}
                    </DialogDescription>
                </DialogHeader>
                {imageToCrop ? (
                    <div className="py-4 space-y-4">
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop
                        >
                            <Image
                                ref={imgRef}
                                alt="Crop me"
                                src={imageToCrop}
                                width={400}
                                height={400}
                                onLoad={onImageLoad}
                            />
                        </ReactCrop>
                            <DialogFooter>
                            <Button variant="outline" onClick={() => setImageToCrop(null)}>Back</Button>
                            <Button onClick={handleCropAndSave}>
                                <Crop className="mr-2"/> Crop & Save Photo
                            </Button>
                        </DialogFooter>
                    </div>

                ) : (
                    <>
                    <div className="py-4 space-y-4">
                        <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted />
                        {hasCameraPermission === null && (
                            <div className="text-center text-muted-foreground">Requesting camera permission...</div>
                        )}
                        {hasCameraPermission === false && (
                            <Alert variant="destructive">
                                <AlertTitle>Camera Access Denied</AlertTitle>
                                <AlertDescription>
                                Please enable camera permissions in your browser settings to use this feature.
                                </AlertDescription>
                            </Alert>
                        )}
                        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="hidden"/>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2"/> Upload
                        </Button>
                        <Button onClick={handleTakePhoto} disabled={!hasCameraPermission}>
                            <Camera className="mr-2" /> Take Photo
                        </Button>
                    </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
         <Dialog open={isEditRequestDialogOpen} onOpenChange={setEditRequestDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Request Profile Change</DialogTitle>
                    <DialogDescription>
                        Submit a request to change your name. An admin will review it.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                     {nameChangeRequest?.status === 'pending' ? (
                        <Alert>
                            <HelpCircle className="h-4 w-4" />
                            <AlertTitle>Request Pending</AlertTitle>
                            <AlertDescription>
                                Your request is awaiting approval. You can cancel it or check the status.
                            </AlertDescription>
                        </Alert>
                    ) : nameChangeRequest?.status === 'rejected' ? (
                         <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Request Rejected</AlertTitle>
                            <AlertDescription>
                                Your previous request was not approved. You can submit a new one.
                            </AlertDescription>
                        </Alert>
                    ) : null}

                    <div className="space-y-2">
                        <Label htmlFor="current-name">Current Name</Label>
                        <Input id="current-name" value={profile.name} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="requested-name">New Name</Label>
                        <Input id="requested-name" value={requestedName} onChange={(e) => setRequestedName(e.target.value)} disabled={nameChangeRequest?.status === 'pending'} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="request-reason">Reason for Change</Label>
                        <Textarea id="request-reason" value={requestReason} onChange={(e) => setRequestReason(e.target.value)} placeholder="e.g., Legal name change, corrected a typo..." disabled={nameChangeRequest?.status === 'pending'}/>
                    </div>
                </div>
                <DialogFooter className="flex flex-col gap-2 sm:flex-row">
                    {nameChangeRequest?.status === 'pending' ? (
                         <>
                            <Button variant="destructive" onClick={handleCancelRequest} className="w-full sm:w-auto">Cancel Request</Button>
                            <Button onClick={handleCheckNameChangeStatus} className="w-full sm:w-auto">Check Status</Button>
                         </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setEditRequestDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                            <Button onClick={handleRequestNameChange} className="w-full sm:w-auto">Submit Request</Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
         <Dialog open={isContactAdminDialogOpen} onOpenChange={setContactAdminDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Contact Admin for Re-Registration</DialogTitle>
                     <DialogDescription>
                        If your number is already registered and you need to re-register, submit a request.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                     {reRegRequest?.status === 'pending' ? (
                        <Alert>
                            <HelpCircle className="h-4 w-4" />
                            <AlertTitle>Request Pending</AlertTitle>
                            <AlertDescription>
                                Your request is awaiting approval. You can check the status.
                            </AlertDescription>
                        </Alert>
                    ) : reRegRequest?.status === 'rejected' ? (
                         <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>Request Rejected</AlertTitle>
                            <AlertDescription>
                                Your previous request was not approved.
                            </AlertDescription>
                        </Alert>
                    ) : reRegRequest?.status === 'approved' ? (
                        <Alert className="border-green-500 text-green-700">
                           <ShieldCheck className="h-4 w-4 text-green-500" />
                           <AlertTitle>Request Approved!</AlertTitle>
                           <AlertDescription>
                               You can now register with this number. Please restart the app.
                           </AlertDescription>
                       </Alert>
                    ) : null }
                    <div className="space-y-2">
                        <Label htmlFor="contact-admin-number">Your Contact Number</Label>
                        <Input id="contact-admin-number" type="tel" value={contactForAdmin} onChange={(e) => setContactForAdmin(e.target.value)} disabled={reRegRequest?.status === 'pending'} maxLength={10} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="contact-admin-reason">Reason for Re-Registration</Label>
                        <Textarea id="contact-admin-reason" value={reasonForAdmin} onChange={(e) => setReasonForAdmin(e.target.value)} placeholder="e.g., Lost access to my old device, someone else registered my number by mistake..." disabled={reRegRequest?.status === 'pending'}/>
                    </div>
                </div>
                <DialogFooter className="flex-col gap-2 sm:flex-row">
                    {reRegRequest?.status === 'pending' ? (
                        <Button onClick={handleCheckReRegStatus} className="w-full">Check Status</Button>
                    ) : (
                        <Button onClick={handleSubmitReRegRequest} className="w-full">Submit Request</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isTermsDialogOpen} onOpenChange={setIsTermsDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="text-primary"/>
                        Terms and Conditions
                    </DialogTitle>
                    <DialogDescription>
                        Please read our terms carefully before using the application.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-72 w-full rounded-md border p-4">
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                        
                        <h3 className="font-semibold text-foreground">1. Data Storage and Privacy</h3>
                        <p>This application stores all your data, including your profile information (name, birthday, contact number, avatar) and your connections' information, directly on your device's local storage. We do not transmit or store your personal data on any external servers. Your data remains private and under your control.</p>

                        <h3 className="font-semibold text-foreground">2. Data Usage</h3>
                        <p>The data you provide is used solely for the functionality of the app, such as scheduling birthday reminders and creating connections. Your contact number is used to uniquely identify you and your connections. AI features may process non-identifiable data (like a recipient's first name) to generate message suggestions, but this data is not stored.</p>
                        
                        <h3 className="font-semibold text-foreground">3. User Responsibilities</h3>
                        <p>You are responsible for the accuracy of the information you provide. You agree not to use the application for any unlawful purposes or to harass others. You are also responsible for maintaining the security of your device.</p>
                        
                        <h3 className="font-semibold text-foreground">4. Data Deletion</h3>
                        <p>You can clear all your application data at any time from the Profile page. This action is irreversible and will permanently delete all your profile and connection data from your device.</p>
                        
                        <h3 className="font-semibold text-foreground">5. No Warranties</h3>
                        <p>This application is provided "as is" without any warranties of any kind. We do not guarantee that the app will always be available, error-free, or that it will meet your specific requirements.</p>

                        <h3 className="font-semibold text-foreground">6. Changes to Terms</h3>
                        <p>We may update these terms and conditions from time to time. You will be notified of any significant changes. Continued use of the app after such changes constitutes your acceptance of the new terms.</p>

                        <p>By checking the box, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button onClick={() => setIsTermsDialogOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
