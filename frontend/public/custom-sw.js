/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

// ✅ Precache all files + offline.html
precacheAndRoute(
  self.__WB_MANIFEST.concat([
    { url: '/offline.html', revision: null },
  ])
);

// ✅ Cache navigation requests (HTML pages)
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
  })
);

// ✅ Runtime caching for API routes
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
  })
);

// ✅ Show offline.html if a navigation fails
setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error();
});

// ✅ IndexedDB setup
const DB_NAME = 'OpiaTrackDB';
const DB_VERSION = 2;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromStore(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteFromStore(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getAuthToken() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('auth', 'readonly');
    const store = tx.objectStore('auth');
    const request = store.get('user-token');
    request.onsuccess = () => {
      if (request.result && request.result.token) {
        resolve(request.result.token);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

// ✅ Background sync function
async function syncData() {
  const stores = ['income', 'goals', 'allocations', 'expenses', 'expenseItems'];
  const endpointMap = {
    income: '/api/incomes/',
    goals: '/api/goals/',
    allocations: '/api/allocations/',
    expenses: '/api/expenses/',
    expenseItems: '/api/expense-items/',
  };

  const token = await getAuthToken();
  if (!token) {
    console.warn('[Service Worker] No auth token found. Skipping sync.');
    return;
  }

  for (const store of stores) {
    const records = await getAllFromStore(store);
    for (const record of records) {
      if (!record.is_synced) {
        try {
          const response = await fetch(endpointMap[store], {
            method: 'POST',
            body: JSON.stringify(record),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${token}`,
            },
          });

          if (response.ok) {
            await deleteFromStore(store, record.id);
          } else {
            console.warn(`[Service Worker] Failed to sync ${store} record:`, record);
          }
        } catch (error) {
          console.error(`[Service Worker] Error syncing ${store}:`, error);
        }
      }
    }
  }
}

// ✅ Listen for sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-incomes-goals') {
    event.waitUntil(syncData());
  }
});
