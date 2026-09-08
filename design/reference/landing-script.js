class Component extends DCLogic {
  state = { tab: "All", subbed: false, playing: false, t: 0, featured: false };

  componentWillUnmount() { clearInterval(this.timer); }

  togglePlay = () => {
    const playing = !this.state.playing;
    clearInterval(this.timer);
    if (playing) this.timer = setInterval(() => this.setState(s => ({ t: (s.t + 1) % 3130 })), 1000);
    this.setState({ playing });
  };

  stories() {
    return [
      { tab: "News", slot: "v2-st-1", cat: "Peace & security", title: "Displacement from Sudan reaches the borderlands", blurb: "Host communities are absorbing arrivals faster than the transfers reaching them.", meta: "4 hours ago · Report", alt: "Families arriving at a reception point in the borderlands." },
      { tab: "News", slot: "v2-st-2", cat: "Economy", title: "Oil transit talks resume as the region recalculates leverage", blurb: "Pipeline politics, and what a renegotiated fee would fund.", meta: "6 hours ago · Report", alt: "Pipeline infrastructure at an oil transit terminal." },
      { tab: "Opinion", slot: "v2-st-3", cat: "Opinion", title: "Elections are not the same thing as legitimacy", blurb: "A vote settles who governs, not whether the institutions holding the result are trusted.", meta: "Columnist name", alt: "An empty polling station before opening." },
      { tab: "Opinion", slot: "v2-st-4", cat: "Opinion", title: "Culture is the infrastructure we keep underfunding", blurb: "Festivals, studios and archives are how a country writes its own record.", meta: "Columnist name", alt: "A musician tuning an instrument backstage." },
      { tab: "Analysis", slot: "v2-st-5", cat: "Governance", title: "What the December calendar demands of the peace architecture", blurb: "Security arrangements, voter registration, and the sequencing problem.", meta: "2 days ago · Analysis", alt: "Delegates seated around a conference table." },
      { tab: "Analysis", slot: "v2-st-6", cat: "Stewardship", title: "What Africa's resources are actually worth", blurb: "Resource-rich nations, international capital, and valuing what the continent owns.", meta: "3 days ago · Analysis", alt: "Heavy machinery at an open-cast mining site." }
    ];
  }

  renderVals() {
    const v = this.renderValsBase();
    ["latest", "pods", "shownStories"].forEach(k => { v[k] = v[k].map(o => Object.assign({}, o, { photo: this.photos[o.slot] })); });
    return v;
  }

__PHOTOS__

  renderValsBase() {
    const st = this.state;
    const tabNames = ["All", "News", "Opinion", "Analysis"];
    const all = this.stories();
    const mm = String(Math.floor(st.t / 60)).padStart(2, "0");
    const ss = String(st.t % 60).padStart(2, "0");
    const featuredId = "lmZTqk6T-MY";
    const pct = Math.min(100, (st.t / 3130) * 100);

    return {
      nav: [
        { label: "Podcasts", href: "#podcasts" },
        { label: "News", href: "#news" },
        { label: "TV", href: "#tv" },
        { label: "Festival", href: "#festival" }
      ],
      tabs: tabNames.map(t => ({
        label: t,
        pressed: st.tab === t ? "true" : "false",
        bg: st.tab === t ? "#06183A" : "transparent",
        fg: st.tab === t ? "#ffffff" : "#111111",
        // #D9D5CB is 1.47:1 and cannot bound an interactive control (WCAG 1.4.11 needs 3:1)
        bc: st.tab === t ? "#06183A" : "#8A8377",
        onClick: () => this.setState({ tab: t })
      })),
      shownStories: st.tab === "All" ? all.slice(0, 4) : all.filter(s => s.tab === st.tab),
      inBrief: [
        { cat: "Region", title: "Border markets reopen after three-week closure" },
        { cat: "Economy", title: "Oil transit talks resume in Nairobi" },
        { cat: "TV", title: "New documentary: water, borders and bargaining" }
      ],
      latest: [
        { slot: "v2-lt-1", cat: "Region", title: "Border markets reopen after three-week closure", blurb: "Traders return to the crossing after a security review.", meta: "09:40", alt: "Traders carrying goods through a reopened border crossing." },
        { slot: "v2-lt-2", cat: "Culture", title: "What a week on the river returns to the city", blurb: "Hoteliers and artists on the festival's expected footprint.", meta: "Yesterday", alt: "Performers on a stage set up beside the river." },
        { slot: "v2-lt-3", cat: "Education", title: "Inside the Nile Explorer Academy", blurb: "Training a production team, and opening the network up.", meta: "2 days ago", alt: "Trainees working at editing desks in the academy newsroom." },
        { slot: "v2-lt-4", cat: "Sport", title: "Festival football expands to twelve states", blurb: "Qualifiers begin in October, with finals on the river.", meta: "2 days ago", alt: "Players competing for the ball during a qualifying match." }
      ],
      festDays: [
        { date: "4 Dec", title: "Opening parade and river procession", venue: "Juba waterfront" },
        { date: "6 Dec", title: "Fashion and textile showcase", venue: "Nyakuron Cultural Centre" },
        { date: "8 Dec", title: "Inter-state football final", venue: "Juba Stadium" },
        { date: "10 Dec", title: "River Sessions closing concert", venue: "Festival main stage" }
      ],
      playIcon: st.playing ? "❚❚" : "▶",
      playLabel: st.playing ? "Pause episode 5" : "Play episode 5",
      playing: st.playing ? "true" : "false",
      elapsed: mm + ":" + ss,
      progress: pct.toFixed(1) + "%",
      progressNow: Math.round(pct),
      togglePlay: this.togglePlay,
      pods: [
        { slot: "v2-pod-1", status: "Episode 04", tagColor: "#06183A", title: "The Horn in flux", date: "05 Aug", dur: "48 min", alt: "Episode artwork for The Horn in flux." },
        { slot: "v2-pod-2", status: "Episode 03", tagColor: "#06183A", title: "Economic sovereignty, and who free trade serves", date: "29 Jul", dur: "44 min", alt: "Episode artwork for the economic sovereignty discussion." },
        // #C4881C is 2.92:1 on the surface band; --gold-text is the readable gold
        { slot: "v2-pod-3", status: "Upcoming", tagColor: "#96690F", title: "The youngest population in the world", date: "28 Sep", dur: "Records live", alt: "Episode artwork for the population episode." },
        { slot: "v2-pod-4", status: "Upcoming", tagColor: "#96690F", title: "Water as foreign policy", date: "11 Oct", dur: "Records live", alt: "Episode artwork for the water diplomacy episode." }
      ],
      featured: {
        playing: st.featured,
        idle: !st.featured,
        embed: "https://www.youtube-nocookie.com/embed/" + featuredId + "?autoplay=1&rel=0",
        onPlay: () => this.setState({ featured: true })
      },
      mostRead: [
        { n: "1", title: "What is on the ballot in December" },
        { n: "2", title: "Inside the registration drive" },
        { n: "3", title: "Who pays for the peace architecture" },
        { n: "4", title: "The festival's third edition, in full" }
      ],
      subLabel: st.subbed ? "Subscribed" : "Sign up",
      subNote: st.subbed
        ? "Thanks. The morning brief arrives on weekdays; unsubscribe from any issue."
        : "One email each weekday. Unsubscribe from any issue.",
      onSubscribe: e => { e.preventDefault(); e.target.reset(); this.setState({ subbed: true }); }
    };
  }
}
