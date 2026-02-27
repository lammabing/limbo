/**
 * Initializes a game session by generating and fixing seeds for a session.
 * Creates a JSON file with initial game state including clientSeed, serverSeed, initial nonce, and starting balance.
 * Subsequent games will use these seeds with an incremented nonce.
 */

const { generateRandomString } = require('./../cli-scripts/randomStringGenerator.js');
const fs = require('fs');
const path = require('path');

// Define the game state file path
const gameStateFile = path.join(__dirname, 'game-session.json');

function initGame(startingBalance = 1000, roundDownMonetaryValues = true) {
    // Generate initial seeds
    const clientSeed = generateRandomString({
        length: 32,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true
    });

    const serverSeed = generateRandomString({
        length: 32,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true
    });

    // Initial nonce starts at 0
    const initialNonce = 0;

    // Create the game state object
    const gameState = {
        clientSeed,
        serverSeed,
        nonce: initialNonce,
        balance: startingBalance,
        startingBalance: startingBalance,
        roundDownMonetaryValues, // Option to round down all monetary values to nearest integer
        createdAt: new Date().toISOString(),
        sessionHistory: [],
        cumulativeProfit: 0
    };

    // Write the game state to file
    fs.writeFileSync(gameStateFile, JSON.stringify(gameState, null, 2));

    console.log('Game session initialized successfully!');
    console.log(`Client Seed: ${clientSeed}`);
    console.log(`Server Seed: ${serverSeed}`);
    console.log(`Initial Nonce: ${initialNonce}`);
    console.log(`Starting Balance: ${startingBalance}`);
    console.log(`Round Down Monetary Values: ${roundDownMonetaryValues}`);
    console.log(`Game state saved to: ${gameStateFile}`);

    return gameState;
}

// CLI functionality to allow calling from command line
if (require.main === module) {
    if (process.argv.length < 2 || process.argv.length > 4) { // node init-game.js + optional args
        console.error('Usage: node init-game.js [startingBalance] [roundDownMonetaryValues]');
        console.error('  startingBalance: Initial balance for the game (default: 1000)');
        console.error('  roundDownMonetaryValues: Whether to round down monetary values to nearest integer (default: true)');
        console.error('    Acceptable values: true/false, 1/0, yes/no');
        process.exit(1);
    }

    try {
        // Get starting balance and roundDownMonetaryValues from command line arguments if provided
        const startingBalance = process.argv[2] ? parseFloat(process.argv[2]) : 1000;
        // Get roundDownMonetaryValues from command line argument (default to true if not specified)
        // Accept 'true', 'false', '1', '0', 'yes', 'no' as valid values
        let roundDownMonetaryValues = true; // default
        if (process.argv[3] !== undefined) {
            const roundValue = process.argv[3].toLowerCase();
            if (roundValue === 'false' || roundValue === '0' || roundValue === 'no') {
                roundDownMonetaryValues = false;
            } else if (roundValue === 'true' || roundValue === '1' || roundValue === 'yes') {
                roundDownMonetaryValues = true;
            } else {
                console.error(`Invalid value for roundDownMonetaryValues: ${process.argv[3]}. Use true/false, 1/0, or yes/no.`);
                process.exit(1);
            }
        }

        if (isNaN(startingBalance) || startingBalance < 0) {
            console.error('Starting balance must be a non-negative number');
            process.exit(1);
        }

        initGame(startingBalance, roundDownMonetaryValues);
    } catch (error) {
        console.error('Error initializing game:', error.message);
        process.exit(1);
    }
}

module.exports = { initGame };