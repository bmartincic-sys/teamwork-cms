# Statistic sources

Every third-party statistic used in marketing copy, with the source it came from.
Verified by web search on 17 August 2026. Add to this file when adding a figure.

| Figure | Claim as shown | Page | Source | Verified |
|---|---|---|---|---|
| $2,180 | Average loss per internal theft investigation (NRF) | features/access-identity | NRF National Retail Security Survey 2023, FY2022 data | exact match |
| $112B | Annual U.S. retail shrink, FY2022 (NRF) | solutions/footwear-apparel | NRF, "Shrink Accounted for Over $112 Billion in Industry Losses in 2022" | exact match, FY2022 |
| 29% | Of retail shrink is internal theft (Appriss Retail) | features/access-identity | Appriss Retail 2026 Total Retail Loss Benchmark Report | exact match |
| $26B | Annual cost of employee theft (Appriss Retail) | features/access-identity | Appriss Retail 2026 Total Retail Loss Benchmark Report | exact match |
| 1.68% | Retail shrink, share of revenue, 2024 (NRF) | solutions/jewelry-watches | NRF National Retail Security Survey 2024 | exact match |
| $165B | U.S. pet spending, 2026 proj. (APPA) | solutions/pet-goods | APPA 2026 State of the Industry Report ($158B 2025, $165B projected 2026) | exact match |
| 95M | U.S. pet-owning households (APPA) | solutions/pet-goods | APPA 2026 State of the Industry Report | exact match |
| $97.7B | U.S. footwear market, 2024 (Expert Market Research) | solutions/footwear-apparel | Expert Market Research, USD 97.72B in 2024 | exact match; source now named on the page |
| $398B | Global jewelry market, 2026 (Grand View Research) | solutions/jewelry-watches | Grand View Research, USD 397.7B for 2026 | supported; source now named on the page because estimates across firms range $254B to $409B |
| 1,000/sec | RFID tag read rate (Impinj) | solutions/fashion-apparel | Impinj R700 datasheet, over 1,100 tags/sec | conservative, claim is below spec |
| 73% / 62% / 51% | Mobile devices for payments / inventory checks / product information (Toshiba / Retail Dive) | features/access-identity | Toshiba and Retail Dive survey of 148 retail executives | exact match on all three |
| 93% / 127 | Petco Mexico transactions through Club Petco / Petco stores on one customer record | features/customer-data | Teamwork's own Petco Mexico case study (/blog/petco-omnichannel-transformation/). Replaced the Tulip benchmark figures on 9 October 2026: Tulip is a competitor, so its research is not cited | exact match on both |
| 53% and 80% | In a survey of MLB fans, 53% wait 15+ minutes at concession stands, over 80% have abandoned a purchase because the line was too long (Mashgin, 2025) | solutions/stadiums-venues | Mashgin, Beyond the Bases 2025 MLB report, 530+ fans surveyed | both exact; source added and "fans" narrowed to MLB fans, which is who was surveyed |
| 23% | Of the sales lift from training attributable to the training itself (Wharton) | features/training | Wharton / Fisher et al., "Do Online Trainings Work in Retail?", 63,500 salespeople across 330 stores | corrected: label now matches what the study measured |

## Notes and outstanding items

**Resolved 18 August 2026.** The Wharton label said "higher sales per hour", which is
not the metric the study reports: it found associates who completed at least one module
sold 46% more, and split that lift roughly in half between the training itself and the
enthusiasm of those who chose to train. The label now describes the 23% as the share of
the lift attributable to training. The two NRF figures now carry their survey years,
since $112B is FY2022 and 1.68% is the 2024 edition. The jewelry and footwear market
sizes now name their research firm on the page.

**Still open: NRF has newer editions than FY2022.** The $112B figure is accurate for
FY2022 but is no longer the latest available. Worth refreshing to the current survey.

## Figures from Teamwork's own data, not third-party research

These are not verifiable by web search and need internal sign-off. Origin recorded
where known.

