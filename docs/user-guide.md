# User Guide - Limbo Game

This guide provides detailed instructions on how to use the Limbo Game, including explanations of game modes, features, and strategies.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Game Interface](#game-interface)
3. [Manual Mode](#manual-mode)
4. [Auto Mode](#auto-mode)
5. [Understanding Provably Fair](#understanding-provably-fair)
6. [Game Statistics](#game-statistics)
7. [Betting Strategies](#betting-strategies)
8. [Mobile Usage](#mobile-usage)
9. [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing the Game

1. Open your web browser
2. Navigate to the game URL (e.g., `http://localhost:3255`)
3. The game will load with a starting balance of 10,000

### Initial Setup

When you first load the game, new client and server seeds are automatically generated for your session. You can generate new seeds at any time by clicking the "Generate New Seeds" button in the Provably Fair tab.

## Game Interface

### Main Components

1. **Header**: Contains the game logo and your current balance
2. **Game Display**: Shows the multiplier animation and game status
3. **Game Controls**: Contains betting options and game mode selection
4. **Game Information**: Contains tabs for History, Statistics, Provably Fair, and Help

### Navigation

The game interface is organized into tabs:

- **Manual/Auto**: Switch between manual and automated betting modes
- **History**: View your recent game results
- **Statistics**: See your overall performance metrics
- **Provably Fair**: Verify game fairness and manage seeds
- **Help**: Access game instructions and information

## Manual Mode

Manual mode allows you to place individual bets with full control over each bet.

### Placing a Bet

1. Ensure you're in the Manual mode (click the Manual tab if needed)
2. Enter your bet amount in the "Bet Amount" field
   - Use the + and - buttons to adjust the amount
   - Or click on the quick amount buttons (10, 50, 100, 500, 1000)
3. Set your target multiplier in the "Target Multiplier" field
   - Use the + and - buttons to adjust the multiplier
   - Or click on the quick multiplier buttons (1.5x, 2.0x, 3.0x, 5.0x, 10.0x)
4. Click "Place Bet" to start the game

### Game Flow

1. After placing a bet, the game will retrieve a multiplier from the server
2. The multiplier display will animate from 1.00x up to the result
3. If the final multiplier is equal to or higher than your target, you win!
   - Your profit is calculated as: bet amount × (target multiplier - 1)
4. If the final multiplier is lower than your target, you lose
   - Your loss is equal to your bet amount

### Example

- Bet Amount: 100
- Target Multiplier: 2.0x
- Game Result: 2.45x
- Outcome: Win! (2.45x ≥ 2.0x)
- Profit: 100 × (2.0 - 1) = 100

## Auto Mode

Auto mode allows you to automate your betting with customizable strategies.

### Configuring Auto Betting

1. Switch to Auto mode by clicking the Auto tab
2. Configure your betting strategy:

   **Base Settings**
   - **Base Bet Amount**: Your initial bet amount
   - **Base Target Multiplier**: Your initial target multiplier
   - **Number of Rounds**: How many bets to place automatically

   **Stop Conditions**
   - **Stop on Profit**: Stop auto betting if your profit reaches this amount
   - **Stop on Loss**: Stop auto betting if your loss reaches this amount

   **Advanced Options**
   - **On Loss, Multiply Bet By**: Multiplier for increasing bet after a loss (Martingale)
   - **Max Bet Multiplier**: Maximum multiplier for bet progression
   - **Auto Adjust Target**: Automatically adjust target based on game history

### Starting Auto Betting

1. After configuring your settings, click "Start Auto Bet"
2. The game will automatically place bets according to your strategy
3. You can stop auto betting at any time by clicking "Stop Auto Bet"

### Auto Mode Behavior

- **After a Win**: Bet amount resets to base bet amount
- **After a Loss**: Bet amount is multiplied by the bet progression multiplier
- **Auto Target Adjustment**: If enabled, target decreases after wins and increases after losses

### Example Strategy

- Base Bet Amount: 10
- Base Target Multiplier: 2.0x
- Number of Rounds: 10
- Stop on Profit: 500
- Stop on Loss: 500
- On Loss, Multiply Bet By: 2.0
- Max Bet Multiplier: 10.0

This strategy will:
1. Start with a 10 bet at 2.0x target
2. If you lose, double the bet (20, 40, 80, etc.)
3. If you win, reset to 10 bet
4. Stop if you reach +500 or -500 profit
5. Never exceed 10x the base bet (100)

## Understanding Provably Fair

The Limbo Game uses a provably fair system to ensure that all game outcomes are fair and verifiable.

### Key Concepts

- **Client Seed**: A random string generated on your device
- **Server Seed**: A random string generated on the server
- **Nonce**: A counter that increments with each bet

### How It Works

1. Before each bet, the server calculates a multiplier using:
   - Client seed
   - Server seed
   - Nonce
   - HMAC-SHA256 cryptographic algorithm

2. The result is completely determined by these values and cannot be manipulated

3. After the game, you can verify that the result was fair using the same seeds and nonce

### Verifying a Game

1. Go to the Provably Fair tab
2. Note the client seed, server seed, and nonce for a specific game
3. Click "Verify Bet"
4. The system will recalculate the multiplier using the same parameters
5. If the calculated multiplier matches the game result, the game was fair

## Game Statistics

### Available Metrics

- **Total Bets**: Total number of bets placed
- **Wins**: Number of winning bets
- **Losses**: Number of losing bets
- **Win Rate**: Percentage of bets that were wins
- **Total Wagered**: Total amount bet across all games
- **Net Profit**: Overall profit or loss

### Interpreting Statistics

- **Win Rate**: Higher percentages indicate more successful betting
- **Net Profit**: Positive values indicate overall profit, negative values indicate overall loss
- **Total Wagered**: Helps you understand your betting volume

## Betting Strategies

### Conservative Strategy

- **Target Multiplier**: 1.5x - 2.0x
- **Bet Amount**: 1-2% of your balance
- **Goal**: Consistent small wins with minimal risk

### Aggressive Strategy

- **Target Multiplier**: 5.0x - 10.0x
- **Bet Amount**: 0.5-1% of your balance
- **Goal**: Large wins with lower frequency

### Martingale Strategy

- **Target Multiplier**: 2.0x
- **Bet Progression**: Double after each loss
- **Goal**: Recover losses with a single win
- **Risk**: Can quickly deplete balance during losing streaks

### Auto Mode Strategies

1. **Conservative Auto**:
   - Base Bet: 1% of balance
   - Target: 1.5x
   - Stop Profit: 10% of balance
   - Stop Loss: 20% of balance

2. **Balanced Auto**:
   - Base Bet: 2% of balance
   - Target: 2.0x
   - Stop Profit: 20% of balance
   - Stop Loss: 30% of balance
   - Bet Multiplier: 1.5x

3. **Aggressive Auto**:
   - Base Bet: 1% of balance
   - Target: 5.0x
   - Stop Profit: 50% of balance
   - Stop Loss: 50% of balance
   - Bet Multiplier: 2.0x

## Mobile Usage

The Limbo Game is fully responsive and works on mobile devices.

### Mobile Interface

- **Touch-Friendly**: All buttons and controls are optimized for touch
- **Responsive Layout**: Interface adapts to different screen sizes
- **Performance**: Optimized for mobile browsers

### Mobile Tips

- **Landscape Mode**: Provides a better gaming experience on most devices
- **Stable Connection**: Ensure you have a stable internet connection
- **Battery Life**: Gaming can drain battery faster, consider plugging in

## Troubleshooting

### Common Issues

**Game Won't Load**
- Check your internet connection
- Try refreshing the page
- Clear your browser cache

**Bets Won't Place**
- Ensure you have sufficient balance
- Check that your bet amount is valid
- Verify your target multiplier is at least 1.01

**Auto Mode Not Working**
- Check that all required fields are filled
- Verify your stop conditions are reasonable
- Try stopping and restarting auto mode

**Statistics Not Updating**
- Refresh the page
- Check that you have an internet connection
- Try placing a manual bet to see if statistics update

### Getting Help

If you encounter issues not covered here:

1. Check the Help tab in the game interface
2. Review the API documentation for technical details
3. Contact support if available

### Best Practices

- **Responsible Gaming**: Set limits and stick to them
- **Balance Management**: Never bet more than you can afford to lose
- **Strategy Testing**: Test strategies with small amounts first
- **Regular Breaks**: Take breaks to maintain clear judgment

Remember that this is a game of chance, and outcomes are determined by random number generation. Always play responsibly.