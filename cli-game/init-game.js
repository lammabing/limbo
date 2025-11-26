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

function initGame(startingBalance = 1000) {
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
    console.log(`Game state saved to: ${gameStateFile}`);

    return gameState;
}

// CLI functionality to allow calling from command line
if (require.main === module) {
    try {
        // Get starting balance from command line arguments if provided
        const startingBalance = process.argv[2] ? parseFloat(process.argv[2]) : 1000;

        if (isNaN(startingBalance) || startingBalance < 0) {
            console.error('Starting balance must be a non-negative number');
            process.exit(1);
        }

        initGame(startingBalance);
    } catch (error) {
        console.error('Error initializing game:', error.message);
        process.exit(1);
    }
}

module.exports = { initGame };