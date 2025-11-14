import { API_URL } from "../constants/api";
import { getErrorMessage } from "./errors";
import { getHeaders } from "./get-headers";
import { objectToUrlSearchParams } from "./object-to-url-search-params";

type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

function isServer() {
  return typeof window === "undefined";
}

async function refreshToken() {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  return res.ok;
}

export const request = async ({
  method,
  path,
  data,
}: {
  method: HttpMethod;
  path: string;
  data?: FormData | object;
}) => {
  const body = data instanceof FormData ? Object.fromEntries(data) : data;

  const headers = await getHeaders();

  const res = await fetch(`${API_URL}/${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  console.log({ res });

  const parsedRes = await res.json();
  if (!res.ok) {
    return { error: getErrorMessage(parsedRes) };
  }
  console.log({ parsedRes });

  return {
    error: null,
    data: parsedRes,
    rawRes: res,
  };
};

export const get = async <T>({
  path,
  params,
  tags,
}: {
  path: string;
  tags?: string[];
  params?: Record<string, any>;
}) => {
  const searchParams = objectToUrlSearchParams(params || {});

  const url = params
    ? `${API_URL}/${path}?${searchParams}`
    : `${API_URL}/${path}`;

  const headers = await getHeaders();

  let res = await fetch(url, {
    credentials: "include",
    headers: { ...headers },
    next: { tags },
  });

  if (res.status === 401 && path !== "auth/refresh" && !isServer()) {
    const ok = await refreshToken();
    if (ok) {
      res = await fetch(url, {
        credentials: "include",
        next: { tags },
      });
    }
  }

  return res.json() as T;
};
