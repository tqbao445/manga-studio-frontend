---
name: MangaFlow Creative Engine
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1b1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#303032'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#c8c6c8'
  on-secondary: '#303032'
  secondary-container: '#474649'
  on-secondary-container: '#b6b4b7'
  tertiary: '#ffb869'
  on-tertiary: '#482900'
  tertiary-container: '#ca801e'
  on-tertiary-container: '#3f2300'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#e4e2e4'
  secondary-fixed-dim: '#c8c6c8'
  on-secondary-fixed: '#1b1b1d'
  on-secondary-fixed-variant: '#474649'
  tertiary-fixed: '#ffdcbb'
  tertiary-fixed-dim: '#ffb869'
  on-tertiary-fixed: '#2c1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 24px
  gutter: 16px
  panel-gap: 20px
---

## Brand & Style

This design system centers on **Creative Precision**. It is designed for manga studios and independent creators who require a high-utility dashboard that balances professional project management with the expressive spirit of the medium.

The visual style is a fusion of **Minimalism** and **Modern Corporate**, utilizing a sophisticated dark-mode aesthetic. To evoke a "simple anime-inspired atmosphere," the UI avoids literal tropes in favor of structural cues: clean ink-like lines, generous negative space reminiscent of manga panels, and a focused purple accent that represents the "creative spark" within a technical environment. The result is a calm, focused workspace that stays out of the way of the artwork while providing a premium, tool-oriented feel.

## Colors

The palette is optimized for long-duration focus in low-light studio environments. 

- **Primary (#8B5CF6):** An electric, modern purple used sparingly for primary actions, progress indicators, and active states.
- **Surface Neutrals:** A tiered system of dark grays. The base background is nearly black to allow artwork to pop, while UI containers use slightly lighter "ink-wash" grays to define depth.
- **Functional Accents:** Success, warning, and error states should be desaturated to maintain the minimal aesthetic, ensuring they do not compete with the primary purple or the user's uploaded content.

## Typography

We use **Geist** for its technical precision and developer-centric clarity. It provides a monospaced-adjacent feel in its tracking that fits the "production workflow" aspect of manga creation.

- **Headlines:** Use a tighter letter-spacing and heavier weights to create a strong visual anchor for page titles.
- **Body:** Standardized at 16px for optimal readability against dark backgrounds. 
- **Labels:** Used for metadata, status tags, and sidebar navigation. These should often use a medium weight to maintain legibility at smaller sizes.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a sidebar-driven dashboard architecture. 

- **Dashboard Layout:** A fixed-width left navigation (240px) with a fluid main content area.
- **Panel Logic:** Content is organized into "Panels" (cards) that mimic the layout of a manga page. Use a consistent 20px gap between these panels to maintain a clean, rhythmic structure.
- **Rhythm:** All spacing—margins, padding, and offsets—must be multiples of 8px. This ensures a mathematical rigor that supports the professional tone of the product.
- **Mobile:** On smaller screens, the sidebar collapses into a bottom navigation bar or a hamburger menu, and panels stack vertically with 16px side margins.

## Elevation & Depth

In this dark-mode system, depth is communicated through **Tonal Layering** rather than heavy shadows.

- **Level 0 (Background):** Base surface (#0F0F11).
- **Level 1 (Panels/Cards):** Surface color (#1E1E20). These use a very soft, subtle purple-tinted shadow (0px 4px 20px rgba(139, 92, 246, 0.05)) to suggest they are floating.
- **Level 2 (Popovers/Modals):** Lighter gray (#2A2A2D) with a crisp 1px border (#3F3F46) to distinguish from the panels below.
- **Interactions:** On hover, cards should slightly lift—achieved by increasing the shadow spread and subtly lightening the background color of the element.

## Shapes

The shape language is friendly yet structured, utilizing **Rounded (Level 2)** settings.

- **Standard Elements:** Buttons, input fields, and small tags use a 0.5rem (8px) radius.
- **Dashboard Panels:** Large containers and cards use the `rounded-xl` (1.5rem / 24px) setting to create the signature "modern dashboard" look requested.
- **Visual Distinction:** This contrast between smaller functional elements (sharper) and larger layout containers (rounder) helps users subconsciously distinguish between "tools" and "workspaces."

## Components

### Buttons
- **Primary:** Solid #8B5CF6 with white text. No gradient. 
- **Ghost:** Transparent background with a 1px #3F3F46 border. Purple text on hover.
- **Interaction:** All buttons transition over 200ms. On hover, primary buttons increase brightness by 10%.

### Cards & Panels
- Dashboard cards use `rounded-xl` corners. 
- Content within cards (like manga chapter thumbnails) should have a 1px interior border to keep edges crisp against the dark UI.

### Inputs
- Fields use a dark background (#151518) with a subtle bottom border.
- **Focus State:** The border transitions to primary purple with a soft 2px purple outer glow (glow opacity 0.2).

### Progress & Workflow
- **Kanban Boards:** Columns are transparent with dashed borders; cards within them are solid Level 1 surfaces.
- **Status Chips:** Small, pill-shaped indicators. Use primary purple for "In Progress" and a muted gray for "Draft."

### Lists
- Clean, unstyled lists with 1px horizontal separators (#27272A). 
- Hovering over a list item highlights the entire row in a slightly lighter gray.