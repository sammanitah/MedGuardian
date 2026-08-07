/**
 * Typed API client for Med Guardian backend.
 * All fetch calls go through these helpers for consistent error handling.
 */
import type { AgentInfo, AnalysisReport } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

/** Upload a file and analyse it with the given domain agent. */
export async function analyzeDocument(
  file: File,
  domain: string = 'medical',
): Promise<AnalysisReport> {
  const form = new FormData();
  form.append('file', file);
  form.append('domain', domain);

  const res = await fetch(`${API_BASE}/api/v1/analyze`, {
    method: 'POST',
    body: form,
  });

  return handleResponse<AnalysisReport>(res);
}

/** Fetch all registered domain agents. */
export async function listAgents(): Promise<AgentInfo[]> {
  const res = await fetch(`${API_BASE}/api/v1/agents`);
  return handleResponse<AgentInfo[]>(res);
}

export { ApiError };
