/**
 * Continues a game simulation using the fixed seeds from init-game.js
 * Updates the nonce for each game played and records the results.
 * 
 * Parameters:
 * - targetMultiplier: The multiplier threshold for winning
 * - initialBet: The starting bet amount
 * - betMultiplier: The factor by which to increase the bet after losses
 * - numberOfBets: The number of bets to make
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Define the game state file path
const gameStateFile = path.join(__dirname, 'game-session.json');

// Import the multiplier function from the crypto module
const { getMultiplier } = require('../crypto.bch.js');

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

function continueSimulate(targetMultiplier, initialBet, betMultiplier, numberOfBets) {
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
        outcomes: [],
        finalNonce: null,
        totalProfit: 0,
        wins: 0,
        losses: 0,
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
            console.log(`Cannot place bet of ${originalBetAmount} - insufficient balance (${gameState.balance}). Simulation ended.`);
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

        // Record this round's outcome
        results.outcomes.push({
            round: i + 1,
            nonce: gameState.nonce,
            betAmount: roundBetAmount(originalBetAmount, gameState),
            multiplier: parseFloat(multiplier.toFixed(2)),  // multiplier is not a monetary value, so keep as is
            targetMultiplier: parseFloat(targetMultiplier.toFixed(2)),  // targetMultiplier is not a monetary value, so keep as is
            won: won,
            payout: roundMonetaryValue(payout, gameState),
            profit: roundMonetaryValue(roundProfit, gameState),
            balance: roundMonetaryValue(gameState.balance, gameState)  // Add balance after this round
        });

        // Update the nonce for the next round
        gameState.nonce++;

        // Update total profit
        results.totalProfit = roundMonetaryValue(results.totalProfit + roundProfit, gameState);

        // If there was a win and total profit is positive, stop the simulation
        if (won && results.totalProfit > 0) {
            console.log(`Simulation stopped after round ${i + 1} as win resulted in positive profit (${results.totalProfit}).`);
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

    console.log('Simulation completed!');
    console.log(`Total Rounds: ${numberOfBets}`);
    console.log(`Wins: ${results.wins}`);
    console.log(`Losses: ${results.losses}`);
    console.log(`Starting Balance: ${results.startingBalance}`);
    console.log(`Final Balance: ${results.finalBalance}`);
    console.log(`Total Profit: ${results.totalProfit}`);
    console.log(`Cumulative Profit: ${results.cumulativeProfit}`);
    console.log(`Final Nonce: ${results.finalNonce}`);

    return results;
}

// CLI functionality to allow calling from command line
if (require.main === module) {
    // If called directly from command line
    if (process.argv.length !== 6) { // node continue-simulate.js + 4 arguments
        console.error('Usage: node continue-simulate.js <targetMultiplier> <initialBet> <betMultiplier> <numberOfBets>');
        console.error('  targetMultiplier: The multiplier threshold for winning');
        console.error('  initialBet: The starting bet amount');
        console.error('  betMultiplier: The factor by which to increase the bet after losses');
        console.error('  numberOfBets: The number of bets to make (or until balance is insufficient)');
        process.exit(1);
    }

    const [, , targetMultiplier, initialBet, betMultiplier, numberOfBets] = process.argv;

    try {
        const results = continueSimulate(
            parseFloat(targetMultiplier),
            parseFloat(initialBet),
            parseFloat(betMultiplier),
            parseInt(numberOfBets)
        );

        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('Error in simulation:', error.message);
        process.exit(1);
    }
}

module.exports = { continueSimulate };