# Limbo Game - Provably Fair Crypto Game

## Project Overview

This is a modern, responsive limbo/target game with both manual and automated betting modes. Built with Node.js, Express, and vanilla JavaScript, featuring a provably fair system using cryptographic algorithms.

The game simulates a crypto betting experience where players can place bets on multiplier outcomes. The core mechanism uses a provably fair system to ensure that all game outcomes are fair and can be verified by players.

## Technologies Used

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Cryptography**: Node.js crypto module (HMAC-SHA256)
- **Styling**: CSS3 with flexbox and grid layouts
- **Icons**: Font Awesome

## Project Structure

```
/mnt/g/www/limbo/
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
├── crypto.bch.js         # Provably fair algorithm implementation (BCH)
├── crypto.bustadice.js   # Alternative crypto algorithm implementation (Bustadice)
├── crypto.provider.js    # Crypto provider abstraction
├── crypto.stake.js       # Alternative crypto algorithm implementation (Stake)
├── get-results.js        # Results retrieval utility
├── server.js             # Express server and API endpoints
├── package.json          # Project dependencies and scripts
├── package-lock.json     # Locked dependency versions
└── README.md             # Project overview
```

## Core Components

### 1. Game State Management (`public/script.js`)

The client-side game state is managed through a central `gameState` object:

```javascript
const gameState = {
    balance: 10000,
    currentBet: 0,
    currentTarget: 0,
    gameActive: false,
    autoModeActive: false,
    nonce: 0,
    clientSeed: '',
    serverSeed: '',
    gameHistory: [],
    stats: {
        totalBets: 0,
        wins: 0,
        losses: 0,
        totalWagered: 0,
        netProfit: 0
    }
};
```

### 2. Server Implementation (`server.js`)

The server implements RESTful endpoints for game operations:

- `POST /play`: Main game endpoint that calculates multipliers and determines wins/losses
- `POST /generateSeeds`: Generates new client and server seeds
- `POST /verify`: Verifies game results for fairness
- `POST /getSeeds`: Gets seed information for verification

### 3. Cryptographic Module (`crypto.bch.js`)

The provably fair algorithm implementation uses generator functions for efficient byte and float generation:

```javascript
function getMultiplier(nonce, clientSeed = '', serverSeed = '', houseEdge = 0.02) {
    // Generator for HMAC-SHA256 bytes
    function* bytesGenerator(serverSeed, clientSeed, nonce) {
        let currentRound = 0;
        let currentRoundCursor = 0;

        while (true) {
            const hmac = crypto.createHmac('sha256', serverSeed);
            hmac.update(`${clientSeed}:${nonce}:${currentRound}`);
            const buffer = hmac.digest();

            while (currentRoundCursor < 32) {
                yield buffer[currentRoundCursor];
                currentRoundCursor += 1;
            }

            currentRoundCursor = 0;
            currentRound += 1;
        }
    }

    // Generator for floating point numbers
    function* floatsGenerator(serverSeed, clientSeed, nonce) {
        const byteRng = bytesGenerator(serverSeed, clientSeed, nonce);

        while (true) {
            const bytes = Array(4).fill(0).map(() => byteRng.next().value);
            const float = bytes.reduce((result, value, i) => {
                const divider = 256 ** (i + 1);
                return result + (value / divider);
            }, 0);
            yield float;
        }
    }

    // Calculate multiplier with house edge
    const float = floatsGenerator(serverSeed, clientSeed, nonce).next().value;
    const m = 100_000_000;
    const n = Math.floor(float * m) + 1;
    const crashPoint = Math.max((m / n) * (1 - houseEdge), 1);

    return Math.floor(crashPoint * 100) / 100;
}
```

## Game Modes

### Manual Mode

Players can place individual bets with custom bet amounts and target multipliers. The game animates the multiplier from 1.00x to the result, and players win if the result is equal to or higher than their target.

### Auto Mode

Automated betting with advanced strategies including:
- Stop loss/take profit limits
- Bet progression (martingale)
- Auto-target adjustment
- Configurable number of rounds

## Provably Fair System

The game uses a provably fair system to ensure that all game outcomes are fair and can be verified:

1. **Seed Generation**: Client and server seeds are generated for each game session
2. **Nonce**: A counter that increments with each bet to ensure unique results
3. **Hashing**: The seeds and nonce are combined using HMAC-SHA256 to generate a random number
4. **Multiplier Calculation**: The random number is converted to a multiplier with a house edge

