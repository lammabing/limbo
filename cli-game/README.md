# CLI Game - Limbo Command Line Interface

A terminal-based version of the Limbo provably fair crypto game.

## Overview

The `cli-game/` directory contains a command-line interface for playing Limbo and running betting simulations directly from the terminal, without using the web interface.

## Quick Start

```bash
# Initialize a new game session with default balance (1000)
./cli-game/limbo init

# Initialize with custom balance
./cli-game/limbo init 5000

# Run a simulation
./cli-game/limbo play 2.0 10 2 5
```

## Commands

### init [balance]

Initialize a new game session with an optional starting balance.

**Parameters:**
- `balance` (optional): Starting balance for the game session (default: 1000)

**Examples:**
```bash
# Initialize with default 1000 balance
./cli-game/limbo init

# Initialize with 5000 balance
./cli-game/limbo init 5000
```

**Output:**
Creates a `game-session.json` file with:
- Client seed (randomly generated)
- Server seed (randomly generated)
- Initial nonce (0)
- Starting balance
- Session history (empty)

---

### play <targetMultiplier> <initialBet> <betMultiplier> <numberOfBets>

Run a betting simulation with martingale strategy.

**Parameters:**
- `targetMultiplier`: The multiplier threshold for winning (e.g., 2.0 for 2x)
- `initialBet`: The starting bet amount
- `betMultiplier`: The factor by which to increase the bet after losses (e.g., 2 for doubling)
- `numberOfBets`: Maximum number of bets to attempt

**Examples:**
```bash
# Play with 2x target, 10 initial bet, double on loss, up to 5 bets
./cli-game/limbo play 2.0 10 2 5

# Play with 3x target, 5 initial bet, 1.5x progression, up to 10 bets
./cli-game/limbo play 3.0 5 1.5 10
```

**Behavior:**
- Uses fixed seeds from the initialized session
- Increments nonce for each bet
- Applies martingale progression on losses
- Resets to initial bet on win
- Stops if a win results in overall positive profit
- Stops if the balance is insufficient for the next bet

---

### help

Display available commands and usage information.

```bash
./cli-game/limbo help
```

---

## Game Session File

The game state is stored in `cli-game/game-session.json`:

```json
{
  "clientSeed": "aB3dE5gH7jK9mN1pQ3sT5vW7yZ2bD4fH",
  "serverSeed": "xY9wV7uT5sR3qP1oN9mL7kJ5iH3gF1eD",
  "nonce": 0,
  "balance": 1000,
  "startingBalance": 1000,
  "roundDownMonetaryValues": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "sessionHistory": [],
  "cumulativeProfit": 0
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `clientSeed` | string | Client-provided seed for provably fair system |
| `serverSeed` | string | Server-provided seed for provably fair system |
| `nonce` | number | Current nonce (increments with each bet) |
| `balance` | number | Current balance |
| `startingBalance` | number | Initial balance at session start |
| `roundDownMonetaryValues` | boolean | Whether to round down monetary values |
| `createdAt` | string | ISO timestamp of session creation |
| `sessionHistory` | array | History of simulations (params, results, timestamp) |
| `cumulativeProfit` | number | Total profit/loss for the session |

Each `sessionHistory` entry contains:
- `simulationParams`: `targetMultiplier`, `initialBet`, `betMultiplier`, `numberOfBets`
- `results`: `totalProfit`, `totalWagered` (sum of all bets placed), `wins`, `losses`, `winningBetAmounts` (bet placed on each winning round), `winningPayouts` (win amount paid per winning round), `startingBalance`, `finalBalance`, `cumulativeProfit`, `startNonce`, `finalNonce`
- `timestamp`: When the simulation ran

---

## Scripts

### limbo

Main bash script that provides the CLI interface.

**Location:** `cli-game/limbo`

**Usage:** See Commands section above.

---

### init-game.js

Initializes a new game session.

**Location:** `cli-game/init-game.js`

**Direct Usage:**
```bash
node cli-game/init-game.js [startingBalance] [roundDownMonetaryValues]
```

**Parameters:**
- `startingBalance`: Initial balance (default: 1000)
- `roundDownMonetaryValues`: Round down monetary values (default: true)

---

### continue-game.js

Continues a game simulation using existing session seeds.

**Location:** `cli-game/continue-game.js`

**Direct Usage:**
```bash
node cli-game/continue-game.js <targetMultiplier> <numberOfBets> [initialBet] [betMultiplier]
```

**Parameters:**
- `targetMultiplier`: Target multiplier for winning
- `numberOfBets`: Maximum number of bets (or until balance is insufficient)
- `initialBet`: Starting bet amount (default: 1)
- `betMultiplier`: Martingale progression factor (default: 1)

**Output:**
- **Summary table**: Rounds, Wins, Losses, Total Bets, Start Balance, Final Balance, Profit, Cumulative Profit
- **Details table**: Target Multiplier, Initial Bet, Winning Round Bet and Win Amount (shown when at least one win occurred), win probability P(X≥target, n=bets), Bet Multiplier, Start/Final Nonce
- All numeric values and amounts are displayed with two decimal places

---

### create-start-function.sh

Shell script for creating start functions (utility script).

---

### function-iteration.js

Runs `continueSimulate` sequentially for every parameter combination defined in `params.json` (or a custom JSON config).

**Direct Usage:**
```bash
node cli-game/function-iteration.js [config.json]
```

---

### repeat-script.js

Repeats any node script N times, passing arguments through unchanged.

**Direct Usage:**
```bash
node cli-game/repeat-script.js <N> -- <script> [args...]
```

---

## Provably Fair System

The CLI game uses the same provably fair system as the web interface:

1. **Fixed Seeds**: Client and server seeds are generated once at session start
2. **Incrementing Nonce**: Each bet uses an incremented nonce
3. **HMAC-SHA256**: Outcomes are calculated using cryptographic hashing
4. **Verifiable**: All results can be verified using the seeds and nonce

### Crypto Provider

The CLI game uses the same crypto provider configuration as the main game:

```bash
# Use BCH provider (default)
./cli-game/limbo play 2.0 10 2 5

