# Typer-99 Theme Customization Guide

This guide explains how to use and customize themes in Typer-99, allowing you to personalize the game's appearance to suit your preferences.

## Table of Contents

- [Built-in Themes](#built-in-themes)
- [Theme System Overview](#theme-system-overview)
- [Using the Theme Customizer](#using-the-theme-customizer)
- [Creating Custom Themes](#creating-custom-themes)
- [Theme Color Properties](#theme-color-properties)
- [Technical Implementation](#technical-implementation)

## Built-in Themes

Typer-99 comes with several built-in themes:

1. **Dark (Default)** - A dark theme with purple accents
2. **Light** - A light theme with blue accents
3. **Synthwave** - A retro theme with neon pink and blue colors

These themes are available to all users without any configuration and serve as good starting points for customization.

## Theme System Overview

The theme system uses CSS variables to apply colors throughout the application. Each theme consists of:

- A unique identifier (`id`)
- A display name (`name`)
- A set of color properties (`colors`)

The color properties are applied as CSS variables to the HTML document root, allowing all components to inherit the theme colors through Tailwind CSS utility classes.

## Using the Theme Customizer

To access the Theme Customizer:

1. Click the sun/moon icon in the top-right corner of the application
2. The Theme Customizer panel will appear
3. Select from available themes using the dropdown
4. Preview the theme immediately as you make changes
5. Close the panel when you're satisfied with your selection

Your theme preference is automatically saved in your browser's local storage and will persist between sessions.

## Creating Custom Themes

To create a custom theme:

1. Open the Theme Customizer by clicking the sun/moon icon
2. Click the "Create Custom Theme" button
3. Enter a name for your new theme
4. Use the color pickers to customize each color property
5. Click "Save Theme" when you're done

Your custom theme will be saved locally and will appear in the themes dropdown for future use.

### Editing Custom Themes

You cannot directly edit existing custom themes. To modify a custom theme:

1. Create a new custom theme with your desired changes
2. Delete the old custom theme if desired

### Deleting Custom Themes

To delete a custom theme:

1. Select the custom theme you want to delete from the dropdown
2. Click the "Delete Current Theme" button
3. The theme will be removed and the application will revert to the default theme

Note: You cannot delete the built-in themes.

## Theme Color Properties

Each theme consists of the following color properties:

| Property    | Description                                           | Usage Examples                              |
|-------------|-------------------------------------------------------|---------------------------------------------|
| background  | Main background color of the application              | Page backgrounds                            |
| text        | Primary text color                                    | Body text, headings                         |
| primary     | Primary accent color                                  | Buttons, highlights, active elements        |
| secondary   | Secondary accent color                                | Alternative buttons, secondary actions      |
| accent      | Tertiary accent color                                 | Special highlights, tertiary elements       |
| error       | Color for error states                                | Error messages, incorrect typing            |
| success     | Color for success states                              | Success messages, completion indicators     |
| neutral     | Neutral color for backgrounds and borders             | Cards, dividers, subtle backgrounds         |

When creating a custom theme, consider accessibility and ensure sufficient contrast between text and background colors.

## Technical Implementation

### Theme Storage

Themes are stored in the browser's localStorage under two keys:

- `typer99-theme`: Stores the currently selected theme
- `typer99-custom-themes`: Stores an array of all custom themes

### Theme Application

Themes are applied by setting CSS variables on the document root:

```typescript
useEffect(() => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }
}, [currentTheme]);
```

### Default Theme Structure

```typescript
const defaultThemes: Theme[] = [
  {
    id: 'default-dark',
    name: 'Dark',
    colors: {
      background: '#121212',
      text: '#ffffff',
      primary: '#bb86fc',
      secondary: '#03dac6',
      accent: '#cf6679',
      error: '#cf6679',
      success: '#03dac6',
      neutral: '#333333'
    }
  },
  // Other themes...
];
```

### Custom Theme Creation

When creating a custom theme, a unique ID is generated using the current timestamp:

```typescript
const createTheme = useCallback((name: string, colors: ThemeColors) => {
  const newTheme: Theme = {
    id: `custom-${Date.now()}`,
    name,
    colors
  };
  
  setCustomThemes(prev => [...prev, newTheme]);
  setCurrentTheme(newTheme);
  
  return newTheme;
}, []);
```

### Tailwind CSS Integration

The theme colors are mapped to Tailwind CSS classes through the `tailwind.config.js` file, which references the CSS variables:

```javascript
theme: {
  extend: {
    colors: {
      background: "var(--color-background)",
      foreground: "var(--color-text)",
      primary: {
        DEFAULT: "var(--color-primary)",
        foreground: "var(--primary-foreground)",
      },
      // Other color mappings...
    },
  },
},
```

This allows you to use Tailwind classes like `bg-background`, `text-primary`, etc. throughout the application, and they will automatically update based on the selected theme.