Players can verify any game result using the client seed, server seed, and nonce, ensuring complete transparency.

## Building and Running

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3145`.

### Development Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "start:bustadice": "CRYPTO_PROVIDER=bustadice node server.js",
    "start:stake": "CRYPTO_PROVIDER=stake node server.js",
    "generate:bch": "node cli-scripts/outcome-generator.js",
    "generate:bustadice": "CRYPTO_PROVIDER=bustadice node cli-scripts/outcome-generator.js",
    "generate:stake": "CRYPTO_PROVIDER=stake node cli-scripts/outcome-generator.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## CLI Tools

The project includes comprehensive command-line tools for generating game outcomes, simulating betting strategies, and managing game sessions.

### Game Session Management

1. `init-game.js`: Initializes a game session by generating and fixing seeds
   ```bash
   node cli-scripts/init-game.js
   ```

2. `continue-simulate.js`: Continues a game simulation using fixed seeds
   ```bash
   node cli-scripts/continue-simulate.js <targetMultiplier> <initialBet> <betMultiplier> <numberOfBets>
   ```

3. `reset-game.js`: Resets the game session
   ```bash
   node cli-scripts/reset-game.js
   ```

4. `view-game-session.js`: Displays current game session information
   ```bash
   node cli-scripts/view-game-session.js
   ```

### Outcome Generation & Analysis

5. `outcome-generator.js`: Generates outcomes for specified number of rounds
   ```bash
   node cli-scripts/outcome-generator.js <rounds> [threshold] [clientSeed] [serverSeed]
   ```
   Creates CSV files in `csv-output/`:
   - `outcomes-<timestamp>.csv`: All round multipliers (columns: `Round,Multiplier`)
   - `highest-outcomes.csv`: Highest multiplier per session
   - `runtime-<timestamp>.csv`: Run-time length analysis

6. `multi-outcome-generator.js`: Runs multiple iterations of outcome generation
   ```bash
   node cli-scripts/multi-outcome-generator.js <iterations> <rounds> [threshold]
   ```

7. `outcome-range.js`: Analyzes outcomes within a specific range
   ```bash
   node cli-scripts/outcome-range.js
   ```

8. `outcome-until-threshold.js`: Generates outcomes until threshold is reached
   ```bash
   node cli-scripts/outcome-until-threshold.js
   ```

### Profit & Cost Calculations

9. `profit-calculation.js`: Calculates profit for betting systems
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

12. `randomStringGenerator.js`: Generates random strings
    ```bash
    node cli-scripts/randomStringGenerator.js
    ```

13. `random-string-samples.js`: Random string samples with clipboard support
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

16. `table-utils.js`: Table formatting utilities
    ```bash
    node cli-scripts/table-utils.js
    ```

17. `repeat-script.js`: Script repetition utility
    ```bash
    node cli-scripts/repeat-script.js
    ```

### CLI Game (`cli-game/`)

The `cli-game/` directory contains a command-line interface version:
- `limbo`: Shell script wrapper
- `init-game.js`: Initialize CLI game
- `continue-game.js`: Continue CLI game

## Development Conventions

### Code Style

- Uses vanilla JavaScript without frameworks
- Follows modern ES6+ syntax where appropriate
- Uses consistent naming conventions
- Comments explain complex logic

### Architecture

- Client-server architecture with clear separation of concerns
- RESTful API design
- Modular code organization
- State management on both client and server

### Security

- Input validation on both client and server
- Cryptographically secure random number generation
- Provably fair system for outcome verification
- Error handling for all API endpoints

## Deployment

The application can be deployed to various environments including:

- Local development setup
- Production deployment with PM2
- Cloud platforms (Heroku, AWS, Google Cloud, DigitalOcean)
- Docker containers

See `docs/deployment.md` for detailed deployment instructions.

## Documentation

The project includes comprehensive documentation:

- `README.md`: Project overview and getting started guide
- `docs/user-guide.md`: Detailed instructions for using the game
- `docs/developer-guide.md`: Technical information for developers
- `docs/deployment.md`: Instructions for deploying the application
- `docs/compare-providers.md`: Crypto provider comparison guide

## Contributing

The project follows standard contribution practices:

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

See the `README.md` file for more details on contributing.