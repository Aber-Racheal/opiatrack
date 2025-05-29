export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface IncomeFormData {
  amount: number;
  date: string;
  source?: string;
  other_source?: string;
  plan?: string;
  other_plan?: string;
  description?: string;
  synced?: boolean;
}