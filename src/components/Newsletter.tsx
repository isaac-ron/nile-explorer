import SignupForm from '@/components/SignupForm';
import { newsletterReady } from '@/lib/newsletter';

/**
 * Newsletter sign-up, through EmailOctopus. See lib/newsletter.ts.
 *
 * The first version had no provider at all: it swallowed the address, reset
 * the form and said "Thanks. You can unsubscribe from any issue." That told
 * every reader who signed up something untrue. If the provider is not
 * configured the section still renders nothing, which is the honest state — a
 * missing form asks nobody for anything.
 */
export default async function Newsletter() {
  if (!(await newsletterReady())) return null;

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
        <SignupForm />
      </div>
    </section>
  );
}
