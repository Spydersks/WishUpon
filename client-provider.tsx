
"use client";

import { Toaster } from "@/components/ui/toaster";
import { FloatingNav } from "@/components/shared/floating-nav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useState, useEffect } from "react";

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient ? (
        <>
          {children}
          <Toaster />
          <FloatingNav />
          <Analytics />
          <SpeedInsights />
        </>
      ) : null}
    </>
  );
}
