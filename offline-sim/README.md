# Limbo Game Simulator - Offline Desktop Application

🎮 A provably fair crypto game simulator packaged as an offline desktop application for Windows, macOS, and Linux.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

## Features

- ✅ **Offline First** - Works completely offline, no internet connection required
- ✅ **Cross-Platform** - Build for Windows, macOS, and Linux from a single codebase
- ✅ **Provably Fair** - Uses cryptographic algorithms (HMAC-SHA256) for fair outcomes
- ✅ **Session Persistence** - Game sessions are automatically saved and restored
- ✅ **Export/Import** - Save and load game sessions as JSON files
- ✅ **Auto-Updates** - Built-in support for automatic updates (configurable)
- ✅ **Multiple Crypto Providers** - Support for BCH, Bustadice, and Stake algorithms

## Quick Start

### Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

### Installation

1. **Navigate to the offline-sim directory**:
```bash
cd offline-sim
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run in development mode**:
```bash
npm start
```

The application will launch in a new window.

## Building Distributables

### Build for Current Platform

```bash
npm run build
```

### Build for Specific Platforms

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# All platforms
npm run build:all
```

### Output Files

After building, you'll find the distributables in the `dist/` directory:

**Windows**:
- `Limbo Game Simulator Setup x.x.x.exe` - NSIS installer
- `Limbo Game Simulator-Portable-x.x.x.exe` - Portable executable

**macOS**:
- `Limbo Game Simulator-x.x.x.dmg` - DMG installer
- `Limbo Game Simulator.app` - Application bundle

**Linux**:
- `Limbo Game Simulator-x.x.x.AppImage` - AppImage (portable)
- `limbo-game-simulator_x.x.x_amd64.deb` - DEB package

## Usage

### 1. Initialize Game Session

1. Click **"🚀 Initialize Game Session"**
2. Set your starting balance (default: 100,000)
3. Optionally provide custom client/server seeds
4. Choose whether to round down monetary values
5. Click **"Initialize Session"**

### 2. Run Simulation

1. Configure simulation parameters:
   - **Target Multiplier** - The multiplier you're betting on (e.g., 120000x)
   - **Initial Bet** - Starting bet amount
   - **Multiplier** - Bet progression multiplier (e.g., 1x = same bet, 2x = double on loss)
   - **Number of Bets** - How many rounds to simulate
2. Click **"Run Simulation"**

### 3. Session Management

- **Export Session** - Save current session to a JSON file
- **Import Session** - Load a previously saved session
- **Session Info** - View detailed session statistics
- **Reset Game** - Clear all session data and start fresh

## Project Structure

```
offline-sim/
├── src/
│   ├── main.js           # Electron main process
│   └── preload.js        # Electron preload script (secure IPC)
├── public/
│   └── index.html        # Application UI
├── build/                # Build resources (icons, etc.)
├── dist/                 # Built distributables (after build)
├── package.json          # Dependencies and scripts
├── electron-builder.config.js  # Build configuration
├── README.md             # This file
└── MOBILE-OPTIONS.md     # Mobile deployment guide
```

## Configuration

### Crypto Provider

The application uses the BCH crypto provider by default. You can change it by setting the `CRYPTO_PROVIDER` environment variable:

```bash
# Use Bustadice algorithm
CRYPTO_PROVIDER=bustadice npm start

# Use Stake algorithm
CRYPTO_PROVIDER=stake npm start
```

### Build Configuration

Edit `electron-builder.config.js` to customize:
- App name and ID
- Bundle identifiers
- Build targets
- File associations
- Auto-update settings

## Advanced Features

### Session Data Location

Game sessions are stored in the user data directory:

- **Windows**: `%APPDATA%\limbo-game-simulator\`
- **macOS**: `~/Library/Application Support/limbo-game-simulator/`
- **Linux**: `~/.config/limbo-game-simulator/`

### Custom Icons

Replace icons in the `build/` directory:
- `icon.ico` - Windows icon (256x256)
- `icon.icns` - macOS icon (512x512)
- `icon.png` - Linux icon (512x512)

### Auto-Updates

To enable auto-updates, configure the `publish` option in `electron-builder.config.js`:

```javascript
publish: {
  provider: 'github',
  owner: 'your-username',
  repo: 'limbo-game-simulator'
}
```

## Development

### Debug Mode

Run with DevTools open:

```bash
npm run dev
```

### View Logs

The application logs to:
- Console (in DevTools)
- Standard output (terminal)

### Modifying the UI

The UI is in `public/index.html`. Changes will be reflected after restarting the app in development mode.

### Modifying Backend Logic

Backend logic is in `src/main.js`. Changes require restarting the app.

## Troubleshooting

### Application Won't Start

1. Ensure Node.js v16+ is installed
2. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

### Build Fails

1. Check that all dependencies are installed
2. Ensure you have write permissions in the directory
3. Try cleaning the build cache:
   ```bash
   npm run clean
   npm run build
   ```

### Session Data Lost

Session data is stored in the user data directory. Check the location for your platform above.

## Mobile Deployment

For mobile deployment options (iOS, Android), see [MOBILE-OPTIONS.md](./MOBILE-OPTIONS.md).

Recommended options:
- **Tauri Mobile** - Best performance and size
- **Capacitor** - Easiest migration
- **PWA** - No app store required

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Uses [electron-builder](https://www.electron.build/)
- Provably fair algorithm based on [BCH](https://github.com/bitcoincash-org/bitcoincash) implementation

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review the mobile options guide

---

**Happy Gaming! 🎮**
