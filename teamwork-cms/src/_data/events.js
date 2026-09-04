// Trade shows and conferences for /events/.
//
// Upcoming vs past is derived from `end` at build time rather than being flagged by
// hand, so the page re-sorts itself on every deploy and nothing has to be moved from
// one list to the other. Upcoming runs soonest first (the nearest show is the one a
// reader can still act on); past runs most recent first, grouped by year.
//
// Every date, venue and booth below was read off the event's own landing page or its
// promo banner. `stand` is optional: leave it out when the booth number is not known
// rather than guessing one.
//
// `photo` names a file in assets/images/company/events/. It is checked against disk
// before being handed to the template, so a card whose art has not been added yet falls
// back to the typographic treatment instead of rendering a broken image. Drop a file
// with the matching name in that folder and the card picks it up on the next build.

const fs = require("fs");
const path = require("path");

const PHOTO_DIR = path.join(__dirname, "..", "assets", "images", "company", "events");

const EVENTS = [
  // ---------- upcoming ----------
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
    country: "USA",
    region: "North America",
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
    country: "France",
    region: "Europe",
    standLabel: "Stand",
    stand: "I-050",
    headline: "Let's meet at NRF Europe 2026.",
    body: "Europe's premier gathering for retail leaders, and we'll be right in the middle of it at Stand I-050. Come see live demos across RFID, POS, OMS, and AI-powered retail workflows, and find out how connected retail technology is helping brands across Europe move faster, sell smarter, and unify every channel.",
    cta: "Book a meeting at our stand",
    ref: "nrf-europe-2026",
    link: "https://www.teamworkcommerce.com/nrf-europe-2026/",
  },

  // ---------- 2026 ----------
  {
    name: "Shoptalk Europe 2026",
    start: "2026-06-09",
    end: "2026-06-11",
    dateLabel: "June 9–11, 2026",
    venue: "Fira Gran Via",
    city: "Barcelona",
    country: "Spain",
    region: "Europe",
    photo: "shoptalk-europe-2026.webp",
    link: "https://50295934.hs-sites.com/shoptalk-europe-2026",
    body: "Barcelona brought together thousands of retail innovators to shape the future of commerce, and we were there for every conversation. Our team connected with the people driving the industry forward, talking Enterprise POS, OMS, RFID self-checkout, and 121 Commerce throughout the three days.",
  },
  {
    name: "Retail Technology Show 2026",
    start: "2026-04-22",
    end: "2026-04-23",
    dateLabel: "April 22–23, 2026",
    venue: "ExCeL",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
    standLabel: "Stand",
    stand: "W20",
    photo: "retail-technology-show-2026.webp",
    link: "https://50295934.hs-sites.com/retail-technology-show-2026",
    body: "Back at ExCeL for the UK's biggest retail technology gathering, this time on Stand W20. Two days of live product across POS, OMS, RFID self-checkout and 121 Commerce with the retailers rebuilding their stacks.",
  },
  {
    name: "Retail Leaders Lunch, Shoptalk",
    start: "2026-03-25",
    end: "2026-03-25",
    dateLabel: "March 25, 2026",
    venue: "Off-site, hosted with Adyen",
    city: "Las Vegas",
    country: "USA",
    region: "North America",
    kind: "Private event",
    photo: "retail-leaders-lunch-2026.webp",
    link: "https://partiful.com/e/EtLvX3in7KjNkdjbNSBn",
    body: "An invite-only lunch away from the show floor, hosted with Adyen. No booths and no badges, just retail leaders having the conversations that are hard to have in a hall of 10,000 people.",
  },
  {
    name: "Shoptalk 2026",
    start: "2026-03-24",
    end: "2026-03-26",
    dateLabel: "March 24–26, 2026",
    venue: "Mandalay Bay",
    city: "Las Vegas",
    country: "USA",
    region: "North America",
    standLabel: "Booth",
    stand: "#2370",
    photo: "shoptalk-2026.webp",
    link: "https://www.teamworkcommerce.com/shoptalk-2026/",
    body: "Booth #2370 was busy, and for good reason. We showcased the full Teamwork Commerce stack and came away with one clear takeaway: unified commerce isn't the future. It's the expectation.",
  },
  {
    name: "EuroShop 2026",
    start: "2026-02-22",
    end: "2026-02-26",
    dateLabel: "February 22–26, 2026",
    venue: "Messe Düsseldorf",
    city: "Düsseldorf",
    country: "Germany",
    region: "Europe",
    standLabel: "Stand",
    stand: "Hall 6 / A17",
    photo: "euroshop-2026.webp",
    body: "One of the world's biggest retail trade shows, and we were on the floor at Hall 6, Stand A17. We showcased our full omnichannel platform including Mobile POS, RFID-powered self-checkout, Order Management, and Inventory Control to thousands of retail professionals from across the globe.",
  },
  {
    name: "Shoptalk Luxe 2026",
    start: "2026-01-27",
    end: "2026-01-29",
    dateLabel: "January 27–29, 2026",
    venue: "Emirates Palace",
    city: "Abu Dhabi",
    country: "UAE",
    region: "Middle East",
    photo: "shoptalk-luxe-2026.webp",
    link: "https://www.teamworkcommerce.com/shoptalk-luxe-2026/",
    body: "Luxury retail's own gathering, at the Emirates Palace in Abu Dhabi. Clienteling, RFID accuracy and the kind of service standards luxury houses hold themselves to were the whole conversation.",
  },
  {
    name: "NRF 2026: Retail's Big Show",
    start: "2026-01-11",
    end: "2026-01-13",
    dateLabel: "January 11–13, 2026",
    venue: "Jacob K. Javits Convention Center",
    city: "New York City",
    country: "USA",
    region: "North America",
    standLabel: "Booth",
    stand: "#5957",
    photo: "nrf-2026.webp",
    link: "https://www.teamworkcommerce.com/nrf-2026/",
    body: "Retail's biggest stage delivered. Booth #5957 was where enterprise POS, RFID, 121 Commerce AI, and omnichannel OMS came to life in front of retail leaders from across the globe. If you were there, you know. If you missed us, we're back at Booth #6156 in January 2027.",
  },

  // ---------- 2025 ----------
  {
    name: "Tech for Retail 2025",
    start: "2025-11-24",
    end: "2025-11-25",
    dateLabel: "November 24–25, 2025",
    venue: "Paris Expo Porte de Versailles, Hall 4",
    city: "Paris",
    country: "France",
    region: "Europe",
    standLabel: "Stand",
    stand: "D95",
    photo: "tech-for-retail-2025.webp",
    link: "https://www.teamworkcommerce.com/tech-for-retail-2025/",
    body: "The European retail exhibition, spanning fashion, luxury, e-commerce and consumer goods. We took Stand D95 in Hall 4 and ran guided walkthroughs of the platform across all of it.",
  },
  {
    name: "Forum Retail 2025",
    start: "2025-11-12",
    end: "2025-11-13",
    dateLabel: "November 12–13, 2025",
    venue: "Superstudio Più, Via Tortona",
    city: "Milan",
    country: "Italy",
    region: "Europe",
    photo: "forum-retail-2025.webp",
    link: "https://www.teamworkcommerce.com/forum-retail/",
    body: "The 25th edition of Italy's largest retail innovation and networking event, organized by iKN. Two days of keynotes, panels and hubs with the CEOs and innovators shaping Italian retail.",
  },
  {
    name: "Chicago Dinner, Shoptalk Fall",
    start: "2025-09-18",
    end: "2025-09-18",
    dateLabel: "September 18, 2025",
    venue: "Off-site",
    city: "Chicago",
    country: "USA",
    region: "North America",
    kind: "Private event",
    photo: "chicago-dinner-2025.webp",
    link: "https://partiful.com/e/dOURa1H0ZiYt2H7SvYJD",
    body: "An invite-only dinner on the Thursday of Shoptalk Fall, for the conversations that do not fit into a ten-minute booth slot.",
  },
  {
    name: "Shoptalk Fall 2025",
    start: "2025-09-17",
    end: "2025-09-19",
    dateLabel: "September 17–19, 2025",
    venue: "McCormick Place",
    city: "Chicago",
    country: "USA",
    region: "North America",
    photo: "shoptalk-fall-2025.webp",
    link: "https://www.teamworkcommerce.com/shoptalk-fall-2025/",
    body: "Shoptalk's autumn edition, in Chicago. Three days on how retailers are actually operating rather than how they plan to, which is the conversation we came for.",
  },
  {
    name: "Viva Technology 2025",
    start: "2025-06-11",
    end: "2025-06-14",
    dateLabel: "June 11–14, 2025",
    venue: "Paris Expo Porte de Versailles",
    city: "Paris",
    country: "France",
    region: "Europe",
    photo: "viva-technology-2025.webp",
    link: "https://www.teamworkcommerce.com/viva-technology-2025/",
    body: "Europe's largest technology event, well beyond retail. A useful place to talk about where AI in the store is real and where it is still a demo.",
  },
  {
    name: "Future Stores 2025",
    start: "2025-06-04",
    end: "2025-06-05",
    dateLabel: "June 4–5, 2025",
    city: "Los Angeles",
    country: "USA",
    region: "North America",
    photo: "future-stores-2025.webp",
    link: "https://www.teamworkcommerce.com/future-stores-2025/",
    body: "Two days on the store as a launchpad for community engagement, and on staffing it for interactions that actually matter. Exactly the ground our associate tooling is built for.",
  },
  {
    name: "Shoptalk Europe 2025",
    start: "2025-06-02",
    end: "2025-06-04",
    dateLabel: "June 2–4, 2025",
    venue: "Fira Gran Via",
    city: "Barcelona",
    country: "Spain",
    region: "Europe",
    photo: "shoptalk-europe-2025.webp",
    link: "https://www.teamworkcommerce.com/shoptalk-eu-2025/",
    body: "Our first Shoptalk Europe at the Fira Gran Via, showing enterprise POS and OMS alongside RFID-powered self-checkout to European retailers rethinking their stacks.",
  },
  {
    name: "NetComm Forum 2025",
    start: "2025-04-15",
    end: "2025-04-16",
    dateLabel: "April 15–16, 2025",
    venue: "Allianz MiCo",
    city: "Milan",
    country: "Italy",
    region: "Europe",
    standLabel: "Booth",
    stand: "#D46",
    photo: "netcomm-forum-2025.webp",
    link: "https://www.teamworkcommerce.com/netcomm-forum-2025/",
    body: "Italy's leading digital commerce forum, at Booth #D46. We ran the platform in Italian on the stand, which tends to end the localization conversation quickly.",
  },
  {
    name: "Retail Technology Show 2025",
    start: "2025-04-02",
    end: "2025-04-03",
    dateLabel: "April 2–3, 2025",
    venue: "ExCeL",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
    standLabel: "Booth",
    stand: "#R20",
    photo: "retail-technology-show-2025.webp",
    link: "https://www.teamworkcommerce.com/retail-technology-show-2025/",
    body: "Connecting retail's change-makers in London. We were at Booth #R20 with our full cloud-based tech stack: POS, OMS, Clienteling, Inventory Control, and Reporting, built for retailers who need a platform that keeps up with them.",
  },
  {
    name: "Shoptalk 2025",
    start: "2025-03-25",
    end: "2025-03-27",
    dateLabel: "March 25–27, 2025",
    venue: "Mandalay Bay",
    city: "Las Vegas",
    country: "USA",
    region: "North America",
    standLabel: "Booth",
    stand: "#1151",
    photo: "shoptalk-2025.webp",
    link: "https://www.teamworkcommerce.com/shoptalk-2025/",
    body: "Booth #1151, three days, and a lot of conversations about replacing systems that no longer fit. Shoptalk remains the fastest way to read where US retail is heading.",
  },
  {
    name: "EuroCIS 2025",
    start: "2025-02-18",
    end: "2025-02-20",
    dateLabel: "February 18–20, 2025",
    venue: "Messe Düsseldorf",
    city: "Düsseldorf",
    country: "Germany",
    region: "Europe",
    standLabel: "Stand",
    stand: "Hall 10 / E24",
    photo: "eurocis-2025.webp",
    link: "https://www.teamworkcommerce.com/eurocis-2025/",
    body: "Europe's leading retail technology trade fair. Hall 10, Stand E24, and a steady stream of German and Benelux retailers asking hard questions about fiscal compliance. Our favorite kind.",
  },

  // ---------- 2024 ----------
  {
    name: "Shoptalk Europe 2024",
    start: "2024-06-03",
    end: "2024-06-05",
    dateLabel: "June 3–5, 2024",
    venue: "Fira Gran Via",
    city: "Barcelona",
    country: "Spain",
    region: "Europe",
    link: "https://www.teamworkcommerce.com/shoptalk-eu-2024/",
    body: "Barcelona, and the year the conversation shifted from whether unified commerce mattered to how quickly it could be delivered.",
  },
];

