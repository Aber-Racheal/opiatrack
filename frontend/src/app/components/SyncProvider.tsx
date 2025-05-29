'use client';

import { useEffect } from 'react';
import { syncData } from '@/lib/sync';
import { initDB } from '@/lib/idb';

export default function SyncProvider() {
  useEffect(() => {
    initDB();

    const handleOnline = () => {
      console.log("🌐 Online! Syncing data...");
      syncData();
    };



    window.addEventListener('online', handleOnline);

    if (navigator.onLine) {
      syncData();
    }

    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return null;
}
