import { env } from "../config/env";
import { getAccessToken } from "./authStorage";

type ApiErrorBody = {
  error?: {
    message?: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  fallbackErrorMessage?: string;
};

const NETWORK_ERROR_MESSAGE =
  "Unable to reach the server. Check your connection and try again.";

export async function apiRequest<TResponse>(
  path: string,
  {
    method = "GET",
    body,
    signal,
    fallbackErrorMessage = "Something went wrong. Please try again.",
  }: RequestOptions = {},
): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers: buildHeaders(body),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
  }

  const payload = await parseJsonBody(response);

  if (!response.ok) {
    const { error } = (payload ?? {}) as ApiErrorBody;
    throw new ApiError(
      error?.message ?? fallbackErrorMessage,
      response.status,
      error?.details,
    );
  }

  return payload as TResponse;
}

// Every request from this client targets our own API, so the access token can
// be attached whenever one is stored without leaking it to a third party.
function buildHeaders(body: unknown): HeadersInit {
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

async function parseJsonBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  return response.json().catch(() => null);
}
