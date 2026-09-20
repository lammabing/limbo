/**
 * Function iteration utility for automating continue-game.js simulations
 *
 * Configure userParams with arrays of values for each parameter.
 * The script will run continueSimulate sequentially for each combination.
 *
 * Parameters:
 * - targetMultiplier: The multiplier threshold for winning (required)
 * - numberOfBets: The number of bets to make (required)
 * - initialBet: The starting bet amount (optional, default: 1)
 * - betMultiplier: The factor to increase bet after losses (optional, default: 1)
 *
 * Usage:
 *   node function-iteration.js                           # Uses default params or params.json
 *   node function-iteration.js params.json               # Uses specified JSON file
 *   node function-iteration.js ./configs/my-params.json  # Uses custom path
 */

const fs = require('fs');
const path = require('path');
const { continueSimulate } = require('./continue-game.js');

// Default parameters (used if no JSON file is provided)
const defaultParams = {
    targetMultiplier: [2.00, 3.00, 5.00],
    numberOfBets: [100, 100, 100],
    initialBet: [1, 1, 1],
    betMultiplier: [2, 2, 2]
};

/**
 * Load userParams from a JSON file or use defaults
 * @param {string|null} configFile - Path to the JSON config file
 * @returns {object} - The userParams object
 */
function loadUserParams(configFile = null) {
    // Check for command line argument
    const args = process.argv.slice(2);
    const configPath = configFile || args[0];

    // If no config file specified, check for default params.json
    if (!configPath) {
        const defaultConfigPath = path.join(__dirname, 'params.json');
        if (fs.existsSync(defaultConfigPath)) {
            console.log(`Loading parameters from: params.json`);
            try {
                const data = fs.readFileSync(defaultConfigPath, 'utf8');
                return JSON.parse(data);
            } catch (error) {
                console.error(`Error reading params.json: ${error.message}`);
                console.log('Falling back to default parameters.');
                return defaultParams;
            }
        }
        console.log('No config file specified, using default parameters.');
        return defaultParams;
    }

    // Load from specified config file
    const resolvedPath = path.resolve(configPath);
    console.log(`Loading parameters from: ${resolvedPath}`);

    try {
        const data = fs.readFileSync(resolvedPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`Config file not found: ${resolvedPath}`);
        } else if (error instanceof SyntaxError) {
            throw new Error(`Invalid JSON in config file: ${error.message}`);
        }
        throw error;
    }
}

async function runSequentially(configFile = null) {
    // Load parameters from file or defaults
    const userParams = loadUserParams(configFile);

    const keys = Object.keys(userParams);
    const n = userParams[keys[0]].length;

    // Validate that all arrays have the same length
    for (const key of keys) {
        if (userParams[key].length !== n) {
            throw new Error(`All parameter arrays must have the same length. Mismatch found in: ${key}`);
        }
    }

    console.log('Starting sequential simulation runs...\n');
    console.log(`Total iterations: ${n}`);
    console.log('='.repeat(60));

    for (let i = 0; i < n; i++) {
        const params = {
            targetMultiplier: userParams.targetMultiplier[i],
            numberOfBets: userParams.numberOfBets[i],
            initialBet: userParams.initialBet?.[i] ?? 1,
            betMultiplier: userParams.betMultiplier?.[i] ?? 1
        };

        console.log(`\n>>> Iteration ${i + 1}/${n} at ${new Date().toISOString()}`);
        console.log(`    Target: ${params.targetMultiplier}x | Bets: ${params.numberOfBets} | Initial: ${params.initialBet} | Multiplier: ${params.betMultiplier}x`);
        console.log('='.repeat(60));

        try {
            const result = await continueSimulate(
                params.targetMultiplier,
                params.numberOfBets,
                params.initialBet,
                params.betMultiplier
            );

            console.log(`\n<<< Iteration ${i + 1} completed at ${new Date().toISOString()}`);
            console.log(`    Profit: ${result.totalProfit} | Cumulative: ${result.cumulativeProfit} | Balance: ${result.finalBalance}`);
            console.log('='.repeat(60));
        } catch (error) {
            console.error(`Error in iteration ${i + 1}:`, error.message);
            console.log('='.repeat(60));
        }
    }

    console.log('\n✓ All iterations completed.');
}

// Run if called directly
if (require.main === module) {
    runSequentially().catch(error => {
        console.error('Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = { runSequentially, loadUserParams, defaultParams };
