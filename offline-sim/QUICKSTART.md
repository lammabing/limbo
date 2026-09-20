# Quick Start Guide

## For First-Time Users

### 1. Install and Run (Development Mode)

```bash
# Navigate to the offline-sim directory
cd offline-sim

# Install dependencies (only needed once)
npm install

# Start the application
npm start
```

### 2. Build Desktop Application

```bash
# Build for your current operating system
npm run build

# Find the built application in the 'dist' folder
```

### 3. Using the Application

1. **Initialize Session**: Click "Initialize Game Session" with your preferred settings
2. **Configure Simulation**: Set target multiplier, bet amount, and number of rounds
3. **Run**: Click "Run Simulation" to start
4. **Review Results**: Check the results table and profit/loss statistics
5. **Export**: Save your session for later use

---

## For Developers

### Project Structure

```
offline-sim/
├── src/
│   ├── main.js           # Electron main process (backend)
│   └── preload.js        # Secure bridge between backend and frontend
├── public/
│   └── index.html        # Frontend UI
├── build/                # Icons and build resources
├── dist/                 # Built applications (after build)
└── package.json          # Dependencies and scripts
```

### Available Scripts

```bash
npm start              # Run in development mode
npm run dev            # Run with DevTools open
npm run build          # Build for current platform
npm run build:win      # Build for Windows
npm run build:mac      # Build for macOS
npm run build:linux    # Build for Linux
npm run build:all      # Build for all platforms
npm run clean          # Remove build artifacts
```

### Modify Crypto Provider

```bash
# Default (BCH)
npm start

# Bustadice
CRYPTO_PROVIDER=bustadice npm start

# Stake
CRYPTO_PROVIDER=stake npm start
```

---

## Common Issues

### "npm install" fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build fails
```bash
# Clean and rebuild
npm run clean
npm run build
```

### Application won't start
```bash
# Check Node.js version (should be 16+)
node -v

# Reinstall dependencies
npm install
```

---

## Next Steps

### Deploy to Mobile

See [MOBILE-OPTIONS.md](./MOBILE-OPTIONS.md) for:
- Tauri Mobile (recommended)
- Capacitor
- React Native
- Flutter
- PWA

### Customize

- **UI**: Edit `public/index.html`
- **Backend**: Edit `src/main.js`
- **Build config**: Edit `electron-builder.config.js`
- **Icons**: Add to `build/` directory

### Distribute

1. Build for target platforms
2. Test on clean systems
3. Sign code (optional but recommended)
4. Upload to distribution platform
5. Configure auto-updates (optional)

---

## Help

- **Documentation**: See [README.md](./README.md)
- **Mobile Guide**: See [MOBILE-OPTIONS.md](./MOBILE-OPTIONS.md)
- **Issues**: Check console logs in DevTools (Ctrl+Shift+I / Cmd+Opt+I)