# Use Bustadice provider
CRYPTO_PROVIDER=bustadice ./cli-game/limbo play 2.0 10 2 5

# Use Stake provider
CRYPTO_PROVIDER=stake ./cli-game/limbo play 2.0 10 2 5
```

---

## Betting Strategy

The CLI game implements a martingale-style betting strategy:

1. **Start**: Bet the initial bet amount
2. **On Loss**: Multiply bet by the bet multiplier (e.g., double with 2x)
3. **On Win**: Reset to initial bet amount
4. **Stop Condition**: Stop if a win results in overall positive profit
5. **Stop Condition**: Stop if the balance is insufficient for the next bet

### Example Session

```bash
# Initialize with 1000 balance
./cli-game/limbo init 1000

# Play with martingale strategy
./cli-game/limbo play 2.0 10 2 5
```

**Sample Output:**
```
Playing game with parameters: target_multiplier=2.0, initial_bet=10, bet_multiplier=2, number_of_bets=5
WIN! Round 2: Outcome 15.14x (Target: 2.00x)
Simulation stopped after round 2 as win resulted in positive profit (10.00).
┌──────┬────┬──────┬──────────┬─────────────┬─────────────┬──────┬─────────────────┐
│Rounds│Wins│Losses│Total Bets│Start Balance│Final Balance│Profit│Cumulative Profit│
├──────┼────┼──────┼──────────┼─────────────┼─────────────┼──────┼─────────────────┤
│     2│   1│     1│     30.00│      1237.46│      1247.46│+10.00│           247.46│
└──────┴────┴──────┴──────────┴─────────────┴─────────────┴──────┴─────────────────┘
┌─────────────────┬──────┐
│Property         │ Value│
├─────────────────┼──────┤
│Target Multiplier│ 2.00x│
│Initial Bet      │ 10.00│
│Winning Round Bet│ 20.00│
│Win Amount       │ 40.00│
│P(X≥2.00, n=5)   │96.88%│
│Bet Multiplier   │ 2.00x│
│Start Nonce      │    86│
│Final Nonce      │    88│
└─────────────────┴──────┘
```

The **Summary table** shows the aggregate outcome of the simulation, including **Total Bets** (the accumulated sum of all bet amounts placed).

The **Details table** shows the simulation parameters and:
- **Winning Round Bet**: The bet amount that was placed on the winning round (initial bet escalated by the bet multiplier once per preceding loss)
- **Win Amount**: The payout of the winning round (winning round bet × target multiplier)
- Both rows only appear when at least one win occurred

---

## Comparison with Web Interface

| Feature | CLI Game | Web Interface |
|---------|----------|---------------|
| Interface | Terminal | Browser |
| Animation | None | Visual multiplier animation |
| Betting | Simulation only | Manual and Auto modes |
| Session Management | File-based (game-session.json) | Server-side file (game-session.json) + localStorage |
| Best For | Batch testing, analysis | Interactive play |

---

## Troubleshooting

### "game-session.json not found"

Initialize a new session first:
```bash
./cli-game/limbo init
```

### "Unknown command"

Use `help` to see available commands:
```bash
./cli-game/limbo help
```

### Permission denied (Linux/Mac)

Make the script executable:
```bash
chmod +x ./cli-game/limbo
```

---

## See Also

- [CLI Scripts](../cli-scripts/README.md) - Additional CLI tools for analysis
- [API Documentation](../docs/api.md) - REST API documentation
- [User Guide](../docs/user-guide.md) - Web interface user guide
- [Developer Guide](../docs/developer-guide.md) - Technical documentation
