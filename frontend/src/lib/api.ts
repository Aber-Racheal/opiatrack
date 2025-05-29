// lib/api.ts

export async function apiRequest<T = unknown>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: Record<string, unknown>,
  token?: string
): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: T;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Non-JSON response: ${res.statusText}`);
  }

  if (!res.ok) {
    // Handle error object cleanly
    const errorMessage = (data as { error?: string })?.error || 'Request failed';
    throw new Error(errorMessage);
  }

  return data;
}
