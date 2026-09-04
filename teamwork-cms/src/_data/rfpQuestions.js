// Enterprise POS RFP question bank.
//
// One source for both the page and the downloadable CSV, so the two can never
// drift apart.
//
// Editorial rule for anything added here: these are the buyer's questions, not
// our answers, and the set has to stay useful to someone who ends up choosing
// somebody else. Several of these we would not top on, deliberately. A question
// bank that only asks what we happen to win is worthless to a retailer and
// obvious to anyone who has read one before.

module.exports = [
  {
    id: "commercial",
    title: "Commercial and licensing",
    icon: "ti-receipt",
    blurb:
      "Get the money questions in early. Licensing models differ far more than feature lists do, and the total cost usually turns on the answers here rather than the sticker price.",
    questions: [
      "How is the platform licensed: per store, per terminal, per named user, per transaction, or on revenue?",
      "What is included in the base license, and what is a paid module or add-on?",
      "What is the total cost over five years for our store count, including licenses, implementation, hardware, support and training?",
      "How does pricing change if our store count falls rather than grows?",
      "What are the annual uplift terms, and is there a cap?",
      "What are the contract term, notice period and exit terms?",
      "Are there charges for additional environments (development, test, training)?",
      "What happens commercially if we acquire another retailer mid-term?"
    ]
  },
  {
    id: "pos",
    title: "Point of sale and checkout",
    icon: "ti-device-ipad",
    blurb:
      "The daily reality of the shop floor. Ask for these to be demonstrated rather than confirmed in writing.",
    questions: [
      "Which tender types are supported natively, and which need a third party?",
      "How are split tenders, partial refunds and exchanges across tenders handled?",
      "What happens to a transaction in progress if the device loses connectivity?",
      "How long does a full offline day of trading survive before storage or reconciliation becomes a problem?",
      "How are discounts, promotions and price overrides controlled and audited at line level?",
      "Can associates complete a sale anywhere in the store, or only at fixed positions?",
      "How many taps does a standard sale take, and how many does a return take?",
      "What does the customer see during the transaction, and is that display configurable?",
      "How are gift cards, store credit and layaway handled across stores and channels?",
      "How is cash reconciled at end of day, and what does a blind count look like?"
    ]
  },
  {
    id: "inventory",
    title: "Inventory and stock accuracy",
    icon: "ti-packages",
    blurb:
      "Ask for measured accuracy in a comparable fleet, not a target. The gap between claimed and achieved is where most omnichannel programs fail.",
    questions: [
      "What item-level inventory accuracy do comparable customers actually achieve, and how is it measured?",
      "How long does a full-store count take, and does the store have to close?",
      "How often can cycle counts run without disrupting trade?",
      "How are receiving, transfers and adjustments handled on the shop floor?",
      "How quickly does a sale, return or transfer reflect in available-to-sell?",
      "How does the system handle serialized inventory, and to what granularity?",
      "What reporting exists for shrink, and how is it attributed?",
      "How is allocation and replenishment decided, and can we override it by store?"
    ]
  },
  {
    id: "omnichannel",
    title: "Omnichannel and order management",
    icon: "ti-truck-delivery",
    blurb:
      "The scenarios that break systems are the ones that cross channels. Push for the failure cases, not the happy path.",
    questions: [
      "Which fulfillment models are supported natively: ship-from-store, click and collect, ship to store, endless aisle?",
      "How is the fulfilling location chosen, and can we configure that logic ourselves?",
      "What happens when a store cannot fulfill a picked order?",
      "Can a customer return an online order to any store, and how is the refund handled?",
      "How are partial shipments and multi-location orders presented to the customer?",
      "What does the associate actually do when an order lands in their store?",
      "How are carrier labels produced, and which carriers are supported?",
      "How is stock protected from overselling during a peak trading event?"
    ]
  },
  {
    id: "customer",
    title: "Customer data and clienteling",
    icon: "ti-user-heart",
    blurb:
      "Consent and data residency deserve as much attention here as features. Ask your privacy team to review this section.",
    questions: [
      "How is a customer record created at the till without slowing the queue?",
      "How is marketing consent captured, stored and evidenced per market?",
      "How are duplicate customer records detected and merged?",
      "What customer history is visible to an associate, and can that be restricted by role?",
      "Can customers be registered on their own device rather than the associate's?",
      "How does loyalty work across channels and across markets?",
      "What happens to customer data on a deletion request, and how long does it take?",
      "Can we export the full customer record set if we leave?"
    ]
  },
  {
    id: "rfid",
    title: "RFID and loss prevention",
    icon: "ti-wifi",
    blurb:
      "Ask specifically whether RFID is part of the platform or a third-party product sold alongside it. The answer changes the integration and support burden considerably.",
    questions: [
      "Is RFID native to the platform or delivered through a third party or middleware?",
      "Which readers, printers and tags are certified, and who certifies them?",
      "What read accuracy is achieved in a live store, and over what tag population?",
      "How does RFID data reach inventory, and what is the latency?",
      "Can the platform consume vendor-tagged goods, and can tags be printed and encoded at receiving?",
      "How does the system interact with EAS gates, and which gate vendors are supported?",
      "What happens to RFID functionality if the store is offline?",
      "What is the cost per tag and per reader at our scale, and who supplies them?"
    ]
  },
  {
    id: "architecture",
    title: "Architecture, hosting and resilience",
    icon: "ti-server-cog",
    blurb:
      "Involve your architects in writing this section. Ask for a reference architecture diagram as a deliverable, not a description.",
    questions: [
      "Where is the platform hosted, and which regions can our data be pinned to?",
      "Is the platform multi-tenant, and how are tenants isolated?",
      "What is the published uptime commitment, and what is the remedy if it is missed?",
      "What is the disaster recovery plan, and what are the tested RTO and RPO?",
      "What degrades and what keeps working when connectivity is lost at store level?",
      "What is the peak transaction throughput demonstrated in production, by whom?",
      "Can we run in our own cloud tenancy or on premise if we need to?",
      "How is capacity planned for peak trading, and who is accountable if it falls short?",
      "What is the upgrade cadence, and can we defer an upgrade?",
      "How many versions do you support concurrently?"
    ]
  },
  {
    id: "security",
    title: "Security, privacy and compliance",
    icon: "ti-shield-lock",
    blurb:
      "Ask for evidence rather than assertions. A vendor that will share a report under NDA is a different proposition from one that will only describe it.",
    questions: [
      "Which certifications and attestations do you hold, and will you share the reports under NDA?",
      "When was your last independent penetration test, and will you share a summary?",
      "Who are your sub-processors, and where is data processed and stored?",
      "How is cardholder data handled, and what is the scope of your PCI responsibility versus ours?",
      "How are fiscal and tax requirements met in each of our markets, and who certifies that?",
      "What is your breach notification commitment and process?",
      "How is data encrypted in transit and at rest, and who holds the keys?",
      "What is the data retention policy, and can we set it ourselves?",
      "How do you handle a customer data subject access request that spans stores and channels?",
      "Will you complete our security questionnaire, and in what timeframe?"
    ]
  },
  {
    id: "integrations",
    title: "Integrations and APIs",
    icon: "ti-plug-connected",
    blurb:
      "Ask to see the documentation before you sign, not after. Whether it is public is itself a useful signal.",
    questions: [
      "Is your API documentation publicly available, and may we see it now?",
      "Is there a sandbox or test environment we can access during evaluation?",
      "Which ERP, WMS, e-commerce and payment platforms are live with customers today?",
      "Are those integrations built and supported by you, by a partner, or by the customer?",
      "What are the published rate limits, payload limits and expected latencies?",
      "How are breaking API changes versioned and communicated, and what notice do we get?",
      "What happens to our integrations during a platform upgrade?",
      "Are webhooks or event streams available, and with what delivery guarantees?",
      "What is the process and cost if we need an integration that does not exist yet?"
    ]
  },
  {
    id: "identity",
    title: "Identity, access and audit",
    icon: "ti-fingerprint",
    blurb:
      "Shared logins are still common in store systems and are a shrink and audit problem. Ask how the system prevents them rather than whether it supports individual accounts.",
    questions: [
      "How do associates authenticate, and how do you prevent shared credentials in practice?",
      "Does the platform integrate with our identity provider, including SSO and MFA?",
      "How granular are permissions, and can we model our own approval hierarchy?",
      "Is every privileged action attributable to a named individual in the audit trail?",
      "How are leavers, transfers and seasonal staff handled at scale?",
      "Can we export audit logs to our own SIEM?",
      "What access do your own staff have to our production data, and how is that logged?",
      "What options exist where biometric sign-in is not permitted?"
    ]
  },
  {
    id: "devices",
    title: "Devices and hardware",
    icon: "ti-devices",
    blurb:
      "Hardware choice is where lock-in usually hides. Ask what happens when a device you rely on is discontinued.",
    questions: [
      "Which devices and operating systems are supported, and which are certified?",
      "Are we tied to specific hardware, and can we source it ourselves?",
      "Which peripherals are certified: printers, scanners, cash drawers, payment terminals, RFID readers?",
      "How are devices provisioned, updated and wiped at fleet scale?",
      "What mobile device management does the platform require or assume?",
      "What is the minimum OS version supported, and how quickly do you support new ones?",
      "What happens when a certified device is discontinued by its manufacturer?",
      "What is the expected device refresh cycle, and who bears that cost?"
    ]
  },
  {
    id: "implementation",
    title: "Implementation, migration and cutover",
    icon: "ti-arrow-guide",
    blurb:
      "Ask for named references at your store count who went live in the last eighteen months, and speak to them without the vendor present.",
    questions: [
      "Who performs the implementation: your staff, a partner, or ours?",
      "What is a realistic timeline to first store live, and to full rollout at our scale?",
      "Can the platform run alongside our incumbent POS during a phased rollout?",
      "What historical transaction, customer and inventory data migrates, and in what form?",
      "What does rollback look like if a wave fails?",
      "Who is on site at cutover, and for how long?",
      "What is expected of our team, in roles and hours, during implementation?",
      "Which three comparable customers went live most recently, and may we speak to them unaccompanied?",
      "What is the most common cause of delay in your implementations?"
    ]
  },
  {
    id: "training",
    title: "Training and change management",
    icon: "ti-school",
    blurb:
      "Retail turnover means training never finishes. Ask about the second year, not the launch.",
    questions: [
      "How long does it take to train an associate to competence, and how is that measured?",
      "What training materials are provided, and can we adapt them to our own processes?",
      "How is training delivered to new starters after go-live, without vendor involvement?",
      "Is training tracked and certifiable, and can we report on readiness by store?",
      "What does training cost after the initial implementation?",
      "How are seasonal and temporary staff onboarded at peak?"
    ]
  },
  {
    id: "support",
    title: "Support, SLAs and roadmap",
    icon: "ti-headset",
    blurb:
      "Ask who answers at 2am on Black Friday, and what their job title is.",
    questions: [
      "What are your support hours, and in which languages and time zones?",
      "What are the response and resolution targets by severity, and what is the remedy if missed?",
      "Who answers a P1 during peak trading, and are they employed by you or a partner?",
      "How do we escalate, and to whom, by name and role?",
      "How is the product roadmap set, and how do customers influence it?",
      "What did you ship in the last twelve months, and what is committed for the next twelve?",
      "How much notice do we get before a feature is deprecated?",
      "What is your customer retention rate, and how many customers left in the last two years?"
    ]
  },
  {
    id: "exit",
    title: "Exit and data portability",
    icon: "ti-logout",
    blurb:
      "The section most RFPs omit and most regret omitting. Ask it while you still have leverage.",
    questions: [
      "If we leave, what data do we get back, in what format, and how quickly?",
      "Is there a charge for data extraction at exit?",
      "How long do you retain our data after termination, and can we compel deletion?",
      "Can we continue to operate during a transition to another platform?",
      "What assistance do you provide to a successor vendor, and at what cost?"
    ]
  }
];
