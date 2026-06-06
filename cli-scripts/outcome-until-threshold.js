const cryptoProvider = require('../crypto.provider');
const { getMultiplier } = cryptoProvider;
const fs = require('fs');
const path = require('path');
const { probAtLeastOne } = require('./prob-xn');

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
        console.log('Usage: node outcome-until-threshold.js <threshold> [clientSeed] [serverSeed] [--suppress-rounds]');
        console.log('Example: node outcome-until-threshold.js 2.0');
        console.log('Example: node outcome-until-threshold.js 2.0 abc123 def456');
        console.log('Example with suppressed rounds: node outcome-until-threshold.js 2.0 --suppress-rounds');
        process.exit(1);
    }

    // Check for suppress flag and remove it from args to avoid affecting positional arguments
    const suppressRounds = args.includes('--suppress-rounds');
    const noCsv = args.includes('--no-csv');
    const filteredArgs = args.filter(arg => arg !== '--suppress-rounds' && arg !== '--no-csv');

    if (filteredArgs.length < 1) {
        console.log('Usage: node outcome-until-threshold.js <threshold> [clientSeed] [serverSeed] [--suppress-rounds] [--no-csv]');
        console.log('Example: node outcome-until-threshold.js 2.0');
        console.log('Example: node outcome-until-threshold.js 2.0 abc123 def456');
        console.log('Example with suppressed rounds: node outcome-until-threshold.js 2.0 --suppress-rounds');
        console.log('Example without CSV output: node outcome-until-threshold.js 2.0 --no-csv');
        process.exit(1);
    }

    const threshold = parseFloat(filteredArgs[0]);
    let clientSeed = filteredArgs.length > 1 ? filteredArgs[1] : generateRandomString(32);
    let serverSeed = filteredArgs.length > 2 ? filteredArgs[2] : generateRandomString(32);

    if (isNaN(threshold) || threshold <= 0) {
        console.log('Error: threshold must be a positive number');
        process.exit(1);
    }

    if (!suppressRounds) {
        console.log(`Threshold: ${threshold}x`);
        console.log(`Client Seed: ${clientSeed}`);
        console.log(`Server Seed: ${serverSeed}`);
        console.log('Generating outcomes...\n');
    }

    let nonce = 0;
    let multiplier = 0;
    let round = 0;

    // Generate outcomes until we hit the threshold
    do {
        round++;
        multiplier = getMultiplier(nonce, clientSeed, serverSeed);
        
        // Highlight outcomes that are greater than or equal to threshold
        if (!suppressRounds) {
            if (multiplier >= threshold) {
                console.log(`Round ${round} (nonce ${nonce}): ${multiplier}x \x1b[32m[THRESHOLD REACHED]\x1b[0m`);
            } else {
                console.log(`Round ${round} (nonce ${nonce}): ${multiplier}x`);
            }
        }
        
        nonce++;
    } while (multiplier < threshold);

    // Display and save result summary
    displayAndSaveResult(round, nonce - 1, threshold, multiplier, clientSeed, serverSeed, suppressRounds, noCsv);
}

function displayAndSaveResult(totalRounds, finalNonce, threshold, multiplier, clientSeed, serverSeed, suppressRounds, noCsv) {
    const result = {
        timestamp: new Date().toISOString(),
        totalRounds,
        finalNonce,
        threshold,
        achievedMultiplier: multiplier,
        clientSeed,
        serverSeed
    };

    // Calculate probability of hitting threshold within totalRounds
    const probability = probAtLeastOne(threshold, totalRounds);
    const probabilityPercent = (probability * 100).toFixed(4);

    // Always display summary
    console.log('\n========================================');
    console.log('Result Summary:');
    console.log('========================================');
    console.log(`Total rounds played: ${totalRounds}`);
    console.log(`Final nonce: ${finalNonce}`);
    console.log(`Threshold multiplier: ${threshold}x`);
    console.log(`Achieved multiplier: ${multiplier}x`);
    console.log(`Client Seed: ${clientSeed}`);
    console.log(`Server Seed: ${serverSeed}`);
    console.log('----------------------------------------');
    console.log(`Probability of X >= ${threshold} in ${totalRounds} trials: ${probability.toFixed(6)} (${probabilityPercent}%)`);
    console.log('========================================');

    // Append to CSV file unless noCsv flag is set
    if (!noCsv) {
        appendResultToCSV(result);
    } else {
        console.log('\nCSV output disabled');
    }
}

function appendResultToCSV(result) {
    const outputDir = path.join(__dirname, '..', 'csv-output');
    
    // Create csv-output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, 'outcome-results.csv');
        const csvRow = `${result.totalRounds},${result.finalNonce},${result.threshold},${result.achievedMultiplier},${result.clientSeed},${result.serverSeed}\n`;

    // Write header if file doesn't exist, otherwise append just the row
    if (!fs.existsSync(outputFile)) {
        const csvHeader = 'TotalRounds,FinalNonce,Threshold,AchievedMultiplier,ClientSeed,ServerSeed\n';
        fs.writeFileSync(outputFile, csvHeader + csvRow);
    } else {
        fs.appendFileSync(outputFile, csvRow);
    }

    console.log(`\nResult appended to ${outputFile}`);
}

if (require.main === module) {
    main();
}
