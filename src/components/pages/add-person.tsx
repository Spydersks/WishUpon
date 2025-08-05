
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Save, Camera, Upload, Crop, ArrowLeft, Loader2 } from "lucide-react";
import type { Person } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Image from "next/image";
import { useRouter } from "next/navigation";


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

export function AddPersonPage({ onPersonAdded }: { onPersonAdded: () => void }) {
  const [person, setPerson] = useState<Partial<Person>>({ name: '', birthday: '', contact: '', avatar: '' });
  const { toast } = useToast();
  const router = useRouter();
  
  const [isPhotoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const [isLoading, setIsLoading] = useState(false);

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


  const handleChange = (field: keyof Person, value: string) => {
    setPerson(p => ({ ...p, [field]: value }));
  };

  const handleSave = () => {
    if (!person.name || !person.birthday || !person.contact) {
      toast({
        title: "Incomplete Information",
        description: "Please fill out all fields.",
        variant: "destructive"
      });
      return;
    }
     if (!/^\d{10}$/.test(person.contact)) {
        toast({
            title: "Invalid Contact Number",
            description: "Please enter a valid 10-digit phone number.",
            variant: "destructive"
        });
        return;
    }

    setIsLoading(true);
    try {
        const storedPeople = localStorage.getItem("people");
        const people: Person[] = storedPeople ? JSON.parse(storedPeople) : [];
        const storedProfile = localStorage.getItem("profile");
        const profile: Person | null = storedProfile ? JSON.parse(storedProfile) : null;

        if (people.some(p => p.contact === person.contact) || (profile && profile.contact === person.contact)) {
             toast({
                title: "Connection Already Exists",
                description: "A person with this contact number is already in your connections or is your own profile.",
                variant: "destructive"
            });
            setIsLoading(false);
            return;
        }

        const newPerson: Person = {
            id: `person_${person.contact}_${Date.now()}`,
            name: person.name,
            birthday: person.birthday,
            contact: person.contact,
            avatar: person.avatar || `https://placehold.co/128x128.png?text=${person.name.split(' ').map(n => n[0]).join('')}`
        };

        const updatedPeople = [...people, newPerson];
        localStorage.setItem("people", JSON.stringify(updatedPeople));
        
        toast({
            title: "Connection Added!",
            description: `${person.name} has been added to your connections.`,
        });
        
        onPersonAdded();

    } catch (error) {
        console.error("Failed to save person", error);
        toast({
            title: "Error",
            description: "Could not save the new connection. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
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
    setPerson(p => ({ ...p, avatar: base64Image }));
    setPhotoDialogOpen(false);
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          <User className="w-8 h-8 text-primary" />
          Add New Connection
        </h1>
        <p className="text-muted-foreground">
          Manually enter the details of the person you want to add.
        </p>
      </header>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-center">
            <div className="relative group">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                <AvatarImage src={person.avatar || ''} alt={person.name} />
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

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={person.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <Input
              id="birthday"
              type="date"
              value={person.birthday ? person.birthday.split('T')[0] : ''}
              onChange={(e) => handleChange('birthday', new Date(e.target.value).toISOString())}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">WhatsApp Number</Label>
            <Input
              id="contact"
              type="tel"
              value={person.contact || ''}
              onChange={(e) => handleChange('contact', e.target.value)}
              placeholder="10-digit number"
              maxLength={10}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => router.push('/people')}>
              <ArrowLeft className="mr-2" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2" /> Save Connection
            </Button>
          </div>
        </CardContent>
      </Card>

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
                  <Crop className="mr-2" /> Crop & Save Photo
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
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2" /> Upload
                </Button>
                <Button onClick={handleTakePhoto} disabled={!hasCameraPermission}>
                  <Camera className="mr-2" /> Take Photo
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
