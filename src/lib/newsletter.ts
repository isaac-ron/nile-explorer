'use server';

import { headers } from 'next/headers';

/**
 * Newsletter sign-up, through EmailOctopus.
 *
 * The address goes from the form to EmailOctopus's API and nowhere else: the
 * site does not store it, log it or set a cookie. The API key stays on the
 * server, which is why this is a Server Action rather than a form posting
 * straight to the provider. It also means the form works with JavaScript off:
 * the browser posts, the page re-renders with the result.
 *
 * Needs EMAIL_OCTOPUS_API_KEY and EMAIL_OCTOPUS_LIST_ID. Without both, the
 * newsletter section and the masthead's Subscribe button do not render — a
 * form that goes nowhere collects addresses it then throws away.
 */

const API = 'https://api.emailoctopus.com';

export type SignupState =
  | { status: 'idle' }
  | { status: 'done' }
  | { status: 'invalid'; message: string }
  | { status: 'error'; message: string };

/** Whether sign-up is wired up. Server-only: read by the components that decide to render. */
export async function newsletterReady(): Promise<boolean> {
  return Boolean(process.env.EMAIL_OCTOPUS_API_KEY && process.env.EMAIL_OCTOPUS_LIST_ID);
}

/**
 * A light brake on one address submitting over and over. Per server instance
 * and forgotten on a cold start, the same size as the readership counter's:
 * it stops accidents and casual abuse, not anyone determined.
 */
const recent = new Map<string, number[]>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  hits.push(now);
  if (recent.size > 5000) recent.clear();
  recent.set(ip, hits);
  return hits.length > 5;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FAILED: SignupState = {
  status: 'error',
  message: 'We couldn’t sign you up just now. Please try again in a few minutes.'
};

export async function subscribe(_prev: SignupState, form: FormData): Promise<SignupState> {
  const key = process.env.EMAIL_OCTOPUS_API_KEY;
  const list = process.env.EMAIL_OCTOPUS_LIST_ID;
  if (!key || !list) return FAILED;

  // The honeypot: a field people never see. Bots that fill every input get a
  // success message and nothing is sent.
  if (String(form.get('website') ?? '') !== '') return { status: 'done' };

  const email = String(form.get('email') ?? '').trim();
  if (!EMAIL.test(email) || email.length > 254) {
    return { status: 'invalid', message: 'That doesn’t look like an email address. Please check it.' };
  }

  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (tooMany(ip)) return FAILED;

  let res: Response;
  try {
    res = await fetch(`${API}/lists/${list}/contacts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_address: email, status: 'subscribed' }),
      cache: 'no-store'
    });
  } catch (err) {
    console.error('Newsletter sign-up failed to reach EmailOctopus:', err);
    return FAILED;
  }

  // 409 means the address is already on the list. Say the same thing as a new
  // sign-up, so the form cannot be used to find out who subscribes.
  if (res.ok || res.status === 409) return { status: 'done' };

  if (res.status === 422) {
    return { status: 'invalid', message: 'That doesn’t look like an email address. Please check it.' };
  }

  // Anything else is ours to fix (a revoked key, a deleted list), so log it
  // where Vercel will show it, without the reader's address.
  console.error(`Newsletter sign-up rejected by EmailOctopus: HTTP ${res.status}`, await res.text().catch(() => ''));
  return FAILED;
}
