/**
 * Cloudflare Worker: serves /api/* (e.g. feedback → GitHub issue) and passes
 * all other requests to static assets (SPA). Only invoked when no asset matches.
 */

export interface Env {
  ASSETS: Fetcher;
  GITHUB_TOKEN: string;
  GITHUB_REPO: string; // "owner/repo"
}

const GITHUB_API = 'https://api.github.com';

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, url, env);
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleApi(request: Request, url: URL, env: Env): Promise<Response> {
  if (url.pathname === '/api/feedback' && request.method === 'POST') {
    return createFeedbackIssue(request, env);
  }
  return jsonResponse({ error: 'Not found' }, 404);
}

async function createFeedbackIssue(request: Request, env: Env): Promise<Response> {
  const missing: string[] = [];
  if (!env.GITHUB_TOKEN?.trim()) missing.push('GITHUB_TOKEN');
  if (!env.GITHUB_REPO?.trim()) missing.push('GITHUB_REPO');
  if (missing.length > 0) {
    return jsonResponse(
      { error: 'Feedback not configured', missing },
      503
    );
  }
  let body: { type?: string; title?: string; description?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }
  const type = (body.type === 'enhancement' ? 'enhancement' : 'bug') as 'bug' | 'enhancement';
  const title = String(body.title ?? '').trim().slice(0, 256) || (type === 'bug' ? 'Bug report' : 'Enhancement request');
  const description = String(body.description ?? '').trim().slice(0, 4096);
  const labels = type === 'enhancement' ? ['enhancement'] : ['bug'];
  const issueBody = [
    description && `## Description\n\n${description}`,
    '---',
    '*Submitted via Debtinator Web feedback form*',
  ]
    .filter(Boolean)
    .join('\n\n');

  const res = await fetch(`${GITHUB_API}/repos/${env.GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, body: issueBody || '_No description provided._', labels }),
  });

  if (!res.ok) {
    const err = await res.text();
    return jsonResponse({ error: 'Failed to create issue', details: err }, res.status);
  }
  const data = (await res.json()) as { html_url?: string };
  return jsonResponse({ url: data.html_url }, 201);
}

function jsonResponse(data: object, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
