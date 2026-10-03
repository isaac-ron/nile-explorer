# Newsletter templates

Three emails, one for each kind of message the newsroom sends. They follow
[DESIGN.md](../../DESIGN.md): navy chrome with the reversed lockup, gold
structural rules, Spectral headings over Libre Franklin labels, and a paper
reading surface.

| File | When to send it | What changes each time |
|---|---|---|
| `edition.html` | A round-up, whenever enough new work has built up | Date, opening line, lead story, the two paired sections, "Also published", podcast block |
| `story.html` | One new piece worth an email on its own | Headline, standfirst, image, opening paragraphs, the related piece |
| `welcome.html` | Automatically, once, when someone subscribes | The three "Start here" pieces, now and then |

## Editorial rules the templates follow

- **No promised schedule.** The sign-up form promises none, so the emails
  don't either. Date each edition; don't number or name it as weekly.
- **Pairs, where the work pairs.** When two writers take on the same event,
  the edition groups them under a short heading with one factual line of
  context. When nothing pairs, cut the section; don't force it.
- **Never invent.** The festival block says its dates are not set. Change that
  text only when the dates are announced.
- **Quotes are exact.** Excerpts in `story.html` are copied word for word from
  the article. Cut whole paragraphs, never sentences from the middle.

## Images

Images are served from `public/email/`, which goes live at
`https://www.nileexplorer.com/email/` when the site deploys. They are built at
twice their display size by:

    node design/tools/make-email-assets.js

To feature a new story, add a line to `JOBS` in that script (lead images
1200x720, paired images 528x330, thumbnails 240x180), run it, commit the
output and deploy **before** sending: an email can't load images that aren't
on the live site yet.

## Sending through EmailOctopus

Sign-ups from the site land in the EmailOctopus list named **Audience** (see
src/lib/newsletter.ts). The templates already use EmailOctopus's merge tags:
`{{UnsubscribeURL}}`, `{{WebVersionURL}}`, `{{SenderInfo}}` and
`{{RewardsURL}}`. Tags are case-sensitive; don't retype them.

- **An edition or a story:** Campaigns → Create → choose the custom HTML
  option, paste the whole file, set the subject and preview text (the
  preheader line at the top of each file), send a test to yourself, then send.
- **The welcome email:** Automations → create one that starts when a contact
  joins the list, with a single email using `welcome.html`. It then goes to
  every new subscriber without anyone sending it.

Before the first send:

1. **Fill in the sender's postal address** in EmailOctopus's account
   settings. `{{SenderInfo}}` prints it, and anti-spam law and
   EmailOctopus both require it.
2. **Verify the sending address**, ideally one on nileexplorer.com, and
   authenticate the domain (SPF and DKIM) in EmailOctopus so the emails don't
   land in spam.
3. **"Sent with EmailOctopus"** in each footer is the `{{RewardsURL}}` link
   the free plan requires. Delete that line on a paid plan.
4. **Send a test to Gmail, Outlook and an iPhone.** The templates use tables
   and inline styles so they hold up in Outlook, and fall back to Georgia and
   Arial where a client won't load Spectral and Libre Franklin.
