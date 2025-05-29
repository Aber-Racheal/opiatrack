export interface SyncableRecord {
  id: string | number;
  is_synced?: boolean;
}

// You can extend this later for specific record types:
export interface IncomeRecord extends SyncableRecord {
  amount: number;
  source: string;
  // Add other fields if needed
}

export interface GoalRecord extends SyncableRecord {
  title: string;
  targetAmount: number;
}

export interface AuthToken {
  id: string; // should be "user-token"
  token: string;
}


export interface SyncableRecord extends Record<string, unknown> {
  id: string | number;
  is_synced?: boolean;
}
