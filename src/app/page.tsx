
"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import type { Person } from "@/lib/types";

export default function Home() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const routeUser = () => {
             try {
                let storedRole = localStorage.getItem("userRole");

                if (storedRole === 'admin') {
                    if (isMounted) router.push('/admin');
                    return;
                }
                
                if (storedRole === 'user') {
                    const storedProfile = localStorage.getItem("profile");
                    
                    const isProfileComplete = (profile: string | null): boolean => {
                        if (!profile) return false;
                        try {
                            const parsedProfile: Person = JSON.parse(profile);
                            return !!parsedProfile.id && !!parsedProfile.name && parsedProfile.name !== 'Anonymous User' && !!parsedProfile.birthday && !!parsedProfile.contact;
                        } catch (e) {
                            return false;
                        }
                    }

                    if (isProfileComplete(storedProfile)) {
                        if (isMounted) router.push('/home');
                    } else {
                        if (isMounted) router.push('/profile');
                    }
                    return;
                }

                // If no role, new user, go to profile setup.
                if (!storedRole) {
                    if (isMounted) router.push('/profile');
                    return;
                }

            } catch (error) {
                console.error("Error in main router", error);
                // Attempt to recover by clearing storage and reloading
                try {
                    localStorage.clear();
                    if(isMounted) window.location.reload();
                } catch (e) {
                    console.error("Failed to clear local storage", e);
                }
            } finally {
                if(isMounted) {
                    setLoading(false);
                }
            }
        };
        
        routeUser();

        return () => {
            isMounted = false;
        }

    }, [router]);
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return null;
}
