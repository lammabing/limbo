const { getMultiplier } = require('./crypto.bch.js');
const fs = require('fs');

function main() {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log('Usage: node outcome-generator.js <clientSeed> <serverSeed> <n> [threshold]');
        console.log('Example: node outcome-generator.js abc123 def456 10 2.0');
        process.exit(1);
    }

    const clientSeed = args[0];
    const serverSeed = args[1];
    const n = parseInt(args[2], 10);
    const threshold = args.length > 3 ? parseFloat(args[3]) : null;

    if (isNaN(n) || n <= 0) {
        console.log('Error: n must be a positive integer');
        process.exit(1);
    }

    console.log(`Generating outcomes for ${n} rounds with clientSeed: ${clientSeed}, serverSeed: ${serverSeed}`);
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

    const outputFile = 'outcomes.csv';
    fs.writeFileSync(outputFile, csvContent);
    console.log(`\nOutcomes saved to ${outputFile}`);

    // Display highest outcome
    console.log(`\nHighest outcome: Round ${highestRound} with ${highestMultiplier}x`);

    if (threshold !== null) {
        const runTimeLength = getRunTimeLength(threshold);
        console.log(`Run time length below ${threshold}: ${runTimeLength} rounds`);
    }
}

function getRunTimeLength(threshold) {
    const csvContent = fs.readFileSync('outcomes.csv', 'utf8');
    const lines = csvContent.trim().split('\n');

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const [round, multiplier] = lines[i].split(',');
        const mult = parseFloat(multiplier);

        if (mult >= threshold) {
            return i - 1; // Return the count of rounds below threshold
        }
    }

    return lines.length - 1; // All rounds are below threshold
}

if (require.main === module) {
    main();
}