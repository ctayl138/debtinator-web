/**
 * Submit bug report or enhancement request to the app's Worker API,
 * which creates a GitHub issue. Same-origin: call from the deployed app.
 */

export type FeedbackType = 'bug' | 'enhancement';

export interface FeedbackPayload {
  type: FeedbackType;
  title: string;
  description: string;
}

export interface FeedbackSuccess {
  url: string;
}

export interface FeedbackError {
  error: string;
  details?: string;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<FeedbackSuccess> {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as FeedbackSuccess | FeedbackError;
  if (!res.ok) {
    const err = 'error' in data ? data.error : 'Request failed';
    const details = 'details' in data ? data.details : undefined;
    throw new Error(details ? `${err}: ${details}` : err);
  }
  if (!('url' in data) || !data.url) {
    throw new Error('Invalid response from server');
  }
  return { url: data.url };
}
