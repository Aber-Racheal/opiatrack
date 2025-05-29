export interface Income {
  id?: number;               // Auto-incremented in IndexedDB
  amount: number;            // The income amount
  source: string;            // Source of income (e.g., salary, freelance, etc.)
  date_received: string;     // The date the income was received (ISO string)
  is_synced?: boolean;       // Flag to check if it has been synced with the backend
}
