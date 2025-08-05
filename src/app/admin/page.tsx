
"use client";

import { AdminPage } from "@/components/pages/admin";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Admin() {
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        // This effect runs only on the client
        try {
            const role = localStorage.getItem('userRole');
            if (role !== 'admin') {
                if(isMounted) router.push('/');
            } else {
                if(isMounted) setIsAuthorized(true);
            }
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
    
    if (!isAuthorized) {
      return null;
    }

    return <AdminPage />;
}
