"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Person, AdminMessage } from "@/lib/types";
import { Shield, UserCheck, UserX, Users, MessageSquare, Phone, Send, Ghost, Trash2, Search, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Input } from "../ui/input";

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

export function AdminPage() {
    const [nameRequest, setNameRequest] = useState<NameChangeRequest | null>(null);
    const [reRegRequest, setReRegRequest] = useState<ReRegistrationRequest | null>(null);
    const [userProfile, setUserProfile] = useState<Person | null>(null);
    const [allPeople, setAllPeople] = useState<Person[]>([]);
    const { toast } = useToast();

    const [isMessageDialogOpen, setMessageDialogOpen] = useState(false);
    const [selectedUserForMessage, setSelectedUserForMessage] = useState<Person | null>(null);
    const [messageContent, setMessageContent] = useState("");
    
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const loadData = () => {
        try {
            const nameRequestData = localStorage.getItem("nameChangeRequest");
            if (nameRequestData) {
                setNameRequest(JSON.parse(nameRequestData));
            }
            const reRegRequestData = localStorage.getItem("reRegistrationRequest");
            if (reRegRequestData) {
                setReRegRequest(JSON.parse(reRegRequestData));
            }
            const profileData = localStorage.getItem("profile");
            if (profileData) {
                const parsedProfile = JSON.parse(profileData);
                setUserProfile(parsedProfile);
            }
            const peopleData = localStorage.getItem("people");
            if (peopleData) {
                setAllPeople(JSON.parse(peopleData));
            }

        } catch (error) {
            console.error("Error loading data from local storage", error);
            toast({
                title: "Error",
                description: "Could not load data. Please try again.",
                variant: "destructive"
            });
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleNameRequestUpdate = (status: 'approved' | 'rejected') => {
        if (!nameRequest) return;
    
        try {
            if (status === 'approved') {
                const profileData = localStorage.getItem("profile");
                let profile: Person | null = profileData ? JSON.parse(profileData) : null;
    
                // Check if the request is for the currently logged-in user
                if (profile && profile.contact === nameRequest.contact) {
                    const updatedProfile = { ...profile, name: nameRequest.newName };
                    localStorage.setItem("profile", JSON.stringify(updatedProfile));
                    setUserProfile(updatedProfile); // Also update admin's own view if they changed their name
                } else {
                    const peopleData = localStorage.getItem("people");
                    let people: Person[] = peopleData ? JSON.parse(peopleData) : [];
                    const personIndex = people.findIndex(p => p.contact === nameRequest.contact);
                    
                    if (personIndex !== -1) {
                        people[personIndex].name = nameRequest.newName;
                        localStorage.setItem("people", JSON.stringify(people));
                        setAllPeople(people);
                    }
                }
            }
    
            const updatedRequest = { ...nameRequest, status };
            localStorage.setItem("nameChangeRequest", JSON.stringify(updatedRequest));
            setNameRequest(updatedRequest);
    
            toast({
                title: `Request ${status}`,
                description: `The name change request has been updated. The user will be notified.`,
            });
        } catch (error) {
            console.error("Error updating request", error);
            toast({
                title: "Error",
                description: "Could not update the name change request.",
                variant: "destructive"
            });
        }
    };
    
    const handleReRegRequestUpdate = (status: 'approved' | 'rejected') => {
        if (!reRegRequest) return;

        try {
            if (status === 'approved') {
                deleteUserByContact(reRegRequest.contact, true);
            }

            const updatedRequest = { ...reRegRequest, status };
            localStorage.setItem("reRegistrationRequest", JSON.stringify(updatedRequest));
            setReRegRequest(updatedRequest);

            toast({
                title: `Request ${status}`,
                description: `The re-registration request has been updated. The user will be notified.`,
            });
        } catch (error) {
            console.error("Error updating request", error);
            toast({
                title: "Error",
                description: "Could not update the re-registration request.",
                variant: "destructive"
            });
        }
    };
    
    const deleteUserByContact = (contact: string, isAdminAction: boolean = false) => {
         try {
            const profileData = localStorage.getItem("profile");
            if (profileData) {
                const profile: Person = JSON.parse(profileData);
                if (profile.contact === contact && !isAdminAction) {
                    toast({ title: "Action not allowed", description: "Admin profile cannot be deleted this way.", variant: "destructive" });
                    return;
                }
                if (profile.contact === contact) {
                    // This case is for re-registration of an existing user who is not admin.
                    localStorage.removeItem("profile");
                    localStorage.removeItem("userRole");
                    setUserProfile(null);
                }
            }
        
            const peopleData = localStorage.getItem("people");
            if (peopleData) {
                let people: Person[] = JSON.parse(peopleData);
                const updatedPeople = people.filter((p: Person) => p.contact !== contact);
                localStorage.setItem("people", JSON.stringify(updatedPeople));
                setAllPeople(updatedPeople);
            }
        } catch(e) {
            console.error("Error deleting user by contact", e);
        }
    }

    const handleDeleteUser = (personToDelete: Person) => {
        if (userProfile && personToDelete.contact === userProfile.contact) {
            toast({
                title: "Action Not Allowed",
                description: "You cannot delete your own admin profile from this panel.",
                variant: "destructive"
            });
            return;
        }

        try {
            deleteUserByContact(personToDelete.contact!, false);
            toast({
                title: "User Deleted",
                description: `${personToDelete.name} has been removed from the system.`
            });
        } catch (error) {
             toast({
                title: "Error",
                description: `Could not delete ${personToDelete.name}.`,
                variant: "destructive"
            });
        }
    };

    const openMessageDialog = (person: Person) => {
        setSelectedUserForMessage(person);
        setMessageContent("");
        setMessageDialogOpen(true);
    };

    const handleSendMessage = () => {
        if (!selectedUserForMessage || !messageContent) {
            toast({ title: "Message cannot be empty.", variant: "destructive" });
            return;
        }

        try {
            const messagesData = localStorage.getItem("adminMessages");
            const messages: AdminMessage[] = messagesData ? JSON.parse(messagesData) : [];

            const newMessage: AdminMessage = {
                id: `msg_${Date.now()}`,
                recipientContact: selectedUserForMessage.contact!,
                message: messageContent,
                timestamp: new Date().toISOString(),
                read: false,
            };

            const updatedMessages = [...messages, newMessage];
            localStorage.setItem("adminMessages", JSON.stringify(updatedMessages));

            toast({
                title: "Message Sent!",
                description: `Your message has been sent to ${selectedUserForMessage.name}.`
            });

            setMessageDialogOpen(false);

        } catch (error) {
            console.error("Failed to send message", error);
            toast({
                title: "Error",
                description: "Could not send the message. Please try again.",
                variant: "destructive"
            });
        }
    };
    
    const allUsers = userProfile 
        ? [userProfile, ...allPeople.filter(p => p.contact !== userProfile.contact)]
        : allPeople;

    const filteredUsers = allUsers.filter(person => 
        person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.contact?.includes(searchQuery)
    );

    return (
        <>
            <div className="container mx-auto px-4 py-8 md:py-12">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        <Shield className="w-8 h-8 text-primary"/>
                        Admin Panel
                    </h1>
                    <p className="text-muted-foreground">
                        Manage pending user requests and view all users.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    Name Change Request
                                </CardTitle>
                                <CardDescription>Review the pending name change request below.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {nameRequest && nameRequest.status === 'pending' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Reason</p>
                                            <p className="font-semibold">{nameRequest.reason}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Requested New Name</p>
                                            <p className="font-semibold text-primary">{nameRequest.newName}</p>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button variant="destructive" onClick={() => handleNameRequestUpdate('rejected')}>
                                                <UserX className="mr-2"/> Reject
                                            </Button>
                                            <Button onClick={() => handleNameRequestUpdate('approved')}>
                                                <UserCheck className="mr-2"/> Approve
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 px-6">
                                        <Ghost className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="text-xl font-semibold mt-4">No Pending Name Changes</h3>
                                        <p className="text-muted-foreground mt-2">
                                        There are currently no name change requests to review.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-primary">
                                    Re-Registration Request
                                </CardTitle>
                                <CardDescription>Review the pending request to re-register a number.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {reRegRequest && reRegRequest.status === 'pending' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2"><Phone size={14}/> Contact Number</p>
                                            <p className="font-semibold">{reRegRequest.contact}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2"><MessageSquare size={14}/> Reason</p>
                                            <p className="font-semibold text-primary">{reRegRequest.reason}</p>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button variant="destructive" onClick={() => handleReRegRequestUpdate('rejected')}>
                                                <UserX className="mr-2"/> Reject
                                            </Button>
                                            <Button onClick={() => handleReRegRequestUpdate('approved')}>
                                                <UserCheck className="mr-2"/> Approve
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 px-6">
                                        <Ghost className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="text-xl font-semibold mt-4">No Pending Re-Registrations</h3>
                                        <p className="text-muted-foreground mt-2">
                                            There are currently no re-registration requests to review.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                        <Users />
                                        All Users ({allUsers.length})
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(!isSearchVisible)}>
                                        {isSearchVisible ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                                    </Button>
                                </div>
                                {isSearchVisible && (
                                    <div className="mt-2">
                                        <Input 
                                            placeholder="Search by name or contact number..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                {filteredUsers.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredUsers.map(person => (
                                            <div key={person.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                                <div className="flex items-center gap-4">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Avatar className="w-12 h-12 cursor-pointer">
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
                                                    <div>
                                                        <div className="font-semibold flex items-center gap-2">
                                                            {person.name}
                                                            {userProfile && person.contact === userProfile.contact && (
                                                                <Badge variant="secondary">Admin</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Contact: {person.contact}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    {userProfile && person.contact !== userProfile.contact && (
                                                        <>
                                                        <Button variant="ghost" size="icon" onClick={() => openMessageDialog(person)}>
                                                            <MessageSquare className="h-5 w-5 text-primary" />
                                                        </Button>
                                                         <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <Trash2 className="h-5 w-5 text-destructive" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action will permanently delete {person.name}. This cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteUser(person)}>Delete User</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No users found.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            
            <Dialog open={isMessageDialogOpen} onOpenChange={setMessageDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-primary">Send Message to {selectedUserForMessage?.name}</DialogTitle>
                        <DialogDescription>
                            Compose your message below. The user will be notified on their home page.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            placeholder="Type your message here..."
                            rows={5}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendMessage}>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </>
    );
}
