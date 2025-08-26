'use client';

import { useState, useEffect, useCallback } from 'react';

interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isOffline: boolean;
  updateAvailable: boolean;
  installPrompt: PWAInstallPrompt | null;
}

interface PWACapabilities {
  notification: boolean;
  backgroundSync: boolean;
  periodicSync: boolean;
  push: boolean;
  share: boolean;
  camera: boolean;
  geolocation: boolean;
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    isOffline: !navigator.onLine,
    updateAvailable: false,
    installPrompt: null,
  });

  const [serviceWorkerRegistration, setServiceWorkerRegistration] = 
    useState<ServiceWorkerRegistration | null>(null);

  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    notification: false,
    backgroundSync: false,
    periodicSync: false,
    push: false,
    share: false,
    camera: false,
    geolocation: false,
  });

  // Register service worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  // Check capabilities
  useEffect(() => {
    checkCapabilities();
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as PWAInstallPrompt;
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: installEvent,
      }));
    };

    const handleAppInstalled = () => {
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if already installed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone ||
        document.referrer.includes('android-app://');
      
      setPwaState(prev => ({
        ...prev,
        isInstalled: isStandalone,
      }));
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      setServiceWorkerRegistration(registration);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setPwaState(prev => ({ ...prev, updateAvailable: true }));
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, payload } = event.data;
        
        switch (type) {
          case 'DATA_UPDATED':
            // Handle data updates
            console.log('PWA: Data updated', payload);
            break;
          case 'SYNC_COMPLETE':
            // Handle sync completion
            console.log('PWA: Sync complete', payload);
            break;
          default:
            break;
        }
      });

      console.log('PWA: Service Worker registered successfully');
      return registration;
    } catch (error) {
      console.error('PWA: Service Worker registration failed:', error);
      return null;
    }
  };

  const checkCapabilities = () => {
    const caps: PWACapabilities = {
      notification: 'Notification' in window && 'serviceWorker' in navigator,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      periodicSync: 'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype,
      push: 'serviceWorker' in navigator && 'PushManager' in window,
      share: 'share' in navigator,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      geolocation: 'geolocation' in navigator,
    };

    setCapabilities(caps);
  };

  const installApp = useCallback(async () => {
    if (!pwaState.installPrompt) {
      throw new Error('Install prompt not available');
    }

    try {
      await pwaState.installPrompt.prompt();
      const choice = await pwaState.installPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        setPwaState(prev => ({
          ...prev,
          isInstallable: false,
          installPrompt: null,
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('PWA: Installation failed:', error);
      throw error;
    }
  }, [pwaState.installPrompt]);

  const requestNotificationPermission = useCallback(async () => {
    if (!capabilities.notification) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, [capabilities.notification]);

  const subscribeToPush = useCallback(async (vapidPublicKey: string) => {
    if (!serviceWorkerRegistration || !capabilities.push) {
      throw new Error('Push notifications not supported');
    }

    try {
      const subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });

      return subscription;
    } catch (error) {
      console.error('PWA: Push subscription failed:', error);
      throw error;
    }
  }, [serviceWorkerRegistration, capabilities.push]);

  const scheduleBackgroundSync = useCallback(async (tag: string) => {
    if (!serviceWorkerRegistration || !capabilities.backgroundSync) {
      throw new Error('Background sync not supported');
    }

    try {
      await serviceWorkerRegistration.sync.register(tag);
      console.log('PWA: Background sync scheduled:', tag);
    } catch (error) {
      console.error('PWA: Background sync failed:', error);
      throw error;
    }
  }, [serviceWorkerRegistration, capabilities.backgroundSync]);

  const schedulePeriodicSync = useCallback(async (tag: string, minInterval: number) => {
    if (!serviceWorkerRegistration || !capabilities.periodicSync) {
      throw new Error('Periodic sync not supported');
    }

    try {
      // @ts-expect-error - TypeScript doesn't have types for periodicSync yet
      await serviceWorkerRegistration.periodicSync.register(tag, {
        minInterval,
      });
      console.log('PWA: Periodic sync scheduled:', tag);
    } catch (error) {
      console.error('PWA: Periodic sync failed:', error);
      throw error;
    }
  }, [serviceWorkerRegistration, capabilities.periodicSync]);

  const shareContent = useCallback(async (shareData: {
    title?: string;
    text?: string;
    url?: string;
    files?: File[];
  }) => {
    if (!capabilities.share) {
      throw new Error('Web Share API not supported');
    }

    try {
      await navigator.share(shareData);
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // User cancelled sharing
        return false;
      }
      console.error('PWA: Share failed:', error);
      throw error;
    }
  }, [capabilities.share]);

  const updateApp = useCallback(() => {
    if (serviceWorkerRegistration?.waiting) {
      serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [serviceWorkerRegistration]);

  const clearCache = useCallback(async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      console.log('PWA: Cache cleared');
    }
  }, []);

  return {
    // State
    ...pwaState,
    capabilities,
    serviceWorkerRegistration,

    // Actions
    installApp,
    requestNotificationPermission,
    subscribeToPush,
    scheduleBackgroundSync,
    schedulePeriodicSync,
    shareContent,
    updateApp,
    clearCache,

    // Utilities
    isSupported: typeof window !== 'undefined' && 'serviceWorker' in navigator,
  };
}

// Hook for managing app updates
export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
        }
      });

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    if (!updateAvailable) return;

    setIsUpdating(true);
    
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }

    // Reload after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }, [updateAvailable]);

  return {
    updateAvailable,
    isUpdating,
    applyUpdate,
  };
}

// Hook for offline status with enhanced features
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setWasOffline(isOffline);
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOffline]);

  const isBackOnline = !isOffline && wasOffline;

  return {
    isOffline,
    isOnline: !isOffline,
    isBackOnline,
  };
}