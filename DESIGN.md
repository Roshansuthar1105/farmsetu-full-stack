---
name: Agro-Tech Lumina
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bccbb9'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#869585'
  outline-variant: '#3d4a3d'
  surface-tint: '#4ae176'
  primary: '#4be277'
  on-primary: '#003915'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#006e2f'
  secondary: '#b8c4ff'
  on-secondary: '#002584'
  secondary-container: '#173bab'
  on-secondary-container: '#a0b1ff'
  tertiary: '#63e07e'
  on-tertiary: '#003914'
  tertiary-container: '#44c365'
  on-tertiary-container: '#004b1d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c4ff'
  on-secondary-fixed: '#001453'
  on-secondary-fixed-variant: '#173bab'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is engineered for a next-generation agricultural platform that bridges the gap between traditional farming and high-tech data insights. The personality is **authoritative yet nurturing**, combining the organic vitality of agriculture with the precision of modern SaaS.

The visual style utilizes a **Modern Corporate** aesthetic infused with **Glassmorphism**. It prioritizes data clarity and high-tech elegance through deep obsidian backgrounds and vibrant, phosphorescent accents. This creates a "Control Center" feel that empowers users to manage complex agricultural ecosystems with confidence.

**Key Visual Principles:**
- **Technological Vitality:** High-contrast greens against dark voids suggest growth powered by data.
- **Glass & Depth:** Semi-transparent layers create a sense of organized complexity and modern sophistication.
- **Precision:** Sharp typography and structured layouts convey reliability and scientific accuracy.

## Colors

The palette is anchored in a **Deep Dark Mode** to reduce eye strain during long periods of data analysis while making the vibrant agricultural greens pop with maximum luminosity.

- **Primary Green (#22C55E):** Used for primary actions, success states, and growth indicators.
- **Tech Blue (#1E40AF):** Used for secondary branding, information states, and "bridge" elements in the UI (referencing the logo's bridge icon).
- **Surface Palette:** The background utilizes a near-black Navy (#020617), while UI cards use a lighter Slate (#0f172a) with varying levels of transparency.
- **Functional Gradients:** Use the primary green gradient for hero buttons and key highlight areas to draw immediate focus.

## Typography

This design system uses a triple-font approach to balance personality and utility:

1.  **Plus Jakarta Sans (Headlines):** Chosen for its modern, friendly, yet professional curves. It provides the "welcoming" aspect of the brand.
2.  **Inter (Body):** The workhorse font. High legibility for dense data tables and long-form agricultural reports.
3.  **JetBrains Mono (Data Labels):** Used sparingly for numerical data, coordinates, and technical labels to emphasize the "data-driven" nature of the product.

**Scale Usage:**
- Use **Display-LG** for hero section value propositions.
- Use **Label-SM** in all-caps for category tags or table headers.
- Maintain a minimum contrast ratio of 4.5:1 for all body text against dark backgrounds.

## Layout & Spacing

The layout follows a **12-column Fluid Grid** system optimized for dashboard visualization. 

**Layout Model:**
- **Dashboard View:** 12 columns with a sidebar navigation fixed at 280px.
- **Content Density:** Elements use a strict 8px base grid.
- **Adaptive Rules:**
    - **Desktop:** 48px page margins, 24px gutters.
    - **Tablet:** 32px page margins, cards stack into 2-column layouts.
    - **Mobile:** 16px page margins, single-column vertical stack. 

Cards and data widgets should use **auto-layout** with consistent internal padding (24px for desktop, 16px for mobile) to maintain a rhythm of breathability amidst complex data.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Glassmorphism** rather than traditional heavy shadows.

1.  **Level 0 (Background):** Deepest Navy (#020617).
2.  **Level 1 (Default Card):** Glass effect—`rgba(15, 23, 42, 0.6)` with a `backdrop-filter: blur(12px)`.
3.  **Level 2 (Hover/Active):** `rgba(30, 41, 59, 0.8)` with a subtle 1px border of `rgba(255, 255, 255, 0.1)`.
4.  **Level 3 (Modals/Popups):** Opaque surfaces (#1e293b) with a primary green glow—an ambient shadow: `0 20px 40px rgba(34, 197, 94, 0.1)`.

**Border Technique:** Use "inner glow" borders (1px stroke) with top-down linear gradients (white to transparent at 10% opacity) to simulate light hitting the edge of glass panels.

## Shapes

The shape language is **distinctly rounded (Level 2)** to counteract the potentially cold feeling of a dark, technical UI. 

- **Cards & Major Containers:** `rounded-2xl` (1rem / 16px) or `rounded-3xl` (1.5rem / 24px) for a soft, approachable feel.
- **Buttons & Inputs:** `rounded-xl` (0.75rem / 12px) to ensure a modern SaaS aesthetic.
- **Icons:** Use the leaf-inspired curves from the logo. Icon containers should be circular or softly rounded squares.
- **Emojies** Do not use emojies, remove all emojies and use icons instead.

## Components

### Buttons
- **Primary:** Green gradient background, white text, bold weight. Add a subtle outer glow on hover using the primary green.
- **Secondary:** Transparent background with a 1.5px Tech Blue border.
- **Tertiary/Ghost:** No border, Tech Blue text, becomes subtle glass on hover.

### Cards
- **Standard Widget:** Glassmorphic background, 1px subtle border, 24px padding.
- **Featured Card:** 2px primary green top-border or left-accent line to denote importance.

### Inputs
- **Field Style:** Dark filled background (#0f172a) with a subtle bottom border. On focus, the border transitions to a Primary Green glow.
- **Chips:** Small, pill-shaped, using `rounded-full`. Backgrounds should be low-opacity versions of the status color (e.g., 10% green for "Active").

### Navigation
- **Sidebar:** Vertical, semi-transparent. Icons use Tech Blue by default, switching to Primary Green on active states.
- **Bottom Bar (Mobile):** High-blur glass background with active indicators using the leaf-mark from the logo.

### Charts & Data Visualization
- **Line Charts:** Use the Primary Green for the main data trend, with a semi-transparent green area fill below the line.
- **Data Points:** High-contrast white or neon green dots for interactive points.