// Only hand a photo to the template if the file is actually on disk, so an event whose
// art has not been added yet renders as a typographic card instead of a broken image.
function resolvePhoto(e) {
  if (!e.photo) return null;
  return fs.existsSync(path.join(PHOTO_DIR, e.photo))
    ? `/assets/images/company/events/${e.photo}`
    : null;
}

module.exports = () => {
  // Compare on the date alone. An event is still "upcoming" through its final day, so a
  // show that is running today does not drop into the archive halfway through.
  const today = new Date().toISOString().slice(0, 10);
  const all = EVENTS.map((e) => ({ ...e, photoUrl: resolvePhoto(e) }));

  const upcoming = all
    .filter((e) => e.end >= today)
    .sort((a, b) => a.start.localeCompare(b.start));

  const past = all
    .filter((e) => e.end < today)
    .sort((a, b) => b.start.localeCompare(a.start));

  // Group the archive by year so twenty-odd cards stay scannable.
  const byYear = [];
  past.forEach((e) => {
    const y = e.start.slice(0, 4);
    const bucket = byYear.find((g) => g.year === y);
    if (bucket) bucket.events.push(e);
    else byYear.push({ year: y, events: [e] });
  });

  return {
    all,
    upcoming,
    past,
    pastByYear: byYear,
    pastCount: past.length,
    withPhoto: past.filter((e) => e.photoUrl).length,
  };
};
