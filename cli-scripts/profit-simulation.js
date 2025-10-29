/**
 * Simulates a betting system using provably fair crypto game mechanics.
 * 
 * This function simulates a betting strategy where:
 * - Each bet amount follows a geometric progression starting with 'a' and multiplied by 'x' each round
 * - The simulation continues until a win condition based on multiplier 'm'
 * - Seeds are randomly generated to ensure different outcomes per simulation
 * 
 * @param {number} m - Target multiplier for winning (player wins if result >= m)
 * @param {number} x - Common ratio of the geometric progression (bet increase factor)
 * @param {number} a - First term of the geometric series (initial bet amount)
 * 
 * @returns {Object} An object containing:
 *   - w {number}: Round number when the player won (1-indexed)
 *   - totalBets {number}: Sum of geometric series a + ax + ax^2 + ... + ax^(w-1) = a*(1-x^w)/(1-x)
 *   - winBetAmount {number}: Size of the bet in the winning round: a * x^(w-1)
 *   - payout {number}: Winnings from the successful bet: winBetAmount * m
 *   - profit {number}: Net profit: payout - totalBets
 * 
 * All return values are rounded to 2 decimal places.
 */

const crypto = require('crypto');
const { generateRandomString } = require('./randomStringGenerator.js');

// Implementation of getMultiplier based on BCH algorithm but without global variables
function getMultiplier(nonce, clientSeed, serverSeed, houseEdge = 0.02) {
    // Generate HMAC-SHA256 hash
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(`${clientSeed}:${nonce}:0`); // Use currentRound as 0 for simplicity
    const buffer = hmac.digest();
    
    // Convert first 4 bytes to float
    let float = 0;
    for (let i = 0; i < 4; i++) {
        const divider = 256 ** (i + 1);
        const partialResult = buffer[i] / divider;
        float += partialResult;
    }
    
    const m = 100_000_000;
    const n = Math.floor(float * m) + 1;
    
    const crashPoint = Math.max((m / n) * (1 - houseEdge), 1);
    const multiplier = Math.floor(crashPoint * 100) / 100;
    
    return multiplier;
}

function simulateProfit(m, x, a) {
    // Generate random seeds for this simulation
    const clientSeed = generateRandomString({ length: 32, includeUppercase: true, includeLowercase: true, includeNumbers: true });
    const serverSeed = generateRandomString({ length: 32, includeUppercase: true, includeLowercase: true, includeNumbers: true });
    
    // Simulate the game until a win condition
    let round = 1;
    let multiplier;
    
    do {
        multiplier = getMultiplier(round, clientSeed, serverSeed);
        if (multiplier >= m) {
            // Found winning round, calculate profit based on round number w
            break;
        }
        round++;
    } while (round < 10000); // Add upper limit to prevent infinite loop
    
    // Calculate w as the round where win occurred
    const w = round;
    
    // Calculate totalBets as a geometric series: a + ax + ax^2 + ... + ax^(w-1) = a * (1 - x^w)/(1-x)
    const totalBetsCalc = a * (1 - Math.pow(x, w)) / (1 - x);
    const totalBets = Number(totalBetsCalc.toFixed(2));
    
    // Calculate winBetAmount using formula: a * (x^(w-1))
    const winBetAmountCalc = a * Math.pow(x, w - 1);
    const winBetAmount = Number(winBetAmountCalc.toFixed(2));
    
    // Calculate payout using formula: winBetAmount * m
    const payoutCalc = winBetAmountCalc * m;
    const payout = Number(payoutCalc.toFixed(2));
    
    // Calculate profit using formula: payout - totalBets
    const profitCalc = payoutCalc - totalBetsCalc;
    const profit = Number(profitCalc.toFixed(2));
    
    // Return all calculated values rounded to 2 decimal places
    return {
        numberOfBets: w,
        initialBet: a,
        totalBets,
        winBetAmount,
        payout,
        profit,
        clientSeed,  // Return seeds for verification purposes
        serverSeed,
        multiplier // Return the actual multiplier that triggered the win
    };
}

// Export the function to make it available for other modules
module.exports = { simulateProfit };

// CLI functionality to allow calling from command line
if (require.main === module) {
    // If called directly from command line
    if (process.argv.length !== 5) { // node profit-simulation.js + 3 arguments
        console.error('Usage: node profit-simulation.js <m> <x> <a>');
        process.exit(1);
    }
    
    const [, , m, x, a] = process.argv;
    
    try {
        const results = simulateProfit(
            parseFloat(m),
            parseFloat(x),
            parseFloat(a)
        );
        
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('Error simulating profit:', error.message);
        process.exit(1);
    }
}