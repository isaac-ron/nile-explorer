'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [done, setDone] = useState(false);

  return (
    <section className="section section--band signup" id="newsletter" aria-labelledby="signup-heading">
      <div className="signup__grid shell">
        <div>
          <h2 id="signup-heading">The morning brief from Juba, Nairobi and London</h2>
        </div>
        <form
          className="signup__form"
          onSubmit={(e) => {
            e.preventDefault();
            // No provider wired yet; the CMS phase adds the subscriber store.
            (e.currentTarget as HTMLFormElement).reset();
            setDone(true);
          }}
        >
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
          />
          <button className="btn" type="submit">
            {done ? 'Subscribed' : 'Sign up'}
          </button>
          <p className="signup__note" aria-live="polite">
            {done
              ? 'Thanks. The morning brief arrives on weekdays; unsubscribe from any issue.'
              : 'One email each weekday. Unsubscribe from any issue.'}
          </p>
        </form>
      </div>
    </section>
  );
}
