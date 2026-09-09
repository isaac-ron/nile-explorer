import Link from 'next/link';

/**
 * What a strand shows before it has anything in it.
 *
 * Several sections now exist ahead of their content: the editorial strands
 * behind More have no articles, and Documentaries will be empty once the
 * placeholder uploads come down. An empty list reads as a bug, and inventing
 * filler reads as a lie, so each one says what it is and points somewhere that
 * does have something.
 */
export default function Empty({
  title,
  body,
  action
}: {
  title: string;
  body: string;
  action?: { href: string; label: string; external?: boolean };
}) {
  return (
    <div className="empty">
      <p className="empty__title">{title}</p>
      <p className="empty__body">{body}</p>
      {action &&
        (action.external ? (
          <a
            className="empty__action"
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {action.label} →
          </a>
        ) : (
          <Link className="empty__action" href={action.href}>
            {action.label} →
          </Link>
        ))}
    </div>
  );
}
