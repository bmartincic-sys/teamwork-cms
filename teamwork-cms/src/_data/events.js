// Trade shows and conferences for /come-find-us/.
//
// Upcoming vs past is derived from `end` at build time rather than being flagged by
// hand, so the page re-sorts itself on every deploy and nothing has to be moved from
// one list to the other. Upcoming runs soonest first (the nearest show is the one a
// reader can still act on); past runs most recent first.
//
// `stand` is optional. Leave it out when the booth number is not known rather than
// guessing one.

const EVENTS = [
  {
    name: "NRF 2027: Retail's Big Show",
    start: "2027-01-10",
    end: "2027-01-12",
    dateLabel: "January 10–12, 2027",
    monthShort: "Jan",
    dayRange: "10–12",
    year: "2027",
    venue: "Jacob K. Javits Convention Center",
    city: "New York City",
    standLabel: "Booth",
    stand: "#6156",
    headline: "New York in January. We wouldn't miss it.",
    body: "We're heading back to the Javits Center for NRF 2027. Find us at Booth #6156. More details on what we'll be showcasing are coming soon. Drop us your details and we'll keep you in the loop.",
    cta: "Save my spot",
    ref: "nrf-2027",
  },
  {
    name: "NRF 2026: Retail's Big Show Europe",
    start: "2026-09-15",
    end: "2026-09-17",
    dateLabel: "September 15–17, 2026",
    monthShort: "Sep",
    dayRange: "15–17",
    year: "2026",
    venue: "Paris Expo Porte de Versailles",
    city: "Paris",
    standLabel: "Stand",
    stand: "I-050",
    headline: "Let's meet at NRF Europe 2026.",
    body: "Europe's premier gathering for retail leaders, and we'll be right in the middle of it at Stand I-050. Come see live demos across RFID, POS, OMS, and AI-powered retail workflows, and find out how connected retail technology is helping brands across Europe move faster, sell smarter, and unify every channel.",
    cta: "Book a meeting at our stand",
    ref: "nrf-europe-2026",
  },
  {
    name: "Shoptalk Europe 2026",
    start: "2026-06-09",
    end: "2026-06-11",
    dateLabel: "June 9–11, 2026",
    venue: "Fira Gran Via",
    city: "Barcelona",
    body: "Barcelona brought together thousands of retail innovators to shape the future of commerce, and we were there for every conversation. Our team connected with the people driving the industry forward, talking Enterprise POS, OMS, RFID self-checkout, and 121 Commerce throughout the three days.",
  },
  {
    name: "Shoptalk 2026",
    start: "2026-03-24",
    end: "2026-03-26",
    dateLabel: "March 24–26, 2026",
    venue: "Mandalay Bay",
    city: "Las Vegas",
    standLabel: "Booth",
    stand: "#2370",
    body: "Booth #2370 was busy, and for good reason. We showcased the full Teamwork Commerce stack and came away with one clear takeaway: unified commerce isn't the future. It's the expectation.",
  },
  {
    name: "EuroShop 2026",
    start: "2026-02-22",
    end: "2026-02-26",
    dateLabel: "February 22–26, 2026",
    venue: "Messe Düsseldorf",
    city: "Germany",
    standLabel: "Stand",
    stand: "Hall 6 / A17",
    body: "One of the world's biggest retail trade shows, and we were on the floor at Hall 6, Stand A17. We showcased our full omnichannel platform including Mobile POS, RFID-powered self-checkout, Order Management, and Inventory Control to thousands of retail professionals from across the globe.",
  },
  {
    name: "NRF 2026: Retail's Big Show",
    start: "2026-01-11",
    end: "2026-01-13",
    dateLabel: "January 11–13, 2026",
    venue: "Jacob K. Javits Convention Center",
    city: "New York City",
    standLabel: "Booth",
    stand: "#5957",
    body: "Retail's biggest stage delivered. Booth #5957 was where enterprise POS, RFID, 121 Commerce AI, and omnichannel OMS came to life in front of retail leaders from across the globe. If you were there, you know. If you missed us, we're back at Booth #6156 in January 2027.",
  },
  {
    name: "Retail Technology Show 2025",
    start: "2025-04-02",
    end: "2025-04-03",
    dateLabel: "April 2–3, 2025",
    venue: "ExCeL",
    city: "London",
    standLabel: "Booth",
    stand: "#R20",
    body: "Connecting retail's change-makers in London. We were at Booth #R20 with our full cloud-based tech stack: POS, OMS, Clienteling, Inventory Control, and Reporting, built for retailers who need a platform that keeps up with them.",
  },
];

module.exports = () => {
  // Compare on the date alone. An event is still "upcoming" through its final day, so a
  // show that is running today does not drop into the archive halfway through.
  const today = new Date().toISOString().slice(0, 10);

  const upcoming = EVENTS.filter((e) => e.end >= today).sort((a, b) =>
    a.start.localeCompare(b.start)
  );
  const past = EVENTS.filter((e) => e.end < today).sort((a, b) =>
    b.start.localeCompare(a.start)
  );

  return { all: EVENTS, upcoming, past };
};
