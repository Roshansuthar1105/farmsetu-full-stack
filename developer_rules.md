# Farmsetu Frontend Developer Rules & Guidelines

These rules must be strictly followed by all development agents and engineers when writing code for the Farmsetu Frontend application.

## 1. Responsive & Mobile-First Design
- **Mobile-First**: Always write styles with a mobile-first approach. Use base Tailwind utility classes for mobile layout first, then use responsive breakpoints (e.g., `sm:`, `md:`, `lg:`, `xl:`) to adapt layouts for tablets and desktops.
- **Preview Stability**: Ensure layouts look pristine on small viewport sizes (320px to 480px) and scale up beautifully.

## 2. Dark & Light Mode Support
- **Full Theme Support**: Every single component must support both light and dark modes.
- **Tailwind Theme Classes**: Use Tailwind's `dark:` modifier for background colors, text colors, borders, and shadows (e.g., `bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`).
- **Harmonious Palette**: Maintain contrast levels that meet WCAG AA readability standards in both modes.

## 3. Styling Tech Stack (Tailwind CSS + SCSS)
- **Tailwind for Layout & Utility**: Use Tailwind CSS for standard layouts, spacing, flexbox, grid, sizing, and color styling.
- **SCSS for Animations & Complex CSS**: Use SCSS/SASS for advanced animations, custom keyframes, complex gradients, pseudo-elements, and page-specific styling that cannot be cleanly achieved using utility classes alone.

## 4. Internationalization (i18n) & Translation Service
- **No Hardcoded User-Facing Text**: All static text, tooltips, placeholders, and user-facing notifications must use the Angular `TranslateService` (e.g., `{{ i18n.t('key') }}` or the `translate` pipe).
- **Dual Translations (English & Hindi)**: Every time a new translation key is added, you MUST add the corresponding key-value pair in both:
  - English translation file: `src/assets/i18n/en.json`
  - Hindi translation file: `src/assets/i18n/hn.json`
- Keep translation keys organized hierarchically (e.g., `landing.hero.title`, `auth.login.error`).

## 5. Toast Messages & User Feedback
- **Toastr Integration**: Use `ToastrService` (`ngx-toastr`) to provide immediate visual feedback for user actions (success, error, warning, info).
- **Trigger Points**: Show success toasts after successful forms/actions (e.g., saving user profile, creating crop records) and error toasts when API calls fail or input validation fails.