| Figure | Page | Origin |
|---|---|---|
| 30,000+ terminals, 40+ countries, 100+ integrations, 99.9%, 99.99%, 30s, $300K, 20 min, 2,000+ Petco terminals, 250 InnovaSport stores, 22% per-cap; 80% transaction time reduction, $3.1M annual ROI, <30 min associate training, 80% search-time reduction, <1% out-of-stock (was 12%), 98%+ order fill rate | various | supplied by you in the original content drop, commit bd54a7a, 9 July 2026. Traced 3 October 2026 |
| 150+ reports | platform/analytics and elsewhere | in the original content drop, commit bd54a7a, 9 July 2026. Confirmed by Teamwork, September 2026 |
| 900+ orders, 1,100+ units, +14% / +26% / +21%, 18 days | platform/oms | supplied directly by Teamwork, August 2026; retailer anonymised at their request |
| 5,000+ store count | about, footer ("thousands of stores") | added when About was rebuilt from the live site (commit c5e69cd) |
| 39+ omnichannel workflows | platform/mobile-pos | supplied directly by Teamwork, September 2026; needs sign-off |
| Removed 3 October 2026: 71% faster stock counts (inventory-control) and +26% revenue lift (homepage results block) | n/a | neither was in anything Teamwork supplied. The 71% first appeared in a July redesign commit; the +26% was the OMS unit-volume figure relabelled as revenue lift. 500+ checkout hours is no longer on the site |
| 32s checkout with RFID vs 85s without; 53s saved per transaction; 15 hrs per 1,000 | platform/rfid | EXO, supplied by Teamwork September 2026. The 53s and 15 hrs are arithmetic on the first two figures (85-32=53; 53x1,000=14.7h). Needs sign-off on the EXO citation |
| 2,500+ stores / 25+ markets at a single customer | platform/scalability | confirmed by you on 6 August 2026: the full global fleet of that retailer runs Teamwork Commerce; numbers preferred over anonymity |
| 100K+ daily / 500K+ weekly orders | platform/oms | from a Teamwork sales slide, commit 4e6083e, 20 July 2026. 98%+ fill rate is in the original content drop (row above) |
| 60,000+ fans in a matter of hours | case study card, stadiums-venues | the published article "Powering High-Performance Retail at One of the World's Largest Sporting Events" (Teamwork, Adyen and Miteq), carried over from the live site |
| 15 years on an aging POS (Sports Basement) | case study card | Teamwork's narrative in the published story. The COO's own "15 years" refers to the loyalty program, which the card now states separately |
| 5 minutes to put a new associate on a register | stadiums-venues, scalability, mobile-pos | Aaron Heinrich, Colorado Rockies, quoted in the original content drop (9 July 2026). Not in the ported Rockies case study text. Shown alongside the general <30 min training figure |
| 127 Petco stores, 93% of transactions through Club Petco | Petco case study, solutions/pet-goods | Teamwork's own published case study about Petco Mexico. Both figures are in Teamwork's narrative; the quote from Guillermo Prieto, CIO of Petco Mexico, is about the single customer view. Note the pet goods page says 118 stores; the case study says 127 |
| ~50 mobile POS stations, 5 Denver-area stores, 12 to 25 registers in the main store, All-Star Week relocated 13 weeks out | Colorado Rockies case study | Teamwork's own published case study, on the record from Aaron Heinrich, Senior Director of Retail Operations, Colorado Rockies |
| 10,000+ POS transactions/day on the grounds, 26 stores, 11 Stampede locations, 1M+ visitors | Lammle's case study, home | on the record from Nicole Monte, COO, Lammle's Western Wear, in the recorded interview at youtube.com/watch?v=e99-ciWqEqQ |
| Case study card metrics (two or three per story) | case-studies, homepage rail, nav | each taken from the story it links to, checked 3 October 2026: the ported articles for /blog/ stories, the published pages on teamworkcommerce.com for the rest. Corrected on the way: Art Computers registration is "10 to 15 minutes before, 2 to 3 after" (was shown as 15 to 3); the sporting event figure is 60,000 fans, not transactions; Lammle's cutover is no longer described as "without downtime"; Moose Knuckles Canada covers North America, Europe and Asia |
| 17,000 SKUs counted during a mid-inventory warehouse move | home rail, Hurricanes case study | on the record from Bethany Davis, Senior Director of Merchandise & Retail, Carolina Hurricanes, in the published case study |
| Looker standard dashboard set (Executive overview, Sales and YoY, Stock and inventory health, RFM customer segmentation, Merchandising and purchasing); Viewer and Explorer licenses included; embedded in Cloud HQ under Analytics; drill-down via Looks and Explores; 4-5-4 retail calendar with WoW/YoY; scheduled email delivery in PDF/CSV/Excel; Google BigQuery backend decoupled from the operational database | platform/analytics | supplied directly by Teamwork, September 2026, citing the internal docs Looker Standard Dashboards, Looker Licenses for Teamwork Dashboards, Looker Dashboards Overview, Looker Info, Chapter 26: Looker, Schedule Looker Report, Infrastructure Resource Management & Scaling |
| Anonymous rollout quote ("...smooth and successful deployment...") | platform/mobile-pos | supplied by Teamwork, 2 October 2026; published without attribution at their request. Typos in the supplied text ("forwared", "more store") corrected and sentence case applied; original wording not otherwise changed. Needs sign-off against the source message. |
