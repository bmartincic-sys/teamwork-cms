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
| 49% / 63% | More frequent purchases / more spend per month from clienteled shoppers (Tulip) | features/customer-data | Tulip Global 2025 Clienteling Benchmark Report (2nd annual) | exact match on both |
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
| 30,000+ terminals, 40+ countries, 100+ integrations, 150+ reports, 99.9%, 99.99%, 30s, $300K, 20 min, 118 Petco stores, 2,000+ Petco terminals, 250 InnovaSport stores, 22% per-cap | various | in the original content drop, commit bd54a7a, 9 July 2026 |
| 900+ orders, 1,100+ units, +14% / +26% / +21%, 18 days | platform/oms | supplied directly by Teamwork, August 2026; retailer anonymised at their request |
| 5,000+ store count | about | added when About was rebuilt from the live site (commit c5e69cd) |
| 39+ omnichannel workflows | platform/mobile-pos | supplied directly by Teamwork, September 2026; needs sign-off |
| 32s checkout with RFID vs 85s without; 53s saved per transaction; 15 hrs per 1,000 | platform/rfid | EXO, supplied by Teamwork September 2026. The 53s and 15 hrs are arithmetic on the first two figures (85-32=53; 53x1,000=14.7h). Needs sign-off on the EXO citation |
| 2,500+ stores / 25+ markets at a single customer | platform/scalability | commit 4c25022, origin not recorded, needs sign-off |
| 100K+ daily / 500K+ weekly orders, 98%+ fill rate | platform/oms | commit 4e6083e, origin not recorded, needs sign-off |
| 93% of transactions through Club Petco | solutions/pet-goods | origin not recorded, needs sign-off |
| 60,000+ fans in a matter of hours | case study | commit 9bcf4cc, origin not recorded, needs sign-off |
| 15 years of legacy POS replaced | case study | arrived with a named quote from Sports Basement's COO |
| <5min associate onboarding, +26% revenue lift, 80% search-time reduction, <1% out-of-stock (was 12%) | mobile-pos, home, rfid | origin not recorded, needs sign-off |
