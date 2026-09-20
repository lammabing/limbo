# Limbo CLI Game - Web Interface

A web-based interface for the Limbo CLI Game with an HTTP server. This provides the same provably fair game mechanics as the CLI version, but with a browser-based UI.

## Quick Start

```bash
# Start the server
npm start

# Or run directly
node server.js
```

The web interface will be available at: **http://localhost:3146**

## Features

- **Initialize Game Session**: Generate client/server seeds and set starting balance
- **Run Simulations**: Configure target multiplier, bet amount, bet progression, and number of bets
- **Progress Bar**: Visual feedback while a simulation runs on the server
- **Result Tables**: Summary (rounds, wins/losses, total bets, balances, profit) and details (target multiplier, initial bet, winning round bet, win amount, win probability) - identical information to the CLI output
- **Session Persistence**: Game state persists across page refreshes
- **Provably Fair**: Uses the same HMAC-SHA256 algorithm as the CLI version

## Usage

### 1. Initialize a Game Session

1. Enter your desired starting balance (default: 1000)
2. Optionally enable "Round Down Monetary Values" for integer-only amounts
3. Click "Initialize Session"

### 2. Run a Simulation

1. **Target Multiplier**: The multiplier threshold for winning (e.g., 2.0x)
2. **Initial Bet**: Starting bet amount
3. **Bet Multiplier**: Factor to increase bet after losses (e.g., 2x for martingale)
4. **Number of Bets**: Maximum bets to make (simulation stops early on win with positive profit)

### 3. View Results

- **Summary Statistics**: Rounds, wins, losses, total bets, start/final balance, profit, cumulative profit
- **Winning Round Info**: Actual multiplier rolled on the winning round, the bet amount placed on it, and the win amount paid out (bet x target multiplier) - shown when at least one win occurred
- **Session Info**: Current seeds, nonce, balance, and session count

## API Endpoints

The server provides RESTful API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/init` | Initialize game session |
| POST | `/api/simulate` | Run simulation |
| GET | `/api/state` | Get current game state |
| POST | `/api/reset` | Reset game |
| GET | `/api/history` | Get session history |

### Example API Usage

```bash
# Initialize game
curl -X POST http://localhost:3146/api/init \
  -H "Content-Type: application/json" \
  -d '{"startingBalance": 1000, "roundDownMonetaryValues": true}'

# Run simulation
curl -X POST http://localhost:3146/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"targetMultiplier": 2.0, "initialBet": 10, "betMultiplier": 2, "numberOfBets": 100}'

# Get current state
curl http://localhost:3146/api/state

# Reset game
curl -X POST http://localhost:3146/api/reset
```

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3146)

```bash
PORT=8080 npm start
```

## Game Mechanics

The game uses the same provably fair algorithm as the CLI version:

1. **Seed Generation**: Client and server seeds are generated using cryptographically secure random bytes
2. **Multiplier Calculation**: Uses HMAC-SHA256 to generate provably fair outcomes
3. **House Edge**: 2% house edge (same as CLI version)
4. **Nonce**: Increments with each bet to ensure unique results

### Win Condition

You win when the generated multiplier is **equal to or greater than** your target multiplier.

### Payout

```
Payout = Bet Amount × Target Multiplier
```

### Simulation Logic

- After a **win**: Bet resets to initial amount
- After a **loss**: Bet is multiplied by the bet multiplier
- Simulation **stops early** when:
  - A win results in positive total profit
  - Balance is insufficient for the next bet

## File Structure

```
/mnt/g/www/limbo/cli-game/
├── server.js              # HTTP server with API endpoints
├── web-interface.html     # Web UI (HTML/CSS/JS)
├── package.json           # NPM package configuration
├── limbo                  # Bash CLI wrapper (init/play/help)
├── init-game.js           # CLI game initialization
├── continue-game.js       # CLI game continuation
├── function-iteration.js  # Batch simulation runner (params.json)
├── repeat-script.js       # Script repetition utility
├── params.json            # Default parameters for function-iteration.js
├── game-session.json      # Game session storage
└── WEB-README.md          # This file
```

## Differences from CLI Version

| Feature | CLI Version | Web Version |
|---------|-------------|-------------|
| Interface | Command line | Browser UI |
| Input | Command arguments | Form fields |
| Output | Terminal tables | Visual dashboard |
| State Storage | JSON file | JSON file + localStorage |
| Multiplayer | No | No (single user) |

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Server won't start

- Check if port 3146 is already in use
- Try a different port: `PORT=8080 node server.js`

### "No game session found" error

- Initialize a game session first using the "Initialize Session" button

### Simulation fails

- Ensure you have sufficient balance for the initial bet
- Check that all input values are valid (positive numbers)

## License

ISC
