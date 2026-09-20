# Mobile & Cross-Platform Deployment Options

This document provides a comprehensive overview of options for deploying the Limbo Game Simulator to mobile devices and creating cross-platform applications.

## Table of Contents

1. [Desktop Applications (Electron)](#desktop-applications-electron)
2. [Mobile Applications](#mobile-applications)
   - [Option 1: Tauri Mobile](#option-1-tauri-mobile)
   - [Option 2: Capacitor](#option-2-capacitor)
   - [Option 3: React Native with WebView](#option-3-react-native-with-webview)
   - [Option 4: Flutter with WebView](#option-4-flutter-with-webview)
3. [Progressive Web App (PWA)](#progressive-web-app-pwa)
4. [Comparison Matrix](#comparison-matrix)
5. [Recommendations](#recommendations)

---

## Desktop Applications (Electron)

**Status**: ✅ Implemented in this directory (`offline-sim`)

Electron is the most mature solution for desktop applications, allowing you to package the web application for Windows, macOS, and Linux.

### Features
- Full Node.js API access
- Native system integration
- Offline functionality
- Auto-updates support
- Cross-platform builds

### Build Commands

```bash
cd offline-sim

# Install dependencies
npm install

# Run in development mode
npm start

# Build for current platform
npm run build

# Build for specific platforms
npm run build:win      # Windows
npm run build:mac      # macOS
npm run build:linux    # Linux
npm run build:all      # All platforms
```

### Output Formats
- **Windows**: NSIS installer, Portable executable
- **macOS**: DMG, App Bundle
- **Linux**: AppImage, DEB package

---

## Mobile Applications

### Option 1: Tauri Mobile ⭐ RECOMMENDED

Tauri is a modern alternative to Electron that uses the system's native webview and Rust for the backend. Tauri now supports mobile platforms (iOS and Android).

#### Advantages
- **Smaller bundle sizes** (~10MB vs ~100MB for Electron)
- **Better performance** (uses system webview)
- **Lower memory usage**
- **Rust backend** (secure and fast)
- **Mobile support** (iOS & Android)
- **Active development**

#### Setup Structure

```
offline-sim/
├── src-tauri/          # Rust backend
│   ├── src/
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
├── public/             # Frontend files
└── package.json
```

#### Basic Implementation

**tauri.conf.json**:
```json
{
  "build": {
    "beforeBuildCommand": "",
    "beforeDevCommand": "",
    "devPath": "../public",
    "distDir": "../public"
  },
  "package": {
    "productName": "Limbo Game Simulator",
    "version": "1.0.0"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": ["deb", "rpm", "appimage", "dmg", "msi"],
      "identifier": "com.limbogame.simulator",
      "icon": ["icons/32x32.png", "icons/128x128.png", "icons/icon.icns", "icons/icon.ico"]
    },
    "allowlist": {
      "all": false,
      "fs": true,
      "dialog": true
    }
  }
}
```

**main.rs** (Rust backend):
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize)]
struct GameState {
    balance: f64,
    nonce: i32,
    client_seed: String,
    server_seed: String,
}

#[tauri::command]
fn get_game_state(app_data_dir: PathBuf) -> Result<GameState, String> {
    let session_path = app_data_dir.join("game-session.json");
    let data = fs::read_to_string(session_path)
        .map_err(|e| e.to_string())?;
    serde_json::from_str(&data)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn run_simulation(
    target_multiplier: f64,
    initial_bet: f64,
    bet_multiplier: f64,
    number_of_bets: i32,
) -> Result<SimulationResult, String> {
    // Simulation logic here
    Ok(SimulationResult { /* ... */ })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_game_state, run_simulation])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### Build Commands

```bash
# Install Tauri CLI
cargo install tauri-cli

# Add Tauri to project
npm install @tauri-apps/cli
npx tauri init

# Development
npm run tauri dev

# Build for mobile
npm run tauri android build
npm run tauri ios build

# Build for desktop
npm run tauri build
```

#### Requirements
- Rust and Cargo installed
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)

---

### Option 2: Capacitor

Capacitor (by Ionic) is excellent for wrapping web apps and deploying to iOS and Android with native API access.

#### Advantages
- **Easy integration** with existing web apps
- **Native API access** (camera, filesystem, etc.)
- **Live updates** support
- **Large community** and plugins
- **Ionic Framework** compatibility

#### Setup Structure

```
offline-sim/
├── android/              # Android native project
├── ios/                  # iOS native project
├── public/               # Web assets
├── capacitor.config.json
└── package.json
```

#### Implementation

**capacitor.config.json**:
```json
{
  "appId": "com.limbogame.simulator",
  "appName": "Limbo Game Simulator",
  "webDir": "public",
  "bundledWebRuntime": false,
  "plugins": {
    "Filesystem": {
      "directory": "DOCUMENTS"
    }
  }
}
```

**JavaScript Integration**:
```javascript
import { App } from '@capacitor/app';
import { Filesystem, Directory } from '@capacitor/filesystem';

// Save game state
async function saveGameState(state) {
    await Filesystem.writeFile({
        path: 'game-session.json',
        data: JSON.stringify(state),
        directory: Directory.Documents
    });
}

// Load game state
async function loadGameState() {
    try {
        const { data } = await Filesystem.readFile({
            path: 'game-session.json',
            directory: Directory.Documents
        });
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
}

// Handle app lifecycle
App.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) {
        saveGameState(gameState);
    }
});
```

#### Build Commands

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init

# Add platforms
npx cap add android
npx cap add ios

# Sync web assets
npx cap sync

# Open in native IDE
npx cap open android    # Opens Android Studio
npx cap open ios        # Opens Xcode

# Build in native IDE
# Then build/run from Xcode or Android Studio
```

#### Requirements
- Android Studio (for Android)
- Xcode (for iOS, macOS only)
- Node.js

---

### Option 3: React Native with WebView

Build a React Native app that hosts your web application in a WebView component.

#### Advantages
- **True native components**
- **Better performance** than hybrid apps
- **Access to all native APIs**
- **Large ecosystem**

#### Setup Structure

```
limbo-mobile/
├── App.js
├── src/
│   ├── components/
│   └── screens/
├── android/
├── ios/
└── package.json
```

**App.js**:
```javascript
import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { SafeAreaView, StatusBar } from 'react-native';
import RNFS from 'react-native-fs';

const App = () => {
  const [injectedJavaScript, setInjectedJavaScript] = useState('');

  useEffect(() => {
    // Load local HTML file
    const loadHTML = async () => {
      const path = `${RNFS.DocumentDirectoryPath}/public/index.html`;
      const html = await RNFS.readFile(path, 'utf8');
      setInjectedJavaScript(html);
    };
    loadHTML();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <WebView
        source={{ html: injectedJavaScript }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </SafeAreaView>
  );
};

export default App;
```

#### Build Commands

```bash
# Create React Native app
npx react-native init LimboGame

# Install WebView
npm install react-native-webview react-native-fs

# Run on device
npx react-native run-android
npx react-native run-ios

# Build release
cd android && ./gradlew assembleRelease
cd ios && xcodebuild -workspace LimboGame.xcworkspace -scheme LimboGame -configuration Release
```

#### Requirements
- Node.js
- Android Studio / Xcode
- React Native knowledge

---

### Option 4: Flutter with WebView

Flutter provides excellent cross-platform support with a WebView plugin.

#### Advantages
- **Single codebase** for iOS and Android
- **Excellent performance**
- **Beautiful UI** capabilities
- **Growing ecosystem**

#### Setup Structure

```
limbo_game/
├── lib/
│   └── main.dart
├── android/
├── ios/
├── pubspec.yaml
└── package.json
```

**pubspec.yaml**:
```yaml
name: limbo_game
description: Limbo Game Simulator

dependencies:
  flutter:
    sdk: flutter
  webview_flutter: ^4.4.0
  path_provider: ^2.1.0
  shared_preferences: ^2.2.0

flutter:
  uses-material-design: true
  assets:
    - assets/public/
```

**main.dart**:
```dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

void main() {
  runApp(LimboApp());
}

class LimboApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Limbo Game Simulator',
      theme: ThemeData.dark(),
      home: GameScreen(),
    );
  }
}

class GameScreen extends StatefulWidget {
  @override
  _GameScreenState createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  late WebViewController controller;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageFinished: (String url) {
            setState(() => isLoading = false);
          },
        ),
      )
      ..loadRequest(Uri.parse('file:///android_asset/public/index.html'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          WebViewWidget(controller: controller),
          if (isLoading)
            Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
```

#### Build Commands

```bash
# Install Flutter
# https://flutter.dev/docs/get-started/install

# Create Flutter project
flutter create limbo_game
cd limbo_game

# Add dependencies
flutter pub add webview_flutter path_provider shared_preferences

# Run on device
flutter run

# Build APK
flutter build apk --release

# Build iOS
flutter build ios --release
```

#### Requirements
- Flutter SDK
- Android Studio / Xcode
- Dart knowledge

---

## Progressive Web App (PWA)

Transform the web application into a PWA that can be installed on mobile devices and desktops.

#### Advantages
- **No app store** required
- **Instant updates**
- **Smallest footprint**
- **Works offline**
- **Cross-platform**

#### Implementation

**public/manifest.json**:
```json
{
  "name": "Limbo Game Simulator",
  "short_name": "Limbo",
  "description": "Provably Fair Crypto Game Simulator",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#1a1a2e",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**public/sw.js** (Service Worker):
```javascript
const CACHE_NAME = 'limbo-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

**Update index.html** (add to `<head>`):
```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#1a1a2e">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Limbo">
<link rel="apple-touch-icon" href="icons/icon-192x192.png">
```

**Register Service Worker** (add to end of `<body>`):
```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  }
</script>
```

#### Deployment

```bash
# Deploy to any static hosting
# Options:
# - GitHub Pages
# - Netlify
# - Vercel
# - Firebase Hosting
# - Your own server

# Example: Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=public
```

---

## Comparison Matrix

| Feature | Electron | Tauri | Capacitor | React Native | Flutter | PWA |
|---------|----------|-------|-----------|--------------|---------|-----|
| **Bundle Size** | ~100MB | ~10MB | ~5MB | ~20MB | ~15MB | ~1MB |
| **Performance** | Good | Excellent | Good | Excellent | Excellent | Good |
| **Memory Usage** | High | Low | Medium | Low | Low | Low |
| **Native APIs** | Full | Full | Full | Full | Full | Limited |
| **Offline Support** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **App Store** | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Dev Complexity** | Low | Medium | Low | High | Medium | Low |
| **Cross-Platform** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Hot Reload** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Learning Curve** | Easy | Medium | Easy | Steep | Medium | Easy |

---

## Recommendations

### For Desktop Only
**Use Electron** (already implemented in `offline-sim`)
- Mature ecosystem
- Easy to implement
- Full Node.js access

### For Mobile + Desktop (Recommended)
**Use Tauri** ⭐
- Best performance/size ratio
- Single codebase for all platforms
- Modern and secure
- Growing community

### For Quick Mobile Deployment
**Use Capacitor**
- Easiest migration from web
- Minimal code changes
- Good plugin ecosystem

### For Best Mobile UX
**Use Flutter**
- Native-like performance
- Beautiful UI capabilities
- Single codebase

### For Maximum Reach
**Use PWA**
- No installation barriers
- Instant updates
- Works everywhere

---

## Next Steps

1. **For Electron (Current)**: 
   - Run `npm install` in `offline-sim/`
   - Run `npm run build` to create distributables

2. **For Tauri Mobile**:
   - Install Rust: `https://rustup.rs/`
   - Install Android Studio / Xcode
   - Run `npm install @tauri-apps/cli`
   - Run `npx tauri init`
   - See: `https://tauri.app/v1/guides/getting-started/setup`

3. **For Capacitor**:
   - Run `npm install @capacitor/core @capacitor/cli`
   - Run `npx cap init`
   - Run `npx cap add android` and/or `npx cap add ios`
   - See: `https://capacitorjs.com/docs/getting-started`

4. **For PWA**:
   - Add `manifest.json` and service worker to `public/`
   - Deploy to any static hosting
   - See: `https://web.dev/progressive-web-apps/`

---

## Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Tauri Documentation](https://tauri.app/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [React Native Documentation](https://reactnative.dev/)
- [Flutter Documentation](https://flutter.dev/docs)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [Electron Builder](https://www.electron.build/)
