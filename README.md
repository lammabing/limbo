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

4. Open your browser and navigate to `http://localhost:3145`

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

The Limbo Game provides a RESTful API for game operations. See `docs/compare-providers.md` for detailed API documentation.

### Endpoints

#### Crypto Provider Configuration

The game supports multiple cryptographic implementations that can be configured:

- `bch` (default): Original BCH implementation
- `bustadice`: Alternative Bustadice implementation
- `stake`: Stake.com implementation

You can switch between implementations using the `CRYPTO_PROVIDER` environment variable:

```bash
# Start server with BCH provider (default)
npm start

# Start server with Bustadice provider
CRYPTO_PROVIDER=bustadice npm start

# Start server with Stake provider
CRYPTO_PROVIDER=stake npm start

# Generate outcomes with BCH provider
npm run generate:bch <clientSeed> <serverSeed> <rounds>

# Generate outcomes with Bustadice provider
npm run generate:bustadice <clientSeed> <serverSeed> <rounds>

# Generate outcomes with Stake provider
npm run generate:stake <clientSeed> <serverSeed> <rounds>
```

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

## CLI Tools

The project includes comprehensive command-line tools for generating game outcomes, simulating betting strategies, and managing game sessions.

### Game Session Management (`cli-scripts/`)

1. `init-game.js`: Initializes a game session by generating and fixing seeds
   ```bash
   node cli-scripts/init-game.js
   ```

2. `continue-simulate.js`: Continues a game simulation using fixed seeds
   ```bash
   node cli-scripts/continue-simulate.js <targetMultiplier> <initialBet> <betMultiplier> <numberOfBets>
   ```

3. `reset-game.js`: Resets the game session by deleting the game-session.json file
   ```bash
   node cli-scripts/reset-game.js
   ```

4. `view-game-session.js`: Displays the current game session information
   ```bash
   node cli-scripts/view-game-session.js
   ```

### Outcome Generation & Analysis

5. `outcome-generator.js`: Generates outcomes for a specified number of rounds
   ```bash
   node cli-scripts/outcome-generator.js <rounds> [threshold] [clientSeed] [serverSeed]
   ```

6. `multi-outcome-generator.js`: Runs multiple iterations of outcome generation
   ```bash
   node cli-scripts/multi-outcome-generator.js <iterations> <rounds> [threshold]
   ```

7. `outcome-range.js`: Analyzes outcomes within a specific range
   ```bash
   node cli-scripts/outcome-range.js
   ```

8. `outcome-until-threshold.js`: Generates outcomes until a threshold is reached
   ```bash
   node cli-scripts/outcome-until-threshold.js
   ```

### Profit & Cost Calculations

9. `profit-calculation.js`: Calculates profit for betting systems based on geometric progression
   ```bash
   node cli-scripts/profit-calculation.js <w> <m> <x> <a>
   ```

10. `profit-simulation.js`: Simulates betting systems with provably fair mechanics
    ```bash
    node cli-scripts/profit-simulation.js <m> <x> <a> [startingBalance]
    ```

11. `cost-calculation.js`: Calculates total cost of bets
    ```bash
    node cli-scripts/cost-calculation.js <initialBet> <betMultiplier> <numberOfBets>
    ```

### Utility Scripts

12. `randomStringGenerator.js`: Generates random strings with configurable options
    ```bash
    node cli-scripts/randomStringGenerator.js
    ```

13. `random-string-samples.js`: Demonstrates various configurations with clipboard support
    ```bash
    node cli-scripts/random-string-samples.js
    ```

14. `compare-providers.js`: Compares outcomes from different crypto providers
    ```bash
    node cli-scripts/compare-providers.js <rounds> [clientSeed] [serverSeed]
    ```

15. `csv-display.js`: Displays CSV data from generated outcomes
    ```bash
    node cli-scripts/csv-display.js
    ```

16. `table-utils.js`: Utility functions for table formatting
    ```bash
    node cli-scripts/table-utils.js
    ```

17. `repeat-script.js`: Repeats script execution
    ```bash
    node cli-scripts/repeat-script.js
    ```

### CLI Game (`cli-game/`)

The `cli-game/` directory contains a command-line interface version of the limbo game:

- `limbo`: Shell script wrapper for CLI game
- `init-game.js`: Initialize CLI game session
- `continue-game.js`: Continue CLI game simulation
- `game-session.json`: Game session data storage

```bash
# Start CLI game with default balance
./cli-game/limbo

# Start CLI game with custom balance
./cli-game/limbo 5000
```

### Output Files

The outcome generators create CSV files in the `csv-output/` directory:
- `outcomes-<timestamp>.csv`: All round multipliers (columns: `Round,Multiplier`)
- `highest-outcomes.csv`: Highest multiplier per session (columns: `Round,Multiplier,TotalRounds`)
- `runtime-<timestamp>.csv`: Run-time length analysis (columns: `Run,Length,BelowThreshold`)

## Project Structure

```
limbo-game/
├── cli-scripts/            # CLI tools and utility scripts
│   ├── compare-providers.js    # Compare crypto providers
│   ├── cost-calculation.js     # Cost calculation functions
│   ├── csv-display.js          # CSV data display utility
│   ├── init-game.js            # Initialize game session
│   ├── multi-outcome-generator.js  # Multiple outcome generator
│   ├── outcome-generator.js    # Outcome generator
│   ├── outcome-range.js        # Outcome range analysis
│   ├── outcome-until-threshold.js  # Generate until threshold
│   ├── profit-calculation.js   # Profit calculation functions
│   ├── profit-simulation.js    # Profit simulation functions
│   ├── random-string-samples.js    # Random string samples
│   ├── randomStringGenerator.js    # Random string generator
│   ├── README.md               # CLI scripts documentation
│   ├── repeat-script.js        # Script repetition utility
│   ├── reset-game.js           # Reset game session
│   ├── table-utils.js          # Table formatting utilities
│   └── view-game-session.js    # View game session data
├── cli-game/               # Command-line game interface
│   ├── limbo               # Shell script wrapper
│   ├── init-game.js        # CLI game initialization
│   ├── continue-game.js    # CLI game continuation
│   └── game-session.json   # Game session storage
├── csv-output/             # Generated CSV files from CLI tools
├── public/                 # Static files served by Express
│   ├── index.html         # Main application HTML
│   ├── script.js          # Client-side JavaScript
│   ├── style.css          # Application styles
│   └── verifier.html      # Bet verifier interface
├── docs/                  # Documentation
│   ├── compare-providers.md    # Provider comparison guide
│   ├── deployment.md      # Deployment instructions
│   ├── developer-guide.md # Developer documentation
│   └── user-guide.md      # User guide
├── crypto.bch.js         # Provably fair algorithm (BCH implementation)
├── crypto.bustadice.js   # Provably fair algorithm (Bustadice implementation)
├── crypto.provider.js    # Crypto provider abstraction
├── crypto.stake.js       # Provably fair algorithm (Stake implementation)
├── get-results.js        # Results retrieval utility
├── server.js             # Express server and API endpoints
├── package.json          # Dependencies and scripts
├── package-lock.json     # Locked dependency versions
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