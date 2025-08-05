
"use client";

import { useState, useEffect, Suspense } from "react";
import { PeoplePage } from "@/components/pages/people";
import { useRouter } from "next/navigation";
import type { Person } from "@/lib/types";

function PeoplePageWrapper() {
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        try {
            const storedRole = localStorage.getItem("userRole");
            if (!storedRole) {
                if(isMounted) router.push('/');
                return;
            }
            if (storedRole === 'user' || storedRole === 'admin') {
                const storedProfile = localStorage.getItem('profile');
                if (!storedProfile) {
                    if(isMounted) router.push('/profile');
                    return;
                }
                const profile: Person = JSON.parse(storedProfile);
                 if (!profile.id || !profile.name || profile.name === 'Anonymous User' || !profile.birthday || !profile.contact) {
                    if(isMounted) router.push('/profile');
                    return;
                }
            }
            if(isMounted) setIsAuthorized(true);
        } catch (error) {
            console.error("Failed to load profile from local storage", error);
            if(isMounted) router.push('/');
        } finally {
            if(isMounted) setLoading(false);
        }
        return () => { isMounted = false; }
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }
    
    if(!isAuthorized) {
        return null;
    }

    return <PeoplePage />;
}


export default function People() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="text-lg">Loading...</div></div>}>
            <PeoplePageWrapper />
        </Suspense>
    )
}
