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
/mnt/g/www/crypto/
├── public/                 # Static files served by Express
│   ├── index.html         # Main application HTML
│   ├── script.js          # Client-side JavaScript
│   └── style.css          # Application styles
├── docs/                  # Documentation
│   ├── api.md            # API documentation
│   ├── user-guide.md      # User guide
│   ├── developer-guide.md # Developer documentation
│   └── deployment.md     # Deployment instructions
├── crypto.bch.js         # Provably fair algorithm implementation
├── crypto.bustadice.js   # Alternative crypto algorithm implementation
├── server.js             # Express server and API endpoints
├── outcome-generator.js  # CLI tool for generating game outcomes
├── multi-outcome-generator.js # CLI tool for generating multiple game outcomes
├── main.js               # Alternative game logic implementation
├── package.json          # Project dependencies and scripts
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

The provably fair algorithm implementation:

```javascript
function getMultiplier(nonce, clientSeed = '', serverSeed = '', houseEdge = 0.02) {
    // Generate HMAC-SHA256 hash
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(`${clientSeed}:${nonce}:${currentRound}`);
    const buffer = hmac.digest();
    
    // Convert to float and calculate multiplier
    const float = bytesToFloat(buffer);
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

The application will be available at `http://localhost:3000`.

### Development Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## CLI Tools

The project includes command-line tools for generating game outcomes:

1. `outcome-generator.js`: Generates outcomes for a specified number of rounds
   ```bash
   node outcome-generator.js <clientSeed> <serverSeed> <n> [threshold]
   ```

2. `multi-outcome-generator.js`: Runs multiple iterations of outcome generation
   ```bash
   node multi-outcome-generator.js <iterations> <rounds> [threshold]
   ```

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
- `docs/api.md`: API endpoint documentation (if available)

## Contributing

The project follows standard contribution practices:

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

See the `README.md` file for more details on contributing.