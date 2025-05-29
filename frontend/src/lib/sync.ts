import { getAllFromStore, deleteFromStore, STORE_NAMES } from './idb';
import { apiRequest } from './api';
import { SyncableRecord } from '@/types/idb';

export const syncData = async () => {
  const syncEntity = async (storeName: string, endpoint: string) => {
    const records = await getAllFromStore<SyncableRecord>(storeName);

    for (const record of records) {
      if (!record.is_synced) {
        try {
          const response = await apiRequest(endpoint, 'POST', record);
          if (response) {
            await deleteFromStore(storeName, record.id);
            console.log(`${storeName} item synced and deleted`);
          }
        } catch (err) {
          console.warn(`Failed to sync ${storeName} item`, err);
        }
      }
    }
  };

  await syncEntity(STORE_NAMES.INCOME, '/incomes/');
  await syncEntity(STORE_NAMES.GOAL, '/goals/');
  await syncEntity(STORE_NAMES.ALLOCATION, '/allocations/');
  await syncEntity(STORE_NAMES.EXPENSE, '/expenses/');
  await syncEntity(STORE_NAMES.EXPENSE_ITEM, '/expense-items/');
};
