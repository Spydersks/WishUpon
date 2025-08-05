
"use client";

import { HomePage } from "@/components/pages/home";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Person } from "@/lib/types";

export default function HomeRoute() {
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        const storedProfile = localStorage.getItem('profile');
        const storedRole = localStorage.getItem('userRole');

        if (!storedRole || !['user', 'admin'].includes(storedRole) || !storedProfile) {
            if(isMounted) router.push('/');
            return;
        }
        
        try {
            const profile: Person = JSON.parse(storedProfile);
            if (!profile.id || !profile.name || profile.name === 'Anonymous User' || !profile.birthday || !profile.contact) {
                if(isMounted) router.push('/profile');
                return;
            }
            if(isMounted) setIsAuthorized(true);
        } catch (e) {
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

    return <HomePage />;
}
