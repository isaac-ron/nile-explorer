'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [done, setDone] = useState(false);

  return (
    <section
      className="section section--band signup on-navy"
      id="newsletter"
      aria-labelledby="signup-heading"
    >
      <div className="signup__grid shell">
        <div>
          <h2 id="signup-heading">Newsletter</h2>
          <p className="signup__blurb">New articles and podcast episodes, by email.</p>
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
          <button className="btn btn--gold" type="submit">
            {done ? 'Subscribed' : 'Subscribe'}
          </button>
          {/* No frequency claim: publishing is irregular and there is no
              provider behind this yet, so promising a cadence would be a
              promise the newsroom cannot keep. */}
          <p className="signup__note" aria-live="polite">
            {done
              ? 'Thanks. You can unsubscribe from any issue.'
              : 'Unsubscribe from any issue.'}
          </p>
        </form>
      </div>
    </section>
  );
}
