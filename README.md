# Limbo Game - Provably Fair Crypto Game

A modern, responsive limbo/target game with both manual and automated betting modes. Built with Node.js, Express, and vanilla JavaScript, featuring a provably fair system using cryptographic algorithms.

![Limbo Game Screenshot](docs/images/screenshot.png)

## Features

### 🎮 Game Modes
- **Manual Mode**: Place individual bets with custom bet amounts and target multipliers
- **Auto Mode**: Automated betting with advanced strategies including stop loss/take profit, bet progression, and auto-target adjustment

### 🎨 User Interface
- Modern, clean design with dark theme and gradient backgrounds
- Responsive layout that works on both desktop and mobile devices
- Smooth animations and visual feedback
- Real-time game history and statistics dashboard

### 🔒 Provably Fair System
- Transparent system where players can verify game fairness
- Uses HMAC-SHA256 hashing for cryptographic verification
- Client seed, server seed, and nonce for each game round

### 📊 Statistics & History
- Track wins, losses, win rate, and profit/loss
- View game history with detailed results
- Real-time balance updates

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/limbo-game.git
cd limbo-game
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3255`

## How to Play

### Manual Mode
1. Enter your bet amount
2. Set your target multiplier
3. Click "Place Bet"
4. Watch the multiplier animate from 1.00x to the result
5. If the result is equal to or higher than your target, you win!

### Auto Mode
1. Configure your betting strategy:
   - Base bet amount
   - Base target multiplier
   - Number of rounds
   - Stop on profit/loss limits
   - Bet progression (martingale)
   - Auto-target adjustment
2. Click "Start Auto Bet"
3. The game will automatically place bets according to your strategy

## API Documentation

### Endpoints

#### POST /play
Place a bet and get the game result.

**Request Body:**
```json
{
  "clientSeed": "string",
  "serverSeed": "string",
  "nonce": "number",
  "betAmount": "number",
  "targetMultiplier": "number"
}
```

**Response:**
```json
{
  "success": true,
  "multiplier": 1.13,
  "won": false,
  "profit": -100,
  "clientSeed": "string",
  "serverSeed": "string",
  "nonce": 1
}
```

#### POST /generateSeeds
Generate new client and server seeds.

**Response:**
```json
{
  "success": true,
  "clientSeed": "generatedClientSeed",
  "serverSeed": "generatedServerSeed"
}
```

#### POST /verify
Verify a game result for fairness.

**Request Body:**
```json
{
  "clientSeed": "string",
  "serverSeed": "string",
  "nonce": "number",
  "expectedMultiplier": "number"
}
```

**Response:**
```json
{
  "success": true,
  "isValid": true,
  "calculatedMultiplier": 1.13,
  "expectedMultiplier": 1.13
}
```

## Project Structure

```
limbo-game/
├── public/                 # Static files
│   ├── index.html         # Main HTML file
│   ├── script.js          # Client-side JavaScript
│   └── style.css          # CSS styles
├── docs/                  # Documentation
│   ├── api.md            # API documentation
│   ├── user-guide.md      # User guide
│   ├── developer-guide.md # Developer documentation
│   └── deployment.md     # Deployment instructions
├── crypto.bch.js         # Provably fair algorithm
├── server.js             # Express server
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## Architecture

The game uses a client-server architecture where:

- **Client (Browser)**: Handles the UI, animations, and user interactions
- **Server (Node.js/Express)**: Manages game logic, calculates multipliers, and determines win/loss outcomes
- **crypto.bch.js**: Ensures provably fair game results using HMAC-SHA256 hashing

## Provably Fair System

Our game uses a provably fair system to ensure that all game outcomes are fair and can be verified. Here's how it works:

1. **Seed Generation**: Client and server seeds are generated for each game session
2. **Nonce**: A counter that increments with each bet to ensure unique results
3. **Hashing**: The seeds and nonce are combined using HMAC-SHA256 to generate a random number
4. **Multiplier Calculation**: The random number is converted to a multiplier with a house edge

Players can verify any game result using the client seed, server seed, and nonce, ensuring complete transparency.

## Technologies Used

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Cryptography**: Node.js crypto module (HMAC-SHA256)
- **Styling**: CSS3 with flexbox and grid layouts
- **Icons**: Font Awesome

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or issues, please create an issue on the GitHub repository.