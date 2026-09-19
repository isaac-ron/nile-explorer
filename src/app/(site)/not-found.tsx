import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section shell" style={{ minHeight: '48vh' }}>
      <p className="label label--muted">Error 404</p>
      <h1 style={{ fontSize: 'var(--fs-hero)', color: 'var(--navy)', marginTop: 8 }}>
        That page is not here
      </h1>
      <p style={{ marginTop: 12, color: 'var(--ink-blurb)', maxWidth: '52ch' }}>
        The link may be out of date, or the piece may have moved during the move from the old site.
      </p>
      <p style={{ marginTop: 20 }}>
        <Link className="btn" href="/articles">
          Browse all articles
        </Link>
      </p>
    </section>
  );
}
