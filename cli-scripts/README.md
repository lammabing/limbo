# CLI Scripts Documentation

This directory contains command-line scripts for simulating and analyzing the limbo game.

## Table of Contents

1. [Outcome Generation & Analysis](#outcome-generation--analysis)
2. [Probability Calculations](#probability-calculations)
3. [Profit & Cost Calculations](#profit--cost-calculations)
4. [Game Session Management](#game-session-management)
5. [Utility Scripts](#utility-scripts)

---

## Outcome Generation & Analysis

### outcome-generator.js
Generates outcomes for a specified number of rounds using the configured crypto provider. Creates CSV files in the `csv-output/` directory.

**Parameters:**
- `rounds`: Number of rounds to generate (required)
- `threshold`: Minimum multiplier for analysis (optional)
- `clientSeed`: Client seed (optional, auto-generated)
- `serverSeed`: Server seed (optional, auto-generated)

**Flags:**
- `--suppress-rounds`: Suppress individual round output
- `--no-csv`: Skip CSV file generation

**Usage:**
```bash
node cli-scripts/outcome-generator.js <rounds> [threshold] [clientSeed] [serverSeed] [--suppress-rounds] [--no-csv]
```

**Output Files:**
- `outcomes-<timestamp>.csv`: All round multipliers (columns: `Round,Multiplier`)
- `runtime-<timestamp>.csv`: Run-time length analysis below threshold
- `highest-outcomes.csv`: Highest multiplier per session (appended)

### multi-outcome-generator.js
Runs multiple iterations of outcome generation with random seeds for statistical analysis.

**Parameters:**
- `iterations`: Number of iterations to run
- `rounds`: Number of rounds per iteration
- `threshold`: Minimum multiplier for analysis (optional)

**Flags:**
- `--suppress-rounds` / `--suppress-output`: Suppress individual round output
- `--no-csv`: Skip CSV file generation

**Usage:**
```bash
node cli-scripts/multi-outcome-generator.js <iterations> <rounds> [threshold] [--no-csv] [--suppress-rounds]
```

### outcome-until-threshold.js
Generates outcomes until a specified multiplier threshold is reached. Appends results to `csv-output/outcome-results.csv`.

**Parameters:**
- `threshold`: Target multiplier to reach (required)
- `clientSeed`: Client seed (optional, auto-generated)
- `serverSeed`: Server seed (optional, auto-generated)

**Flags:**
- `--suppress-rounds`: Suppress individual round output
- `--no-csv`: Skip CSV file generation

**Usage:**
```bash
node cli-scripts/outcome-until-threshold.js <threshold> [clientSeed] [serverSeed] [--suppress-rounds] [--no-csv]
```

**Output CSV Columns:** `TotalRounds,FinalNonce,Threshold,AchievedMultiplier,ClientSeed,ServerSeed`

### outcome-range.js
Generates outcomes for a specific range of rounds and displays the top N highest multipliers.

**Parameters:**
- `startRound`: Starting round number (required)
- `endRound`: Ending round number (required)
- `n`: Number of top outcomes to display (optional, default: 10)
- `clientSeed`: Client seed (optional, auto-generated)
- `serverSeed`: Server seed (optional, auto-generated)

**Flags:**
- `--suppress-rounds`: Suppress individual round output
- `--no-csv`: Skip CSV file generation

**Usage:**
```bash
node cli-scripts/outcome-range.js <start-round> <end-round> [n] [clientSeed] [serverSeed] [--suppress-rounds] [--no-csv]
```

### compare-providers.js
Compares outcomes from different crypto providers (bch, bustadice, stake) using identical seeds.

**Parameters:**
- `rounds`: Number of rounds to compare (required)
- `clientSeed`: Client seed (optional)
- `serverSeed`: Server seed (optional)

**Usage:**
```bash
node cli-scripts/compare-providers.js <rounds> [clientSeed] [serverSeed]
```

---

## Probability Calculations

### prob-xn.js
Calculates the probability that at least one of n repeated trials attains a value >= x.

Based on the limbo distribution: `P(X >= x) = 1/x` for a single trial.
Formula: `P(at least one >= x in n trials) = 1 - (1 - 1/x)^n`

**Parameters:**
- `x`: Target threshold (>= 1)
- `n`: Single number of trials, or `[nMin] [nMax]` for a range
- `format`: Output format — `table` (default) or `column`

**Usage:**
```bash
node cli-scripts/prob-xn.js <x> <n> [format]
node cli-scripts/prob-xn.js <x> <nMin> <nMax> [format]
```

### prob-xn-edge.js
Same as `prob-xn.js` but factors in house edge. Default house edge is `0.02` (2%), sourced from `crypto.bch.js` where `crashPoint = (m / n) * (1 - houseEdge)`.

Formula: `P(at least one >= x in n trials) = 1 - (1 - (1 - edge) / x)^n`

**Parameters:**
- `x`: Target threshold (>= 1)
- `n`: Single number of trials, or `[nMin] [nMax]` for a range
- `--edge <value>`: House edge (default: 0.02, requires 0 <= edge < 1)
- `format`: Output format — `table` (default) or `column`

**Usage:**
```bash
node cli-scripts/prob-xn-edge.js <x> <n> [--edge <value>] [format]
node cli-scripts/prob-xn-edge.js <x> <nMin> <nMax> [--edge <value>] [format]
```

### probability-utils.js
Provides forward calculation (probability given n trials) and inverse calculation (trials needed for target probability).

**Parameters:**
- `x`: Target threshold (default: 42)
- `mode`: `forward` or `f` (default), `inverse` or `i`

**Usage:**
```bash
node cli-scripts/probability-utils.js [x] [mode]
```

### probability-table.js
Generates a compact probability table across ranges of thresholds and trial counts. Multiplies probability by a hardcoded house edge factor (0.98).

**Parameters:**
- `xMin`: Minimum threshold (default: 2)
- `xMax`: Maximum threshold (default: 10)
- `nMin`: Minimum trials (default: 2)
- `nMax`: Maximum trials (default: 20)

**Usage:**
```bash
node cli-scripts/probability-table.js [xMin] [xMax] [nMin] [nMax]
```

---

## Profit & Cost Calculations

### profit-calculation.js
Calculates profit for a betting system based on geometric progression (martingale-style betting).

**Parameters:**
- `w`: Number of bets placed (losses before win)
- `m`: Win multiplier (payout odds)
- `x`: Bet multiplier (martingale factor)
- `a`: Initial bet amount

**Usage:**
```bash
node cli-scripts/profit-calculation.js <w> <m> <x> <a>
```

### profit-simulation.js
Simulates a betting system with provably fair mechanics using the crypto provider. Generates random seeds per simulation and stops when balance reaches zero.

**Parameters:**
- `m`: Target multiplier for winning
- `x`: Bet multiplier (martingale factor)
- `a`: Initial bet amount
- `startingBalance`: Starting balance (optional, default: 1000)

**Usage:**
```bash
node cli-scripts/profit-simulation.js <m> <x> <a> [startingBalance]
```

### cost-calculation.js
Calculates total cost of a series of bets following a geometric progression.

**Parameters:**
- `initialBet`: Initial bet amount
- `betMultiplier`: Multiplier applied each subsequent bet
- `numberOfBets`: Number of bets in the series

**Usage:**
```bash
node cli-scripts/cost-calculation.js <initialBet> <betMultiplier> <numberOfBets>
```

---

## Game Session Management

### reset-game.js
Resets the game session by deleting the `game-session.json` file, allowing fresh initialization with new seeds.

**Usage:**
```bash
node cli-scripts/reset-game.js
```

### view-game-session.js
Displays the current game session information including client seed, server seed, current nonce, and session history.

**Usage:**
```bash
node cli-scripts/view-game-session.js
```

---

## Utility Scripts

### randomStringGenerator.js
Generates random strings with configurable options (length, character types). Used as a module by other scripts.

**Options (object):**
- `length`: String length (default: 32)
- `includeUppercase`: Include A-Z (default: false)
- `includeLowercase`: Include a-z (default: true)
- `includeNumbers`: Include 0-9 (default: true)
- `includeSymbols`: Include special characters (default: false)
- `customChars`: Additional custom characters
- `excludeChars`: Characters to exclude

**Usage:**
```bash
node cli-scripts/randomStringGenerator.js
```

### random-string-samples.js
Demonstrates various configurations of the random string generator with optional clipboard support.

**Usage:**
```bash
node cli-scripts/random-string-samples.js
```

### csv-display.js
Displays a CSV file's content as an aligned table in the terminal.

**Parameters:**
- `csv-file-path`: Path to the CSV file to display

**Usage:**
```bash
node cli-scripts/csv-display.js <csv-file-path>
```

### repeat-script.js
Repeats execution of another script a specified number of times for batch testing.

**Usage:**
```bash
node cli-scripts/repeat-script.js <N> -- <script> [args...]
```

### table-utils.js
Utility functions for table formatting. Used as a module by other scripts.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CRYPTO_PROVIDER` | Crypto provider to use (bch, bustadice, stake) | `bch` |

**Example:**
```bash
CRYPTO_PROVIDER=bustadice node cli-scripts/outcome-generator.js 100
```

---

## Output Directory

All generated CSV files are stored in the `csv-output/` directory at the project root.

---

## See Also

- [CLI Game](../cli-game/README.md) - Command-line interface version of the limbo game
- [API Documentation](../docs/api.md) - REST API documentation
- [User Guide](../docs/user-guide.md) - User guide for the web interface
