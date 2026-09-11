/**
 * Newsletter sign-up.
 *
 * A plain form that posts straight to the email provider — EmailOctopus,
 * Buttondown, whoever is configured in Site settings. No JavaScript, no
 * backend, and no subscriber data passing through this site, which is both
 * simpler to keep running and one fewer thing to hold personal data.
 *
 * The previous version had no provider at all: it swallowed the address,
 * reset the form and said "Thanks. You can unsubscribe from any issue." That
 * told every reader who signed up something untrue. If no provider is
 * configured the section now renders nothing, which is the honest state — a
 * missing form asks nobody for anything.
 */
export default function Newsletter({ action }: { action?: string }) {
  if (!action) return null;

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
        <form className="signup__form" action={action} method="post" target="_blank">
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
            Subscribe
          </button>
          {/* No frequency claim: publishing is irregular, so promising a
              cadence would be a promise the newsroom cannot keep. */}
          <p className="signup__note">Unsubscribe from any issue.</p>
        </form>
      </div>
    </section>
  );
}
