/**
 * Simulates a betting system using provably fair crypto game mechanics.
 *
 * This function simulates a betting strategy where:
 * - Each bet amount follows a geometric progression starting with 'a' and multiplied by 'x' each round
 * - The simulation continues until a win condition based on multiplier 'm'
 * - Seeds are randomly generated to ensure different outcomes per simulation
 * - The game starts with a specified balance and ends when balance falls to zero or less
 *
 * @param {number} m - Target multiplier for winning (player wins if result >= m)
 * @param {number} x - Common ratio of the geometric progression (bet increase factor)
 * @param {number} a - First term of the geometric series (initial bet amount)
 * @param {number} startingBalance - Starting balance for the game (defaults to 1000)
 *
 * @returns {Object} An object containing:
 *   - w {number}: Round number when the player won (1-indexed)
 *   - totalBets {number}: Sum of geometric series a + ax + ax^2 + ... + ax^(w-1) = a*(1-x^w)/(1-x)
 *   - winBetAmount {number}: Size of the bet in the winning round: a * x^(w-1)
 *   - payout {number}: Winnings from the successful bet: winBetAmount * m
 *   - profit {number}: Net profit: payout - totalBets
 *   - finalBalance: Balance remaining after the game ended
 *   - roundsPlayed: How many rounds were played before the game ended
 *
 * All return values are rounded to 2 decimal places.
 */

const { getMultiplier, setProvider } = require('../crypto.provider.js'); // Use the crypto provider module
const { generateRandomString } = require('./randomStringGenerator.js');

function simulateProfit(m, x, a, startingBalance = 1000) {
    // Generate random seeds for this simulation
    const clientSeed = generateRandomString({ length: 32, includeUppercase: true, includeLowercase: true, includeNumbers: true });
    const serverSeed = generateRandomString({ length: 32, includeUppercase: true, includeLowercase: true, includeNumbers: true });

    // Initialize game state with the starting balance
    let balance = startingBalance;
    let round = 1;
    let multiplier;
    let totalBets = 0;
    let roundsPlayed = 0;
    let lastBetAmount = 0;

    // Simulate the game until a win condition or balance runs out
    do {
        // Calculate the bet amount for this round
        const betAmount = a * Math.pow(x, round - 1);

        // Check if we have enough balance to place the bet
        if (balance - betAmount <= 0) {
            // We can't place this bet, game over
            break;
        }

        // Use BCH provider with house edge for this simulation
        setProvider('bch');
        multiplier = getMultiplier(round, clientSeed, serverSeed, 0.02); // BCH uses house edge

        // Update game state
        balance -= betAmount; // Deduct the bet from balance
        totalBets += betAmount;
        lastBetAmount = betAmount;
        roundsPlayed++;

        if (multiplier >= m) {
            // Player wins: add the payout to the balance
            const payout = betAmount * multiplier;
            balance += payout;
            break;
        }

        round++;
    } while (round < 10000 && balance > 0); // Add upper limit to prevent infinite loop and stop if balance is zero or less

    // Calculate net profit
    const profit = balance - startingBalance;

    // Return all calculated values rounded to 2 decimal places
    return {
        numberOfBets: round,
        initialBet: a,
        totalBets: Number(totalBets.toFixed(2)),
        winBetAmount: Number(lastBetAmount.toFixed(2)),
        payout: Number((lastBetAmount * multiplier).toFixed(2)),
        profit: Number(profit.toFixed(2)),
        finalBalance: Number(balance.toFixed(2)),
        roundsPlayed,
        clientSeed,  // Return seeds for verification purposes
        serverSeed,
        multiplier, // Return the actual multiplier that triggered the win (or the last one if game ended due to balance)
        gameOver: balance <= 0 // Whether the game ended due to balance running out
    };
}

// Export the function to make it available for other modules
module.exports = { simulateProfit };

// CLI functionality to allow calling from command line
if (require.main === module) {
    // If called directly from command line
    if (process.argv.length < 5 || process.argv.length > 6) { // node profit-simulation.js + 3-4 arguments
        console.error('Usage: node profit-simulation.js <m> <x> <a> [startingBalance]');
        console.error('  m: Target multiplier for winning');
        console.error('  x: Common ratio of the geometric progression (bet increase factor)');
        console.error('  a: First term of the geometric series (initial bet amount)');
        console.error('  startingBalance: Starting balance for the game (optional, defaults to 1000)');
        process.exit(1);
    }

    const [, , m, x, a, startingBalance] = process.argv;

    try {
        const results = simulateProfit(
            parseFloat(m),
            parseFloat(x),
            parseFloat(a),
            startingBalance !== undefined ? parseFloat(startingBalance) : 1000
        );

        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('Error simulating profit:', error.message);
        process.exit(1);
    }
}