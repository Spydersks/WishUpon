
"use client";

import { ProfilePage } from "@/components/pages/settings";
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
    const router = useRouter();

    const handleBackToProfile = () => {
        router.push('/profile');
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-4xl">
                <ProfilePage onProfileSaved={handleBackToProfile} />
            </div>
        </div>
    );
}
