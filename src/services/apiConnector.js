import axios from "axios";

import { getClerkToken } from "./clerkBridge";

// Requests time out so a stalled server cannot leave the page spinning forever
export const axiosInstance = axios.create({ timeout: 20000 });

// Every request carries a fresh Clerk session token. Any Authorization header the caller passed
// (for example a stale token from redux) is replaced, so the session is always current.
export const apiConnector = async (method, url, bodyData, headers, params) => {
  const requestHeaders = { ...(headers || {}) };
  const clerkToken = await getClerkToken();
  if (clerkToken) {
    requestHeaders.Authorization = `Bearer ${clerkToken}`;
  }

  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: requestHeaders,
    params: params ? params : null,
  });
};
