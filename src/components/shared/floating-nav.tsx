
"use client";

import { Home, MoreVertical, Users, UserCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { Person } from "@/lib/types";

export function FloatingNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [isProfileSetup, setIsProfileSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { href: "/home", label: "Home", icon: Home, roles: ['user', 'admin'] },
    { href: "/people", label: "People", icon: Users, roles: ['user', 'admin'] },
    { href: "/profile", label: "Profile", icon: UserCircle, roles: ['user', 'admin'] },
    { href: "/admin", label: "Admin Panel", icon: Shield, roles: ['admin'] },
  ];

  useEffect(() => {
    // This effect runs only on the client
    let isMounted = true;
    try {
        const storedRole = localStorage.getItem("userRole");
        if(isMounted) setRole(storedRole);

        if (storedRole === 'user' || storedRole === 'admin') {
            const storedProfile = localStorage.getItem("profile");
            if (storedProfile) {
                const profile: Person = JSON.parse(storedProfile);
                if (!!profile.id && !!profile.name && profile.name !== 'Anonymous User' && !!profile.birthday && !!profile.contact) {
                   if(isMounted) setIsProfileSetup(true);
                }
            }
        }
    } catch (e) {
        console.error("Could not get user role", e);
    } finally {
        if(isMounted) setLoading(false);
    }
    return () => { isMounted = false; }
  }, [pathname]);
  
  if (loading || !isProfileSetup || !role) {
    return null; 
  }

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));
  
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
            aria-label="Open navigation menu"
          >
            <MoreVertical className="w-6 h-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 rounded-xl p-2 mb-2">
            <nav className="flex flex-col gap-1">
                {filteredNavItems.map((item) => (
                    <Link href={item.href} key={item.href}>
                        <Button
                         variant="ghost"
                         className={cn(
                           "w-full justify-start gap-3",
                           pathname === item.href && "bg-accent"
                         )}
                        >
                            <item.icon className="w-5 h-5 text-muted-foreground"/>
                            <span className="font-medium">{item.label}</span>
                        </Button>
                    </Link>
                ))}
            </nav>
        </PopoverContent>
      </Popover>
    </div>
  );
}
