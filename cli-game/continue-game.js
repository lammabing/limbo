/**
 * Continues a game simulation using the fixed seeds from init-game.js
 * Updates the nonce for each game played and records the results.
 *
 * Parameters:
 * - targetMultiplier: The multiplier threshold for winning
 * - numberOfBets: The number of bets to make
 * - initialBet: The starting bet amount (default: 1)
 * - betMultiplier: The factor by which to increase the bet after losses (default: 1)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Define the game state file path
const gameStateFile = path.join(__dirname, 'game-session.json');

// Import the multiplier function from the crypto module
const { getMultiplier } = require('../crypto.bch.js');

// Import currency formatting helper
const { formatCurrency } = require('../cli-scripts/table-utils.js');

function loadGameState() {
    try {
        const data = fs.readFileSync(gameStateFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Could not load game state from ${gameStateFile}. Please run init-game.js first.`);
    }
}

function roundMonetaryValue(value, gameState) {
    if (gameState.roundDownMonetaryValues) {
        return Math.floor(value);
    } else {
        return value;
    }
}

function roundBetAmount(value, gameState) {
    // When rounding monetary values, ensure bet amounts have a minimum value of 1
    // to prevent very small fractional bets from being rounded down to 0
    if (gameState.roundDownMonetaryValues) {
        const roundedValue = Math.floor(value);
        return Math.max(1, roundedValue); // Ensure minimum bet amount is 1
    } else {
        return value;
    }
}

function saveGameState(gameState) {
    fs.writeFileSync(gameStateFile, JSON.stringify(gameState, null, 2));
}

/**
 * Calculates the probability that at least one of n trials
 * attains a value >= x
 * Based on limbo distribution: P(X >= x) = 1/x for a single trial
 * Formula: P(at least one >= x in n trials) = 1 - (1 - 1/x)^n
 *
 * @param {number} x - Target threshold (>= 1)
 * @param {number} n - Number of trials
 * @returns {number} Probability (0-1)
 */
function probAtLeastOne(x, n) {
    if (x < 1) return 1;
    if (x === Infinity) return 0;
    if (n <= 0) return 0;

    return 1 - Math.pow(1 - 1 / x, n);
}

