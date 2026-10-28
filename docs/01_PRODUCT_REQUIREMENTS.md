# KidGem product requirements

## Product promise
Help children learn a small concept, experiment through play, practice independently and apply the skill in a new situation. Show one clear next step without preventing exploration. Give parents evidence of learning rather than scores presented as intelligence.

## Audiences and jobs
| Audience | Main need | Product response |
|---|---|---|
| Grades 1–2 | Understand instructions with limited reading | Audio when available, visual models, large controls, short sessions |
| Grades 3–5 | Build confidence and solve meaningful problems | Adventure pathways, manipulatives, block commands and projects |
| Grades 6–8 | Develop independence without a babyish interface | Calmer theme, optional mascot, deeper problems and coding projects |
| Parents | Know what was learned and what needs support | Skill evidence, recent activity, next steps and profile controls |
| Content editors | Add lessons without rebuilding each game | Validated content files, reusable activity templates and review status |

## End to end journey
Home → Try a lesson or select a local profile → Choose grade and subject level → My Path → Chapter → Discover → Guided Try → Play → Practice → Challenge → Summary → Recommended next step. A returning learner resumes the last incomplete stage. A parent can change subject placement without erasing history.

## Priorities
P0 means required for the first demo; P1 means required for the family production beta; P2 is expansion.
| ID | Priority | Requirement |
|---|---|---|
| PR01 | P0 | Public home, subject catalogue, grade filters and transparent ready/planned labels |
| PR02 | P0 | Local nickname and avatar profiles, independent subject placement and clear device-only storage notice |
| PR03 | P0 | Visible sequential path with prerequisites, current lesson and one recommended next action |
| PR04 | P0 | Reusable lesson player with explanations, hints, retry, saved stages and correct feedback |
| PR05 | P0 | Real playable math, logic, coding, algorithms and language activities |
| PR06 | P0 | Learning summary showing independent accuracy separately from assisted work |
| PR07 | P0 | EN/FR/BN interface dictionaries, language selector, proper script rendering and honest content fallback |
| PR08 | P0 | Keyboard and touch controls, reduced motion, sound off by default and accessible alternatives to dragging |
| PR09 | P0 | Parent view of local progress, export/reset controls and accessible preference settings |
| PR10 | P1 | Adult accounts, secure child profiles, cross-device progress, recovery, export and deletion |
| PR11 | P1 | Protected editor workflow with drafts, review, versioned publication and audit history |
| PR12 | P1 | Reviewed learning content, reviewed translations and working support route |
| PR13 | P2 | Teacher classes, assignments, school reporting and additional projects |
| PR14 | P2 | Optional constrained AI hints, only after a separately tested safety and cost design |

## First milestone scope
Deliver 12 complete lessons, two in each track: Math, Logic, Coding, Algorithms, English and Languages. For Languages provide one French and one Bengali lesson; this track is only a release grouping, while the catalogue and progress model retain separate French and Bengali subjects. Math: equal groups and multiplication arrays. Logic: repeating patterns and deduction. Coding: sequences and loops. Algorithms: step ordering and linear search. English: sentence order and short passage comprehension. French: greetings. Bengali: basic letter recognition. Use Grades 3–4 for math and English, beginner levels for the other tracks. Provide at least six practice items and two transfer challenges per lesson, plus a playable activity and worked explanation. No more than 96 reviewed assessment items are needed for this milestone; quantity cannot replace quality.

Language lessons may teach a small set of words accurately; do not imply that a learner has completed a grade or language level. Introductory coding can use a constrained instruction system rather than executing user JavaScript.

## Full product definition
A production family portal includes PR01–PR12 with backend services, real authorization and reviewed published content. Complete Grades 1–8 coverage is a separate content programme, tracked in a coverage matrix; 12 sample lessons do not satisfy it. Teacher functions, payments, chat, public profiles and open-ended AI are outside the initial family beta. All visible controls must work or clearly explain their unavailable state.

## Learning and reward behavior
Reward first completion and evidence of understanding, not repeated clicking. Earned gems buy cosmetic items only. Award a lesson completion once per learner and content version using an idempotent event key; repeating a lesson preserves history without farming currency. No public ranking, punitive missed-day streak or purchased advantage. Cosmetic ranks: Explorer, Builder, Problem Solver, Creator. Never label a child low IQ or a genius based on game performance.

## Success hypotheses
In a small supervised pilot, aim for 8 of 10 learners to start a suitable activity without adult navigation help and at least 7 of 10 to finish its core loop. These are proposed product targets, not existing results. Observe confusion, errors and learning explanations. Returning use matters only alongside successful learning and family satisfaction; do not optimize minutes spent or clicks alone.
