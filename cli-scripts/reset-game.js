/**
 * Resets the game session by deleting the game-session.json file.
 * This allows for a fresh initialization with new seeds.
 */

const fs = require('fs');
const path = require('path');

// Define the game state file path
const gameStateFile = path.join(__dirname, '../game-session.json');

function resetGame() {
    try {
        if (fs.existsSync(gameStateFile)) {
            fs.unlinkSync(gameStateFile);
            console.log('Game session has been reset successfully.');
            console.log(`File ${gameStateFile} has been deleted.`);
        } else {
            console.log('No game session file found to reset.');
        }
    } catch (error) {
        console.error('Error resetting game session:', error.message);
        process.exit(1);
    }
}

// CLI functionality to allow calling from command line
if (require.main === module) {
    resetGame();
}

module.exports = { resetGame };