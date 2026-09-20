# Build Icons Guide

This directory should contain the following icon files for building the application:

## Required Icons

### Windows
- `icon.ico` - Main application icon (256x256 pixels recommended)

### macOS
- `icon.icns` - Main application icon (512x512 pixels source)

### Linux
- `icon.png` - Main application icon (512x512 pixels)

## Creating Icons

### Option 1: Using Online Tools

1. Create a 512x512 PNG icon
2. Convert using:
   - [icoconvert.com](https://icoconvert.com/) for .ico
   - [cloudconvert.com](https://cloudconvert.com/png-to-icns) for .icns

### Option 2: Using ImageMagick

```bash
# Install ImageMagick
# Windows: choco install imagemagick
# macOS: brew install imagemagick
# Linux: sudo apt install imagemagick

# Create ICO (Windows)
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# Create ICNS (macOS)
# First create iconset directory
mkdir icon.iconset
sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png
sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png
iconutil -c icns icon.iconset
rm -rf icon.iconset
```

### Option 3: Using Electron Icon Generator

```bash
npm install -g electron-icon-generator
electron-icon-generator --input=icon.png --output=build
```

## Icon Design Guidelines

- Use a square canvas (1:1 aspect ratio)
- Minimum source size: 512x512 pixels
- Recommended format: PNG with transparency
- Avoid text (doesn't scale well)
- Use high contrast for visibility
- Test on dark and light backgrounds

## Placeholder

Until you add real icons, the application will use default Electron icons.
