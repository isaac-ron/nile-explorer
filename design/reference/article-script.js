class Component extends DCLogic {
  renderVals() {
    const v = this.renderValsBase();
    v.more = v.more.map(o => Object.assign({}, o, { photo: this.photos[o.slot] }));
    return v;
  }

__PHOTOS__

  renderValsBase() {
    const home = "The Nile Explorer.html";
    const url = "https://nileexplorer.org/governance/the-first-vote-in-over-a-decade";
    const headline = "The first vote in over a decade";
    return {
      nav: [
        { label: "Podcasts", href: home + "#podcasts" },
        { label: "News", href: home + "#news" },
        { label: "TV", href: home + "#tv" },
        { label: "Festival", href: home + "#festival" }
      ],
      share: [
        {
          label: "Share this article on X",
          href: "https://x.com/intent/post?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(headline),
          path: "M4.5 4.5l15 15M19.5 4.5l-15 15"
        },
        {
          label: "Share this article on WhatsApp",
          href: "https://wa.me/?text=" + encodeURIComponent(headline + " " + url),
          path: "M20.5 12a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.1-4.4A8.5 8.5 0 1 1 20.5 12z"
        },
        {
          label: "Share this article by email",
          href: "mailto:?subject=" + encodeURIComponent(headline) + "&body=" + encodeURIComponent(url),
          path: "M3.5 6.5h17v11h-17zM3.5 6.5l8.5 6.5 8.5-6.5"
        }
      ],
      related: [
        { cat: "Explainer", title: "What is on the ballot in December" },
        { cat: "Report", title: "Inside the registration drive" },
        { cat: "Analysis", title: "Who pays for the peace architecture" }
      ],
      more: [
        {
          slot: "art-more-1",
          cat: "Economy",
          title: "Oil transit talks resume as the region recalculates leverage",
          meta: "6 hours ago",
          alt: "Pipeline infrastructure at an oil transit terminal north of the capital."
        },
        {
          slot: "art-more-2",
          cat: "Culture",
          title: "What a week on the river returns to the city",
          meta: "Yesterday",
          alt: "Musicians performing on the riverbank during the festival week."
        },
        {
          slot: "art-more-3",
          cat: "Sport",
          title: "Festival football expands to twelve states",
          meta: "2 days ago",
          alt: "Players contest a header during a festival football fixture."
        }
      ]
    };
  }
}
