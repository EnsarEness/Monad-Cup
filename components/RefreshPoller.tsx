"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RefreshPoller({ isLive }: { isLive: boolean }) {
    const router = useRouter();

    useEffect(() => {
        if (!isLive) return;

        const interval = setInterval(() => {
            router.refresh();
        }, 2000);

        return () => clearInterval(interval);
    }, [isLive, router]);

    return null;
}
