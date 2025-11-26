/**
 * Displays the current game session information.
 * Shows the client seed, server seed, current nonce, and session history.
 */

const fs = require('fs');
const path = require('path');

// Define the game state file path
const gameStateFile = path.join(__dirname, '../game-session.json');

function viewGameSession() {
    try {
        const data = fs.readFileSync(gameStateFile, 'utf8');
        const gameState = JSON.parse(data);
        
        console.log('=== Game Session Information ===');
        console.log(`Client Seed: ${gameState.clientSeed}`);
        console.log(`Server Seed: ${gameState.serverSeed}`);
        console.log(`Current Nonce: ${gameState.nonce}`);
        console.log(`Created At: ${gameState.createdAt}`);
        console.log(`Session History Length: ${gameState.sessionHistory.length} simulation(s)`);
        
        if (gameState.sessionHistory.length > 0) {
            console.log('\n=== Session History ===');
            gameState.sessionHistory.forEach((session, index) => {
                console.log(`\nSimulation #${index + 1}:`);
                console.log(`  Parameters: Target=${session.simulationParams.targetMultiplier}, ` +
                           `InitialBet=${session.simulationParams.initialBet}, ` +
                           `BetMultiplier=${session.simulationParams.betMultiplier}, ` +
                           `NumBets=${session.simulationParams.numberOfBets}`);
                console.log(`  Results: Wins=${session.results.wins}, Losses=${session.results.losses}, ` +
                           `TotalProfit=${session.results.totalProfit}`);
                console.log(`  Timestamp: ${session.timestamp}`);
            });
        }
        
        return gameState;
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Game session file does not exist at ${gameStateFile}. Please run init-game.js first.`);
        } else {
            console.error('Error reading game session:', error.message);
        }
        process.exit(1);
    }
}

// CLI functionality to allow calling from command line
if (require.main === module) {
    viewGameSession();
}

module.exports = { viewGameSession };