function continueSimulate(targetMultiplier, numberOfBets, initialBet = 1, betMultiplier = 1) {
    // Load the current game state
    let gameState = loadGameState();

    // Calculate the cumulative profit from all previous simulations
    const previousCumulativeProfit = gameState.sessionHistory.reduce((total, session) => {
        return total + (session.results.totalProfit || 0);
    }, 0);

    // Store simulation results
    const results = {
        targetMultiplier,
        initialBet,
        betMultiplier,
        numberOfBets,
        startNonce: gameState.nonce,
        finalNonce: null,
        totalProfit: 0,
        wins: 0,
        losses: 0,
        winningBetAmounts: [],
        winningPayouts: [],
        startingBalance: gameState.balance,  // Track the balance at the start of this simulation
        finalBalance: null
    };

    let currentBet = initialBet;
    let totalWagered = 0;
    let totalWon = 0;

    // Run the specified number of bets
    for (let i = 0; i < numberOfBets; i++) {
        // Store the original bet amount before any modifications for this round
        const originalBetAmount = currentBet;

        // Check if we have enough balance to place the bet
        if (gameState.balance < originalBetAmount) {
            console.log(`Cannot place bet of ${formatCurrency(originalBetAmount)} - insufficient balance (${formatCurrency(gameState.balance)}). Simulation ended.`);
            break;
        }

        // Calculate the multiplier for this round using the current nonce
        const multiplier = getMultiplier(gameState.nonce, gameState.clientSeed, gameState.serverSeed);

        // Determine if the player won
        const won = multiplier >= targetMultiplier;

        // Calculate payout if won
        let payout = 0;
        if (won) {
            payout = originalBetAmount * targetMultiplier;  // Use target multiplier for payout calculation
            payout = roundMonetaryValue(payout, gameState);
            totalWon += payout;
            // Reset bet to initial amount after a win
            currentBet = roundMonetaryValue(initialBet, gameState);
            results.wins++;
            // Record the bet amount that was placed on this winning round
            results.winningBetAmounts.push(originalBetAmount);
            // Record the win amount paid out for this winning round (bet * target multiplier)
            results.winningPayouts.push(payout);
            // Display the actual outcome multiplier on win
            console.log(`WIN! Round ${i + 1}: Outcome ${multiplier.toFixed(2)}x (Target: ${targetMultiplier.toFixed(2)}x)`);
        } else {
            // Increase bet for next round after a loss
            // Apply multiplier first, then round to avoid situations where small fractional bets
            // get rounded to 1 and stay at 1 when multiplier is less than 2
            currentBet = roundMonetaryValue(currentBet * betMultiplier, gameState);
            results.losses++;
        }

        // Calculate profit for this round
        const roundProfit = won ? payout - originalBetAmount : -originalBetAmount;

        // Update the balance
        gameState.balance = roundMonetaryValue(gameState.balance + roundProfit, gameState);

        // Add to total wagered
        totalWagered = roundMonetaryValue(totalWagered + originalBetAmount, gameState);

        // Update the nonce for the next round
        gameState.nonce++;

        // Update total profit
        results.totalProfit = roundMonetaryValue(results.totalProfit + roundProfit, gameState);

        // If there was a win and total profit is positive, stop the simulation
        if (won && results.totalProfit > 0) {
            console.log(`Simulation stopped after round ${i + 1} as win resulted in positive profit (${formatCurrency(results.totalProfit)}).`);
            break;
        }
    }

    // Update final nonce in results
    results.finalNonce = gameState.nonce;

    // Update final balance in results
    results.finalBalance = roundMonetaryValue(gameState.balance, gameState);

    // Calculate the new cumulative profit including the current simulation
    const newCumulativeProfit = roundMonetaryValue(previousCumulativeProfit + results.totalProfit, gameState);

    // Add the cumulative profit to the results object
    results.cumulativeProfit = newCumulativeProfit;

    // Truncate the total profit to use rounded value
    results.totalProfit = roundMonetaryValue(results.totalProfit, gameState);

    // Save the updated game state
    gameState.sessionHistory.push({
        simulationParams: {
            targetMultiplier: parseFloat(targetMultiplier.toFixed(2)),
            initialBet: roundBetAmount(initialBet, gameState),
            betMultiplier: parseFloat(betMultiplier.toFixed(2)),
            numberOfBets
        },
        results,
        timestamp: new Date().toISOString()
    });

    // Add the overall cumulative profit to the game state
    gameState.cumulativeProfit = roundMonetaryValue(newCumulativeProfit, gameState);

    saveGameState(gameState);

    // Display results in table format
    const { createTable, createKeyValueTable } = require('../cli-scripts/table-utils.js');

    // Summary table
    const actualRounds = results.wins + results.losses;
    const summaryHeaders = ['Rounds', 'Wins', 'Losses', 'Total Bets', 'Start Balance', 'Final Balance', 'Profit', 'Cumulative Profit'];
    const profitDisplay = results.totalProfit >= 0 ? `+${formatCurrency(results.totalProfit)}` : formatCurrency(results.totalProfit);
    const summaryRows = [[
        actualRounds,
        results.wins,
        results.losses,
        formatCurrency(totalWagered),
        formatCurrency(results.startingBalance),
        formatCurrency(results.finalBalance),
        profitDisplay,
        formatCurrency(results.cumulativeProfit)
    ]];

    console.log(createTable(summaryHeaders, summaryRows, {
        columnAlignments: { 0: 'right', 1: 'right', 2: 'right', 3: 'right', 4: 'right', 5: 'right', 6: 'right', 7: 'right' }
    }));

    // Details table
    const winProbability = probAtLeastOne(targetMultiplier, numberOfBets);

    // Show the bet amount placed on the winning round (depends on initial bet and,
    // when greater than 1.0, on how many losses were accumulated via betMultiplier)
    // along with the win amount paid out (winning round bet * target multiplier)
    const lastWinIndex = results.winningBetAmounts.length - 1;
    const winningRoundEntries = lastWinIndex >= 0
        ? {
            'Winning Round Bet': formatCurrency(results.winningBetAmounts[lastWinIndex]),
            'Win Amount': formatCurrency(results.winningPayouts[lastWinIndex])
        }
        : {};

    const details = {
        'Target Multiplier': `${targetMultiplier.toFixed(2)}x`,
        'Initial Bet': formatCurrency(initialBet),
        ...winningRoundEntries,
        [`P(X≥${targetMultiplier.toFixed(2)}, n=${numberOfBets})`]: `${(winProbability * 100).toFixed(2)}%`,
        'Bet Multiplier': `${betMultiplier.toFixed(2)}x`,
        'Start Nonce': results.startNonce,
        'Final Nonce': results.finalNonce
    };
    console.log(createKeyValueTable(details));

    return results;
}

// CLI functionality to allow calling from command line
if (require.main === module) {
    // If called directly from command line
    if (process.argv.length < 4 || process.argv.length > 6) {
        console.error('Usage: node continue-game.js <targetMultiplier> <numberOfBets> [initialBet] [betMultiplier]');
        console.error('  targetMultiplier: The multiplier threshold for winning');
        console.error('  numberOfBets: The number of bets to make (or until balance is insufficient)');
        console.error('  initialBet: The starting bet amount (default: 1)');
        console.error('  betMultiplier: The factor by which to increase the bet after losses (default: 1)');
        process.exit(1);
    }

    const [, , targetMultiplier, numberOfBets, initialBet, betMultiplier] = process.argv;

    try {
        continueSimulate(
            parseFloat(targetMultiplier),
            parseInt(numberOfBets),
            initialBet ? parseFloat(initialBet) : 1,
            betMultiplier ? parseFloat(betMultiplier) : 1
        );
    } catch (error) {
        console.error('Error in simulation:', error.message);
        process.exit(1);
    }
}

module.exports = { continueSimulate };