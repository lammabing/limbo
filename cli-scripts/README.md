# CLI Scripts Documentation

This directory contains command-line scripts for simulating and managing the limbo game session.

## New Game Session Scripts

### init-game.js
Initializes a new game session by generating and fixing seeds for a session. Creates a JSON file with initial game state including clientSeed, serverSeed, and initial nonce. Subsequent games will use these seeds with an incremented nonce.

**Usage:**
```bash
node cli-scripts/init-game.js
```

### continue-simulate.js
Continues a game simulation using the fixed seeds from init-game.js. Updates the nonce for each game played and records the results. The simulation will automatically stop if a win results in an overall positive profit.

**Parameters:**
- `targetMultiplier`: The multiplier threshold for winning
- `initialBet`: The starting bet amount
- `betMultiplier`: The factor by which to increase the bet after losses
- `numberOfBets`: The maximum number of bets to make

**Usage:**
```bash
node cli-scripts/continue-simulate.js <targetMultiplier> <initialBet> <betMultiplier> <numberOfBets>
```

**Example:**
```bash
node cli-scripts/continue-simulate.js 2 10 2 5
```

### reset-game.js
Resets the game session by deleting the game-session.json file. This allows for a fresh initialization with new seeds.

**Usage:**
```bash
node cli-scripts/reset-game.js
```

### view-game-session.js
Displays the current game session information, including client seed, server seed, current nonce, and session history.

**Usage:**
```bash
node cli-scripts/view-game-session.js
```

## Existing Scripts

### outcome-generator.js
Generates outcomes for a specified number of rounds.

**Usage:**
```bash
node cli-scripts/outcome-generator.js <rounds> [threshold] [clientSeed] [serverSeed]
```

### multi-outcome-generator.js
Runs multiple iterations of outcome generation.

**Usage:**
```bash
node cli-scripts/multi-outcome-generator.js <iterations> <rounds> [threshold]
```

### profit-calculation.js
Calculates profit for betting systems based on geometric progression.

**Usage:**
```bash
node cli-scripts/profit-calculation.js <w> <m> <x> <a>
```

### profit-simulation.js
Simulates betting systems with provably fair mechanics.

**Usage:**
```bash
node cli-scripts/profit-simulation.js <m> <x> <a>
```

### cost-calculation.js
Calculates total cost of bets based on initial bet, multiplier, and number of bets.

**Usage:**
```bash
node cli-scripts/cost-calculation.js <initialBet> <betMultiplier> <numberOfBets>
```

### randomStringGenerator.js
Generates random strings with configurable options.

**Usage:**
```bash
node cli-scripts/randomStringGenerator.js
```

### random-string-samples.js
Demonstrates various configurations of the random string generator with clipboard support.

**Usage:**
```bash
node cli-scripts/random-string-samples.js
```