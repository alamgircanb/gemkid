# Accessibility notes

Target: WCAG 2.2 AA. This file records what was actually checked and what still needs checking. Passing automated checks does not prove conformance.

## Built-in measures

- Semantic landmarks (header, nav, main, footer), one `h1` per screen, focus moved to the heading on route change, skip link.
- Visible 3px focus outline on every interactive element.
- No drag and drop anywhere. Ordering uses select-then-place plus labelled ↑/↓/✕ buttons; robot programs use buttons and a numeric repeat count; the Gem Groups game uses + / − buttons.
- Feedback regions use `aria-live`; focus moves to feedback after a wrong answer and to **Next** after a correct one. Lessons never auto-advance after an error.
- Pattern shapes always show their name; status uses icons and words (never colour alone); boxes in the clue game list size, colour and shape in text.
- `lang` attributes on French and Bengali words, on English lesson content shown under a French/Bengali interface, and on the document.
- Sound is off by default; read-aloud is opt-in and says plainly when no voice exists for a language. No autoplay, no timers.
- Settings: reduced motion (follows the OS by default), high contrast, three text sizes, younger/older theme.
- Phone bottom navigation is hidden during lessons so it never covers lesson controls. Targets are at least 44 × 44 px (52 px in the younger theme).

## Colour contrast (computed with the WCAG formula, scratch script)

| Pair | Colours | Ratio |
|---|---|---|
| Body text on page | #20243a / #fffdf7 | 15.02:1 |
| Secondary text on page | #4a4f68 / #fffdf7 | 7.91:1 |
| White on primary button | #ffffff / #4f46e5 | 6.29:1 |
| Primary link on page | #4f46e5 / #fffdf7 | 6.18:1 |
| Correct feedback | #14532d / #dcfce7 | 8.30:1 |
| Error feedback | #7c2d12 / #ffedd5 | 8.18:1 |
| Hint box | #78350f / #fffbeb | 8.75:1 |
| Draft tag | #7c2d12 / #fff7ed | 8.83:1 |
| Mastered tag | #166534 / #dcfce7 | 6.49:1 |
| Continue card (gradient end) | #ffffff / #6d28d9 | 7.10:1 |
| Subject ink on subject tint (lowest: languages) | #166534 / #e6f7ec | 6.41:1 |
| Input border (non-text, needs 3:1) | #78716c / #ffffff | 4.80:1 |
| Focus outline (non-text) | #1d4ed8 / #fffdf7 | 6.59:1 |

Subject accent colours (orange, purple, blue, teal, pink, green) are used only for decoration (card borders, game frames), never for text.

## Checks performed on 2026-10-28 (sandbox)

- Playwright, Chromium: keyboard-only completion of a sentence-ordering task (Tab/Enter only) — passed.
- No horizontal scrolling at 320, 768 and 1280 px on home, dashboard, explore, path, lesson, gems and settings — passed (after a header fix).
- Reduced motion + extra-large text at 640 px wide (≈200 % zoom of a 1280 px window) — robot lesson usable, no overflow — passed.
- Screenshots reviewed at 390, 768 and 1280 px including the Bengali interface.

## Not yet performed (must be done before any beta)

- **axe-core scan** (`tests/e2e/a11y.spec.ts`) — written, but could not run in the build sandbox because packages could not be downloaded. It runs in GitHub Actions CI.
- Real screen-reader passes (NVDA + Firefox, VoiceOver iOS/macOS, TalkBack).
- Real browser zoom at 200 % and 400 % (the test above uses a narrower viewport as a proxy).
- Bengali rendering with the bundled Noto Sans Bengali font: the sandbox lacked the font, so screenshots used a fallback font. Check conjuncts and vowel signs on real devices.
- Testing with children and families (see document 06).
