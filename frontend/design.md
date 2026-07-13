# Design — Play! South Wales

A locked design system for this app. Every page redesign reads this file before emitting code.

## Genre
modern-minimal

## Macrostructure family
- App pages: Workbench (split directories, maps, and sidebar/calendar)

## Theme
- \--color-paper\: \oklch(0.985 0.006 28)\ /* Warm sand paper */
- \--color-paper-2\: \oklch(0.995 0.004 28)\ /* Warm off-white card */
- \--color-ink\: \oklch(0.20 0.014 28)\ /* Deep warm charcoal */
- \--color-ink-2\: \oklch(0.45 0.012 28)\ /* Warm muted grey */
- \--color-rule\: \oklch(0.91 0.008 28)\ /* Clean warm border */
- \--color-accent\: \oklch(0.55 0.22 25)\ /* Pokemon Red */
- \--color-focus\: \oklch(0.48 0.15 250)\ /* Pokemon Blue */

## Typography
- Display: Outfit, weight 700, style normal
- Body: Geist, weight 400
- Mono: Geist Mono, weight 400
- Display tracking: -0.02em
- Type scale anchor: --text-md = 1.125rem
- Emoji Policy: Don't use emojis apart from event types.

## Spacing
4-point named scale. The values are in \global.css\. Pages must use named tokens (\ar(--space-md)\), never raw values.

## Motion
- Easings: cubic-bezier(0.16, 1, 0.3, 1) named \--ease-out\
- Reveal pattern: none (instant loading states, content is just there)
- Reduced-motion fallback: opacity-only, 150ms

## Microinteractions stance
- Silent success (no toasts for simple saves)
- Hover effects: Specific CSS property transitions (background-color, border-color, transform) only.
- Focus rings appear instantly without transitions.

## CTA voice
- Primary CTA: Filled accent color, minimal padding, Outfit 700 font.
- Secondary CTA: Double border, paper background, dark text.

## Per-page allowances
- App pages: Function carries the page. Minimal borders, clean list groups, interactive maps, and responsive leaderboard tables.

## What pages MUST share
- The wordmark / logotype layout.
- The accent color and its placement.
- The display + body fonts.
- The CTA voice (button shape, border-radius, padding rhythm).
