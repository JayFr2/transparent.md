# Transparent.md

Translucent Obsidian on Windows 11. Obsidian's built-in translucent window option is macOS-only. This plugin brings it to Windows.

*Created for personal use.*

## Setup

1. Copy `main.js`, `manifest.json` and `styles.css` into `<your vault>/.obsidian/plugins/transparent/`
2. Turn on **Transparent** in Settings -> Community plugins

Needs Windows 11 with **Transparency effects** on.

## Settings

- **Backdrop material**: Acrylic, Mica or Tabbed
- **Background tint**: `0` is see-through, `1` is solid

## Themes

If your theme has solid backgrounds, make them semi-transparent with a snippet:

```css
body.transparent-on.theme-dark {
  --background-primary: rgba(30, 30, 46, 0.78);
  --background-secondary: rgba(24, 24, 37, 0.62);
}
```

## License

MIT
