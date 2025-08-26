'use client';

import { useState, useEffect, useCallback } from 'react';

interface OfflineAction {
  id: string;
  type: 'wine' | 'battle' | 'trade' | 'guild';
  action: string;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

interface UseOfflineReturn {
  isOnline: boolean;
  isOfflineMode: boolean;
  pendingActions: OfflineAction[];
  queueOfflineAction: (type: string, action: string, data: Record<string, unknown>) => string;
  retryPendingActions: () => Promise<void>;
  clearPendingActions: () => void;
  toggleOfflineMode: () => void;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
}

export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Initialize online/offline detection
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Set initial state
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Load pending actions from localStorage
    loadPendingActions();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      retryPendingActions();
    }
  }, [isOnline]);

  // Service Worker message listener
  useEffect(() => {
    const handleSWMessage = (event: MessageEvent) => {
      const { type, data } = event.data;

      switch (type) {
        case 'WINE_SYNCED':
        case 'BATTLE_ACTION_SYNCED':
        case 'TRADE_ACTION_SYNCED':
        case 'GUILD_ACTION_SYNCED':
          if (data.success) {
            removePendingAction(data.id);
          }
          break;
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      };
    }
  }, []);

  const loadPendingActions = useCallback(() => {
    try {
      const stored = localStorage.getItem('wine-pokedx-offline-actions');
      if (stored) {
        const actions = JSON.parse(stored);
        setPendingActions(actions);
      }
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  }, []);

  const savePendingActions = useCallback((actions: OfflineAction[]) => {
    try {
      localStorage.setItem('wine-pokedx-offline-actions', JSON.stringify(actions));
    } catch (error) {
      console.error('Failed to save pending actions:', error);
    }
  }, []);

  const queueOfflineAction = useCallback((type: string, action: string, data: Record<string, unknown>): string => {
    const offlineAction: OfflineAction = {
      id: `${type}-${action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as 'wine' | 'battle' | 'trade' | 'guild',
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const newActions = [...pendingActions, offlineAction];
    setPendingActions(newActions);
    savePendingActions(newActions);

    // Store in IndexedDB for service worker access
    storeInIndexedDB(offlineAction);

    // Trigger background sync if available
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        const syncTag = getSyncTag(type);
        if (syncTag) {
          registration.sync.register(syncTag).catch(error => {
            console.warn('Background sync registration failed:', error);
          });
        }
      });
    }

    return offlineAction.id;
  }, [pendingActions, savePendingActions]);

  const retryPendingActions = useCallback(async () => {
    if (!isOnline || pendingActions.length === 0) return;

    setSyncStatus('syncing');

    const results = await Promise.allSettled(
      pendingActions.map(async (action) => {
        try {
          const result = await executeOfflineAction(action);
          if (result.success) {
            removePendingAction(action.id);
            return { success: true, actionId: action.id };
          } else {
            // Increment retry count
            updateRetryCount(action.id);
            return { success: false, actionId: action.id, error: result.error };
          }
        } catch (error) {
          updateRetryCount(action.id);
          return { success: false, actionId: action.id, error };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || !r.value.success).length;

    setSyncStatus(failed === 0 ? 'success' : 'error');

    // Reset status after delay
    setTimeout(() => setSyncStatus('idle'), 3000);

    console.log(`Sync completed: ${successful} successful, ${failed} failed`);
  }, [isOnline, pendingActions]);

  const clearPendingActions = useCallback(() => {
    setPendingActions([]);
    savePendingActions([]);
    localStorage.removeItem('wine-pokedx-offline-actions');
  }, [savePendingActions]);

  const toggleOfflineMode = useCallback(() => {
    setIsOfflineMode(prev => !prev);
  }, []);

  const removePendingAction = useCallback((actionId: string) => {
    setPendingActions(prev => {
      const updated = prev.filter(action => action.id !== actionId);
      savePendingActions(updated);
      return updated;
    });
  }, [savePendingActions]);

  const updateRetryCount = useCallback((actionId: string) => {
    setPendingActions(prev => {
      const updated = prev.map(action => 
        action.id === actionId 
          ? { ...action, retryCount: action.retryCount + 1 }
          : action
      );
      savePendingActions(updated);
      return updated;
    });
  }, [savePendingActions]);

  return {
    isOnline,
    isOfflineMode,
    pendingActions,
    queueOfflineAction,
    retryPendingActions,
    clearPendingActions,
    toggleOfflineMode,
    syncStatus,
  };
}

// Helper functions
async function executeOfflineAction(action: OfflineAction): Promise<{ success: boolean; error?: string }> {
  try {
    const { type, action: actionType, data } = action;
    
    let url = '';
    let method = 'POST';
    let body = data;

    switch (type) {
      case 'wine':
        url = data.id ? `/api/wines/${data.id}` : '/api/wines';
        method = data.id ? 'PUT' : 'POST';
        break;
        
      case 'battle':
        url = data.battleId ? `/api/battles/${data.battleId}` : '/api/battles';
        method = 'POST';
        break;
        
      case 'trade':
        url = data.tradeId ? `/api/trades/${data.tradeId}` : '/api/trades';
        method = data.tradeId ? 'PUT' : 'POST';
        body = { action: actionType, ...data };
        break;
        
      case 'guild':
        url = data.guildId ? `/api/guilds/${data.guildId}` : '/api/guilds';
        method = 'POST';
        body = { action: actionType, ...data };
        break;
        
      default:
        throw new Error(`Unknown action type: ${type}`);
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || `HTTP ${response.status}` };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function getSyncTag(type: string): string | null {
  switch (type) {
    case 'wine': return 'wine-sync';
    case 'battle': return 'battle-sync';
    case 'trade': return 'trade-sync';
    case 'guild': return 'guild-sync';
    default: return null;
  }
}

// IndexedDB operations for service worker access
async function storeInIndexedDB(action: OfflineAction): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('wine-pokedx-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([`offline_${action.type}s`], 'readwrite');
      const store = transaction.objectStore(`offline_${action.type}s`);
      
      const storeRequest = store.add({
        ...action,
        [`${action.type}Id`]: action.data.id,
      });
      
      storeRequest.onsuccess = () => resolve();
      storeRequest.onerror = () => reject(storeRequest.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      ['wines', 'battles', 'trades', 'guilds'].forEach(type => {
        if (!db.objectStoreNames.contains(`offline_${type}`)) {
          const store = db.createObjectStore(`offline_${type}`, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
        }
      });
    };
  });
}