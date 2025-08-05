
"use client";

import { ProfilePage } from "@/components/pages/settings";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import type { Person } from "@/lib/types";

export default function Profile() {
    const router = useRouter();
    const [isSetup, setIsSetup] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        // This effect runs only on the client
        try {
            const storedProfile = localStorage.getItem("profile");
            if (storedProfile) {
                const profile: Person = JSON.parse(storedProfile);
                if (!profile.id || !profile.name || profile.name === 'Anonymous User' || !profile.birthday || !profile.contact) {
                    if(isMounted) setIsSetup(true);
                } else {
                    if(isMounted) setIsSetup(false);
                }
            } else {
                 if(isMounted) setIsSetup(true);
            }
        } catch (error) {
            console.error("Error checking profile status", error);
            if(isMounted) setIsSetup(true);
        } finally {
            if(isMounted) setLoading(false);
        }
        return () => { isMounted = false; }
    }, []);

    const handleSave = () => {
        router.push('/home');
    }
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-4xl">
                <ProfilePage onProfileSaved={handleSave} isSetup={isSetup} />
            </div>
        </div>
    );
}
