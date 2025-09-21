const cryptoProvider = require('./crypto.provider');
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
    if (args.length < 1) {
        console.log('Usage: node outcome-generator.js <rounds> [threshold] [clientSeed] [serverSeed]');
        console.log('Example: node outcome-generator.js 10 2.0 abc123 def456');
        process.exit(1);
    }

    const n = parseInt(args[0], 10);
    const threshold = args.length > 1 ? parseFloat(args[1]) : null;
    let clientSeed = args.length > 2 ? args[2] : generateRandomString(32);
    let serverSeed = args.length > 3 ? args[3] : generateRandomString(32);

    if (isNaN(n) || n <= 0) {
        console.log('Error: rounds must be a positive integer');
        process.exit(1);
    }

    console.log(`Generating outcomes for ${n} rounds`);
    console.log(`Threshold: ${threshold !== null ? threshold : 'Not specified'}`);
    console.log(`Client Seed: ${clientSeed}`);
    console.log(`Server Seed: ${serverSeed}`);
    console.log('Outcomes:');

    let csvContent = 'Round,Multiplier\n';
    let highestMultiplier = 0;
    let highestRound = 0;

    for (let round = 1; round <= n; round++) {
        const nonce = round - 1; // nonce starts at 0
        const multiplier = getMultiplier(nonce, clientSeed, serverSeed);
        console.log(`Round ${round}: ${multiplier}x`);
        csvContent += `${round},${multiplier}\n`;

        // Track the highest multiplier
        if (multiplier > highestMultiplier) {
            highestMultiplier = multiplier;
            highestRound = round;
        }
    }

    // Create csv-output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'csv-output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create timestamped filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(outputDir, `outcomes-${timestamp}.csv`);
    
    fs.writeFileSync(outputFile, csvContent);
    console.log(`\nOutcomes saved to ${outputFile}`);

    // Display highest outcome
    console.log(`\nHighest outcome: Round ${highestRound} with ${highestMultiplier}x`);

    // Display top 10 highest outcomes
    displayTopOutcomes(csvContent);

    if (threshold !== null) {
        const runTimeLengths = getRunTimeLengths(threshold, n, outputFile);
        console.log(`\nRun time lengths below ${threshold}:`);
        runTimeLengths.forEach((length, index) => {
            if (index === runTimeLengths.length - 1 && length === -1) {
                console.log(`Run ${index + 1}: X`);
            } else {
                console.log(`Run ${index + 1}: ${length} rounds`);
            }
        });
    }
}

function displayTopOutcomes(csvContent) {
    const lines = csvContent.trim().split('\n');
    const outcomes = [];

    // Skip header and parse outcomes
    for (let i = 1; i < lines.length; i++) {
        const [round, multiplier] = lines[i].split(',');
        outcomes.push({
            round: parseInt(round),
            multiplier: parseFloat(multiplier)
        });
    }

    // Sort by multiplier in descending order
    outcomes.sort((a, b) => b.multiplier - a.multiplier);

    // Display top 10
    console.log('\nTop 10 highest outcomes:');
    const count = Math.min(10, outcomes.length);
    for (let i = 0; i < count; i++) {
        console.log(`Round ${outcomes[i].round}: ${outcomes[i].multiplier}x`);
    }
}

function getRunTimeLengths(threshold, totalRounds, outputFile) {
    const csvContent = fs.readFileSync(outputFile, 'utf8');
    const lines = csvContent.trim().split('\n');
    const runTimeLengths = [];
    let count = 0;

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const [round, multiplier] = lines[i].split(',');
        const mult = parseFloat(multiplier);

        if (mult >= threshold) {
            runTimeLengths.push(count);
            count = 0; // Reset count after meeting threshold
        } else {
            count++; // Increment count for rounds below threshold
        }
    }

    // Always add the final count as -1 to indicate the run ended without hitting threshold
    runTimeLengths.push(-1);

    return runTimeLengths;
}

if (require.main === module) {
    main();
}