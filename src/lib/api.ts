import { supabase } from "./supabase";

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error(
      "Authentication required. Please sign in again."
    );
  }

  const headers = new Headers(init.headers || {});

  headers.set(
    "Authorization",
    `Bearer ${session.access_token}`
  );

  return fetch(input, {
    ...init,
    headers,
  });
}
