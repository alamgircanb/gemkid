# KidGem navigation and visual design

## Navigation principles
Keep the main learner navigation to Home, My Path, Explore and My Gems. Put settings and Parent Zone in a labeled menu. Desktop uses a compact header and optional sidebar; phones use a four-item bottom navigation that never covers lesson controls. A plain list must offer everything an illustrated map offers. The map is an optional view, not a navigation requirement.

## Route inventory
| Route | Purpose and primary action |
|---|---|
| / | Explain the offer; Try a free lesson |
| /explore | Filter by subject, grade, level and availability |
| /start | Select or create a local profile; begin suggested path |
| /dashboard | Resume learning and view subject progress |
| /path/:subject | Show chapters, prerequisites and next lesson |
| /chapter/:id | Explain objectives and list lesson order |
| /lesson/:id | Run all learning stages with a resume point |
| /review | Recommend previously learned skills for revision |
| /gems | View earned rewards and cosmetic collection |
| /parent | Local progress and controls; authenticated family view in production |
| /settings | Interface language, audio, motion, contrast and profile preferences |
| /about and /help | Explain the teaching approach and provide support |
| /privacy and /terms | Factual demo data notice; reviewed production notices later |
| /editor | Production role-protected content workflow; omit from public demo navigation |

For GitHub Pages use hash routing: these logical routes appear after `#/`. Set the Vite base path to `/kidgem/` for a project site, configurable for a custom domain. Test refresh and direct links. Do not assume server rewrite support.

## Home page layout
Header: KidGem wordmark, Explore, For Parents, language menu. Hero: “Small steps. Bright discoveries.” One sentence explains Grades 1–8 and subjects. Primary button: Try a lesson; secondary: Explore subjects. Show one real interactive preview, then six subject cards, the learning loop, age-band previews and a parent explanation. Footer includes support and data notices. No fabricated testimonials, usage counts, awards or curriculum endorsements.

## Learner dashboard
Above the fold show nickname, grade, a large Continue card naming the exact skill and stage, and progress such as “2 of 5 lessons completed.” Below show subjects and a small review suggestion. Empty state: choose a first path. Completed state: celebrate calmly and suggest another skill. Avoid six competing start buttons of equal visual weight.

## Path screen
Each chapter lists title, useful skill, prerequisites, lesson count and status. Lesson states: ready, current, completed, recommended review, prerequisite suggested, planned. Use icons and words together. Prerequisites guide sequencing; children can preview future explanations and parents can adjust placement. Planned lessons cannot open a fake lesson. “Why this next?” explains the recommendation in plain language.

## Lesson screen
Show chapter breadcrumb, skill objective, stage indicator and exit/resume control. Put one main task in the central area. Keep Help, Hear instructions, Reset and Check answer predictable. Do not advance automatically after an incorrect answer. Correct feedback explains why; errors give a concept-specific hint. A summary shows what was learned, assisted versus independent work and one next action. No animation should obscure instructions or trap focus.

## Visual system
Use warm white backgrounds (#FFFDF7), dark ink (#20243A), primary indigo (#4F46E5) and subject accents: math orange, logic purple, coding blue, algorithms teal, languages green. Accent colours decorate cards; check each actual foreground/background combination before using it for text. Use 16–18 px body text for older learners and 18–20 px for early readers, spacious line height and rounded cards. Use a clean Latin font with an explicitly licensed Bengali font such as Noto Sans Bengali. Bundle fonts where permitted; maintain a readable fallback. Never replace readable text with decorative imagery.

KidGem mascot: an original small rounded gem companion called Lumi, with a friendly face and optional accessories. This is a working creative direction, not a cleared character name. Avoid copying existing characters. The younger theme can use expressive illustrations; the older theme uses restrained icons, projects and fewer mascot appearances. Theme choice is adjustable independently of grade.

## Accessibility requirements
Target WCAG 2.2 AA and verify with automated checks plus manual keyboard, zoom and screen-reader review. Set document and passage languages, visible focus, semantic headings, proper labels and live feedback announcements. Give every drag task a select-then-place or button-based alternative. Support touch without hover. Prefer 44 by 44 CSS pixel interactive targets. Support 200% zoom, 320 px layout width and reduced motion. Do not use colour, sound or timers as the sole way to solve a task. No autoplay sound; provide transcripts for narration and visible instructions when audio is unavailable.

## Internationalization
Interface language and subject language are separate settings. Use English, Français and বাংলা labels rather than flags. Store locale preferences per profile. Keep layout flexible for longer French labels and Bengali conjunct characters. A missing translation must produce an explicit language fallback, not an empty label or a fake translation. Do not announce complete trilingual lesson coverage until reviewed lesson content actually exists in all three languages.
