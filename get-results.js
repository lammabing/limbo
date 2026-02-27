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
    if (args.length < 4) {
        console.log('Usage: node get-results.js <clientSeed> <serverSeed> <start-nonce> <end-nonce> [threshold] [--suppress-rounds]');
        console.log('Example: node get-results.js abc123 def456 0 100 2.0');
        console.log('Example with suppressed rounds: node get-results.js abc123 def456 0 100 2.0 --suppress-rounds');
        process.exit(1);
    }

    // Check for suppress flag and remove it from args to avoid affecting positional arguments
    const suppressRounds = args.includes('--suppress-rounds');
    const filteredArgs = args.filter(arg => arg !== '--suppress-rounds');

    if (filteredArgs.length < 4) {
        console.log('Usage: node get-results.js <clientSeed> <serverSeed> <start-nonce> <end-nonce> [threshold] [--suppress-rounds]');
        console.log('Example: node get-results.js abc123 def456 0 100 2.0');
        console.log('Example with suppressed rounds: node get-results.js abc123 def456 0 100 2.0 --suppress-rounds');
        process.exit(1);
    }

    let clientSeed = filteredArgs[0];
    let serverSeed = filteredArgs[1];
    const startNonce = parseInt(filteredArgs[2], 10);
    const endNonce = parseInt(filteredArgs[3], 10);
    const threshold = filteredArgs.length > 4 ? parseFloat(filteredArgs[4]) : null;

    if (isNaN(startNonce) || isNaN(endNonce) || startNonce < 0 || endNonce < startNonce) {
        console.log('Error: start-nonce and end-nonce must be non-negative integers with end-nonce >= start-nonce');
        process.exit(1);
    }

    console.log(`Generating outcomes for nonces from ${startNonce} to ${endNonce}`);
    console.log(`Threshold: ${threshold !== null ? threshold : 'Not specified'}`);
    console.log(`Client Seed: ${clientSeed}`);
    console.log(`Server Seed: ${serverSeed}`);
    console.log('Outcomes:');

    let csvContent = 'Nonce,Multiplier\n';
    let highestMultiplier = 0;
    let highestNonce = startNonce;

    const totalRounds = endNonce - startNonce + 1;
    for (let i = 0; i < totalRounds; i++) {
        const nonce = startNonce + i;
        const multiplier = getMultiplier(nonce, clientSeed, serverSeed);

        // Print individual round outcomes unless suppressed
        if (!suppressRounds) {
            // Highlight outcomes that are greater than or equal to threshold
            if (threshold !== null && multiplier >= threshold) {
                console.log(`Nonce ${nonce}: ${multiplier}x \x1b[32m[HIGH]\x1b[0m`);
            } else {
                console.log(`Nonce ${nonce}: ${multiplier}x`);
            }
        }

        csvContent += `${nonce},${multiplier}\n`;

        // Track the highest multiplier
        if (multiplier > highestMultiplier) {
            highestMultiplier = multiplier;
            highestNonce = nonce;
        }
    }

    // Create csv-output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'csv-output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create timestamped filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(outputDir, `results-${startNonce}-${endNonce}-${timestamp}.csv`);

    fs.writeFileSync(outputFile, csvContent);
    console.log(`\nResults saved to ${outputFile}`);

    // Display highest outcome
    console.log(`\nHighest outcome: Nonce ${highestNonce} with ${highestMultiplier}x`);

    // Display top 10 highest outcomes
    displayTopOutcomes(csvContent);

    if (threshold !== null) {
        const runTimeLengths = getRunTimeLengths(threshold, totalRounds, csvContent);
        console.log(`\nRun time lengths below ${threshold}:`);
        runTimeLengths.forEach((length, index) => {
            if (index === runTimeLengths.length - 1 && length === -1) {
                console.log(`Run ${index + 1}: X`);
            } else {
                console.log(`Run ${index + 1}: ${length} rounds`);
            }
        });

        // Write run-time lengths to a separate CSV file with the same timestamp
        const runTimeOutputFile = outputFile.replace('results-', 'runtime-');
        writeRunTimeLengthsToCSV(runTimeOutputFile, runTimeLengths, threshold);
        console.log(`\nRun-time lengths saved to ${runTimeOutputFile}`);
    }
}

function displayTopOutcomes(csvContent) {
    const lines = csvContent.trim().split('\n');
    const outcomes = [];

    // Skip header and parse outcomes
    for (let i = 1; i < lines.length; i++) {
        const [nonce, multiplier] = lines[i].split(',');
        outcomes.push({
            nonce: parseInt(nonce),
            multiplier: parseFloat(multiplier)
        });
    }

    // Sort by multiplier in descending order
    outcomes.sort((a, b) => b.multiplier - a.multiplier);

    // Display top 10
    console.log('\nTop 10 highest outcomes:');
    const count = Math.min(10, outcomes.length);
    for (let i = 0; i < count; i++) {
        console.log(`Nonce ${outcomes[i].nonce}: ${outcomes[i].multiplier}x`);
    }
}

function getRunTimeLengths(threshold, totalRounds, csvContent) {
    const lines = csvContent.trim().split('\n');
    const runTimeLengths = [];
    let count = 0;

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const [, multiplier] = lines[i].split(',');
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

function writeRunTimeLengthsToCSV(baseOutputFile, runTimeLengths, threshold) {
    // Create CSV content for run-time lengths
    let csvContent = `Run,Length,BelowThreshold\n`;

    runTimeLengths.forEach((length, index) => {
        // Replace -1 with 'X' to indicate ongoing run without hitting threshold
        const displayLength = (index === runTimeLengths.length - 1 && length === -1) ? 'X' : length;
        csvContent += `${index + 1},${displayLength},${threshold}\n`;
    });

    // Write the content to the run-time lengths file
    fs.writeFileSync(baseOutputFile, csvContent);
}

if (require.main === module) {
    main();
}