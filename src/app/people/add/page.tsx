
"use client";

import { AddPersonPage } from "@/components/pages/add-person";
import { useRouter } from 'next/navigation';

export default function AddPersonRoute() {
    const router = useRouter();

    const handleBackToPeople = () => {
        router.push('/people');
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-4xl">
                <AddPersonPage onPersonAdded={handleBackToPeople} />
            </div>
        </div>
    );
}
