#!/usr/bin/env node

/**
 * Calculates the total cost of bets based on initial bet, multiplier, and number of bets
 * @param {number} initialBet - The amount of the first bet
 * @param {number} betMultiplier - The factor by which each subsequent bet is multiplied
 * @param {number} numberOfBets - The total number of bets to be placed
 * @returns {object} An object containing the total amount for all bets and the final bet amount
 */
function calculateTotalBets(initialBet, betMultiplier, numberOfBets) {
    // Validate parameters
    if (arguments.length !== 3) {
        throw new Error('Usage: calculateTotalBets(initialBet, betMultiplier, numberOfBets)');
    }
    
    if (typeof initialBet !== 'number' || typeof betMultiplier !== 'number' || typeof numberOfBets !== 'number') {
        throw new Error('All parameters must be numbers: calculateTotalBets(initialBet, betMultiplier, numberOfBets)');
    }
    
    if (initialBet <= 0) {
        throw new Error('initialBet must be a positive number: calculateTotalBets(initialBet, betMultiplier, numberOfBets)');
    }
    
    if (betMultiplier <= 0) {
        throw new Error('betMultiplier must be a positive number: calculateTotalBets(initialBet, betMultiplier, numberOfBets)');
    }
    
    if (numberOfBets <= 0 || !Number.isInteger(numberOfBets)) {
        throw new Error('numberOfBets must be a positive integer: calculateTotalBets(initialBet, betMultiplier, numberOfBets)');
    }
    
    let totalBets = 0;
    let currentBet = initialBet;
    
    for (let i = 0; i < numberOfBets; i++) {
        totalBets += currentBet;
        if (i < numberOfBets - 1) {
            currentBet *= betMultiplier;
        }
    }
    
    return {
        totalBets,
        finalBet: currentBet
    };
}

// If this file is run directly, handle command-line arguments
if (require.main === module) {
    const args = process.argv.slice(2); // Get command line arguments, excluding node path and script name
    
    if (args.length === 0) {
        // No arguments provided - show usage information
        console.log('Cost Calculation Module');
        console.log('=====================');
        console.log('Usage: node cost-calculation.js <initialBet> <betMultiplier> <numberOfBets>');
        console.log('   OR: chmod +x cost-calculation.js && ./cost-calculation.js <initialBet> <betMultiplier> <numberOfBets>');
        console.log('');
        console.log('This module calculates:');
        console.log('- Total amount of all bets');
        console.log('- Amount of the final bet');
        console.log('');
        console.log('Parameters:');
        console.log('  initialBet (number): The amount of the first bet (must be positive)');
        console.log('  betMultiplier (number): The factor by which each subsequent bet is multiplied (must be positive)');
        console.log('  numberOfBets (number): The total number of bets to be placed (must be a positive integer)');
        console.log('');
        console.log('Example usage:');
        console.log('  node cost-calculation.js 10 2 5');
        console.log('  ./cost-calculation.js 5.5 1.5 10');
        console.log('');
    } else if (args.length === 3) {
        // Three arguments provided - use them to calculate
        try {
            const initialBet = parseFloat(args[0]);
            const betMultiplier = parseFloat(args[1]);
            const numberOfBets = parseInt(args[2]);
            
            const result = calculateTotalBets(initialBet, betMultiplier, numberOfBets);
            
            console.log('Calculation Results:');
            console.log('===================');
            console.log(`Initial Bet: ${initialBet}`);
            console.log(`Bet Multiplier: ${betMultiplier}`);
            console.log(`Number of Bets: ${numberOfBets}`);
            console.log(`Total Bets: ${result.totalBets}`);
            console.log(`Final Bet: ${result.finalBet}`);
        } catch (error) {
            console.error(`Error: ${error.message}`);
            console.log('');
            console.log('Run without arguments for usage information.');
        }
    } else {
        // Incorrect number of arguments - show error and usage
        console.error('Error: Incorrect number of arguments provided.');
        console.log('');
        console.log('Usage: node cost-calculation.js <initialBet> <betMultiplier> <numberOfBets>');
        console.log('');
    }
}

module.exports = { calculateTotalBets };