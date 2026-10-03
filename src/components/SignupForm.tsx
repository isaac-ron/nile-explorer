'use client';

import { useActionState } from 'react';
import { subscribe, type SignupState } from '@/lib/newsletter';

/**
 * The sign-up form's interactive half. The surrounding section is a Server
 * Component (Newsletter.tsx); this only needs the browser to show the result
 * in place, and works without JavaScript too: the page re-renders with it.
 */
export default function SignupForm() {
  const [state, action, pending] = useActionState<SignupState, FormData>(subscribe, {
    status: 'idle'
  });

  if (state.status === 'done') {
    return (
      <p className="signup__done" role="status">
        You’re subscribed. New articles and podcast episodes will come to your inbox.
      </p>
    );
  }

  const problem = state.status === 'invalid' || state.status === 'error' ? state.message : null;

  return (
    <form className="signup__form" action={action}>
      <label className="vh" htmlFor="signup-email">
        Your email address
      </label>
      <input
        className="signup__input"
        id="signup-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.org"
        aria-invalid={state.status === 'invalid' || undefined}
        aria-describedby={problem ? 'signup-problem' : undefined}
      />
      {/* Honeypot. Hidden from people and from assistive technology; bots
          that fill every field reveal themselves. */}
      <div className="vh" aria-hidden="true">
        <label htmlFor="signup-website">Leave this empty</label>
        <input id="signup-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="btn btn--gold" type="submit" disabled={pending}>
        {pending ? 'Subscribing…' : 'Subscribe'}
      </button>
      {problem ? (
        <p className="signup__problem" id="signup-problem" role="alert">
          {problem}
        </p>
      ) : (
        /* No frequency claim: publishing is irregular, so promising a
           cadence would be a promise the newsroom cannot keep. */
        <p className="signup__note">Unsubscribe from any issue.</p>
      )}
    </form>
  );
}
