/**
 * Calculates profit for a betting system based on geometric progression.
 * 
 * This function models a betting strategy where:
 * - Each bet amount follows a geometric progression starting with 'a' and multiplied by 'x' each round
 * - Total amount bet is the sum of a geometric series with 'w' terms
 * - The payout is calculated based on the bet amount in the winning round multiplied by 'm'
 * - Profit is the difference between payout and total amount bet
 * 
 * @param {number} w - Number of terms in the geometric series (number of bets placed)
 * @param {number} m - Multiplier for calculating payout (winning multiplier/odds)
 * @param {number} x - Common ratio of the geometric progression (bet increase factor)
 * @param {number} a - First term of the geometric series (initial bet amount)
 * 
 * @returns {Object} An object containing:
 *   - totalBets {number}: Sum of geometric series a + ax + ax^2 + ... + ax^(w-1) = a*(1-x^w)/(1-x)
 *   - winBetAmount {number}: Size of the bet in the winning round: a * x^(w-1)
 *   - payout {number}: Winnings from the successful bet: winBetAmount * m
 *   - profit {number}: Net profit: payout - totalBets
 * 
 * All return values are rounded to 2 decimal places.
 */
function calculateProfit(w, m, x, a) {
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
        totalBets,
        winBetAmount,
        payout,
        profit
    };
}

// Export the function to make it available for other modules
module.exports = { calculateProfit };

// CLI functionality to allow calling from command line
if (require.main === module) {
    // If called directly from command line
    if (process.argv.length !== 6) { // node profit-calculation.js + 4 arguments
        console.error('Usage: node profit-calculation.js <w> <m> <x> <a>');
        process.exit(1);
    }
    
    const [, , w, m, x, a] = process.argv;
    
    try {
        const results = calculateProfit(
            parseFloat(w),
            parseFloat(m),
            parseFloat(x),
            parseFloat(a)
        );
        
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('Error calculating profit:', error.message);
        process.exit(1);
    }
}