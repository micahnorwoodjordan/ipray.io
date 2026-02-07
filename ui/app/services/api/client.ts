const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;

type ApiOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
};

export async function sendApiRequest<T>(path: string, options: ApiOptions = {} ): Promise<T> {
console.log(EXPO_PUBLIC_API_URL);
  const res = await fetch(`${EXPO_PUBLIC_API_URL}/${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}
