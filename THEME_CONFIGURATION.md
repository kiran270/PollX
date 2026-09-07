# PollMitra Theme Configuration Guide

## Overview
All colors for the PollMitra application are centrally managed in a single file for easy customization.

## Configuration File Location
```
PollX/poll-app/app/theme-config.css
```

## How to Change Colors

### 1. Primary Brand Color (Red)
To change the main red color used throughout the app:

```css
--color-primary: #E31E24;           /* Change this value */
--color-primary-dark: #C41A1F;      /* Darker shade for hovers */
--color-primary-light: #FF3B41;     /* Lighter shade for accents */
```

**Example:** To change to blue:
```css
--color-primary: #0066FF;
--color-primary-dark: #0052CC;
--color-primary-light: #3385FF;
```

### 2. Light Mode Colors
To change light mode appearance:

```css
--color-light-bg: #FFFFFF;          /* Background color */
--color-light-text: #000000;        /* Text color */
--color-light-border: rgba(0, 0, 0, 0.1);  /* Border color */
```

**Example:** To use a light gray background:
```css
--color-light-bg: #F5F5F5;
--color-light-text: #1A1A1A;
--color-light-border: rgba(0, 0, 0, 0.15);
```

### 3. Dark Mode Colors
To change dark mode appearance:

```css
--color-dark-bg: #000000;           /* Background color */
--color-dark-text: #FFFFFF;         /* Text color */
--color-dark-border: rgba(255, 255, 255, 0.1);  /* Border color */
```

**Example:** To use a dark gray instead of pure black:
```css
--color-dark-bg: #1A1A1A;
--color-dark-text: #F5F5F5;
--color-dark-border: rgba(255, 255, 255, 0.15);
```

## Current Color Scheme

### Brand Colors
- **Primary Red:** `#E31E24`
- **Primary Red Dark:** `#C41A1F` (hover states)
- **Primary Red Light:** `#FF3B41` (accents)

### Light Mode
- **Background:** Pure White (`#FFFFFF`)
- **Text:** Pure Black (`#000000`)
- **Borders:** Black with 10% opacity

### Dark Mode
- **Background:** Pure Black (`#000000`)
- **Text:** Pure White (`#FFFFFF`)
- **Borders:** White with 10% opacity

## Using Theme Variables in Code

### In CSS/Tailwind
```css
/* Background */
background-color: var(--bg-primary);

/* Text */
color: var(--text-primary);

/* Borders */
border-color: var(--border-color);

/* Primary brand color */
background-color: var(--color-primary);

/* Button hover */
background-color: var(--btn-primary-hover);
```

### In React Components
For hardcoded colors in TSX files, use the CSS variable classes:
```tsx
// Instead of: className="bg-[#E31E24]"
// Use: className="bg-primary"

// Or use inline styles with CSS variables:
<div style={{ backgroundColor: 'var(--color-primary)' }}>
```

## Quick Color Change Examples

### Example 1: Change to Green Theme
```css
--color-primary: #10B981;
--color-primary-dark: #059669;
--color-primary-light: #34D399;
```

### Example 2: Change to Purple Theme
```css
--color-primary: #8B5CF6;
--color-primary-dark: #7C3AED;
--color-primary-light: #A78BFA;
```

### Example 3: Change to Orange Theme
```css
--color-primary: #F97316;
--color-primary-dark: #EA580C;
--color-primary-light: #FB923C;
```

## After Making Changes

1. Save the `theme-config.css` file
2. Refresh your browser (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
3. All colors throughout the app will automatically update

## Files That Use Theme Configuration

- `app/theme-config.css` - Main configuration file
- `app/globals.css` - Imports and applies theme variables
- All components automatically inherit these colors

## Notes

- All color changes are instant - no rebuild required
- Changes apply to both light and dark modes automatically
- The theme system uses CSS variables for maximum flexibility
- Opacity values can also be adjusted in the configuration file

## Support

If you need to add new colors or modify the theme system, edit:
1. `app/theme-config.css` - Add new CSS variables
2. `app/globals.css` - Add new color application rules
