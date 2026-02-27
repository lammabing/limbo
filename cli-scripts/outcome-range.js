const cryptoProvider = require('../crypto.provider');
const { getMultiplier } = cryptoProvider;
const fs = require('fs');
const path = require('path');

// Set default crypto provider (can be overridden via environment variable)
const CRYPTO_PROVIDER = process.env.CRYPTO_PROVIDER || 'bch';
cryptoProvider.setProvider(CRYPTO_PROVIDER);
console.log(`Using crypto provider: ${cryptoProvider.getCurrentProvider()}`);

// Function to generate random alphanumeric string
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: node outcome-range.js <start-round> <end-round> [n] [clientSeed] [serverSeed] [--suppress-rounds]');
        console.log('Example: node outcome-range.js 1 100');
        console.log('Example: node outcome-range.js 1 100 5');
        console.log('Example: node outcome-range.js 50 150 abc123 def456');
        console.log('Example with suppressed rounds: node outcome-range.js 1 100 --suppress-rounds');
        process.exit(1);
    }

    // Check for suppress flag and remove it from args to avoid affecting positional arguments
    const suppressRounds = args.includes('--suppress-rounds');
    const filteredArgs = args.filter(arg => arg !== '--suppress-rounds');

    if (filteredArgs.length < 2) {
        console.log('Usage: node outcome-range.js <start-round> <end-round> [n] [clientSeed] [serverSeed] [--suppress-rounds]');
        console.log('Example: node outcome-range.js 1 100');
        console.log('Example: node outcome-range.js 1 100 5');
        console.log('Example: node outcome-range.js 50 150 abc123 def456');
        console.log('Example with suppressed rounds: node outcome-range.js 1 100 --suppress-rounds');
        process.exit(1);
    }

    const startRound = parseInt(filteredArgs[0], 10);
    const endRound = parseInt(filteredArgs[1], 10);
    
    // Check if third argument is a number (n) or a string (clientSeed)
    let n = 10; // default to top 10
    let seedStartIndex = 2;
    
    if (filteredArgs.length > 2) {
        const potentialN = parseInt(filteredArgs[2], 10);
        if (!isNaN(potentialN) && potentialN > 0) {
            n = potentialN;
            seedStartIndex = 3;
        }
    }
    
    let clientSeed = filteredArgs.length > seedStartIndex ? filteredArgs[seedStartIndex] : generateRandomString(32);
    let serverSeed = filteredArgs.length > seedStartIndex + 1 ? filteredArgs[seedStartIndex + 1] : generateRandomString(32);

    if (isNaN(startRound) || isNaN(endRound) || startRound < 1 || endRound < startRound) {
        console.log('Error: start-round and end-round must be positive integers, and end-round must be >= start-round');
        process.exit(1);
    }

    if (!suppressRounds) {
        console.log(`Start Round: ${startRound}`);
        console.log(`End Round: ${endRound}`);
        console.log(`Total Rounds: ${endRound - startRound + 1}`);
        console.log(`Client Seed: ${clientSeed}`);
        console.log(`Server Seed: ${serverSeed}`);
        console.log('Generating outcomes...\n');
    }

    let csvContent = 'Round,Nonce,Multiplier\n';
    let highestMultiplier = 0;
    let highestRound = 0;
    let results = [];

    // Generate outcomes for the specified range
    for (let round = startRound; round <= endRound; round++) {
        const nonce = round - 1; // nonce starts at 0
        const multiplier = getMultiplier(nonce, clientSeed, serverSeed);

        results.push({ round, nonce, multiplier });

        // Display individual round outcomes unless suppressed
        if (!suppressRounds) {
            console.log(`Round ${round} (nonce ${nonce}): ${multiplier}x`);
        }

        csvContent += `${round},${nonce},${multiplier}\n`;

        // Track the highest multiplier
        if (multiplier > highestMultiplier) {
            highestMultiplier = multiplier;
            highestRound = round;
        }
    }

    // Create csv-output directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'csv-output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create timestamped filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(outputDir, `outcomes-range-${timestamp}.csv`);

    fs.writeFileSync(outputFile, csvContent);
    
    if (!suppressRounds) {
        console.log(`\nOutcomes saved to ${outputFile}`);
    }

    // Display summary
    console.log('\n========================================');
    console.log('Range Summary:');
    console.log('========================================');
    console.log(`Round Range: ${startRound} to ${endRound}`);
    console.log(`Total Rounds: ${results.length}`);
    console.log(`Highest outcome: Round ${highestRound} with ${highestMultiplier}x`);
    console.log(`Client Seed: ${clientSeed}`);
    console.log(`Server Seed: ${serverSeed}`);
    console.log('========================================');

    // Display top n highest outcomes in range
    displayTopOutcomes(results, n);

    console.log(`\nRange results saved to ${outputFile}`);
}

function displayTopOutcomes(results, n) {
    // Sort by multiplier in descending order
    const sorted = [...results].sort((a, b) => b.multiplier - a.multiplier);

    // Display top n
    console.log(`\nTop ${n} highest outcomes in range:`);
    const count = Math.min(n, sorted.length);
    for (let i = 0; i < count; i++) {
        console.log(`Round ${sorted[i].round} (nonce ${sorted[i].nonce}): ${sorted[i].multiplier}x`);
    }
}

if (require.main === module) {
    main();
}
