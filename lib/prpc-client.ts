type JsonRpcResponse<T> = {
  jsonrpc: "2.0";
  result?: T;
  error?: {
    code: number;
    message: string;
  };
  id: number;
};

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

const prpcEndpoint =
  process.env.PRPC_ENDPOINT || process.env.NEXT_PUBLIC_PRPC_ENDPOINT || "";

export async function callPrpc<T>(
  method: string,
  params?: Record<string, unknown>
): Promise<T | null> {
  if (!prpcEndpoint) {
    return null;
  }

  const payload = {
    jsonrpc: "2.0" as const,
    method,
    params,
    id: Date.now(),
  };

  try {
    const response = await fetch(prpcEndpoint, {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const json = (await response.json()) as JsonRpcResponse<T>;
    if (json.error) {
      console.warn("pRPC error", json.error);
      return null;
    }

    return json.result ?? null;
  } catch (error) {
    console.warn("pRPC call failed", error);
    return null;
  }
}
