import { openDB, IDBPDatabase } from 'idb';
import { AuthToken} from '@/types/idb';

const DB_NAME = 'OpiaTrackDB';
const DB_VERSION = 2;

const STORE_NAMES = {
  INCOME: 'income',
  GOAL: 'goals',
  ALLOCATION: 'allocations',
  EXPENSE: 'expenses',
  EXPENSE_ITEM: 'expenseItems',
  AUTH: 'auth',
};


let dbPromise: Promise<IDBPDatabase<unknown>>;

const initDB = async () => {
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAMES.INCOME))
        db.createObjectStore(STORE_NAMES.INCOME, { keyPath: 'id', autoIncrement: true });

      if (!db.objectStoreNames.contains(STORE_NAMES.GOAL))
        db.createObjectStore(STORE_NAMES.GOAL, { keyPath: 'id', autoIncrement: true });

      if (!db.objectStoreNames.contains(STORE_NAMES.ALLOCATION))
        db.createObjectStore(STORE_NAMES.ALLOCATION, { keyPath: 'id', autoIncrement: true });

      if (!db.objectStoreNames.contains(STORE_NAMES.EXPENSE))
        db.createObjectStore(STORE_NAMES.EXPENSE, { keyPath: 'id', autoIncrement: true });

      if (!db.objectStoreNames.contains(STORE_NAMES.EXPENSE_ITEM))
        db.createObjectStore(STORE_NAMES.EXPENSE_ITEM, { keyPath: 'id', autoIncrement: true });

      if (!db.objectStoreNames.contains(STORE_NAMES.AUTH))
        db.createObjectStore(STORE_NAMES.AUTH, { keyPath: 'id' });
    },
  });
};

const addToStore = async <T>(storeName: string, data: T): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.put(data);
  await tx.done;
};

const getAllFromStore = async <T>(storeName: string): Promise<T[]> => {
  const db = await dbPromise;
  return db.transaction(storeName).objectStore(storeName).getAll();
};

const getFromStore = async <T>(storeName: string, key: string | number): Promise<T | undefined> => {
  const db = await dbPromise;
  const tx = db.transaction(storeName, 'readonly');
  return tx.objectStore(storeName).get(key);
};

const deleteFromStore = async (storeName: string, key: string | number) => {
  const db = await dbPromise;
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).delete(key);
  await tx.done;
};

// Auth token helpers
const AUTH_STORE = STORE_NAMES.AUTH;

const saveAuthToken = async (token: string) => {
  await addToStore<AuthToken>(AUTH_STORE, {
    id: 'user-token',
    token,
  });
};

const getAuthToken = async (): Promise<string | null> => {
  const result = await getFromStore<AuthToken>(AUTH_STORE, 'user-token');
  return result?.token ?? null;
};

const clearAuthToken = async () => {
  await deleteFromStore(AUTH_STORE, 'user-token');
};

export {
  initDB,
  addToStore,
  getAllFromStore,
  getFromStore,
  deleteFromStore,
  saveAuthToken,
  getAuthToken,
  clearAuthToken,
  STORE_NAMES,
};
