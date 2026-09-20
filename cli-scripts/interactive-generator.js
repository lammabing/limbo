const readline = require('readline');
const { spawn } = require('child_process');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
    console.log('=== Interactive Outcome Generator ===\n');

    const rounds = await ask('Rounds (required, positive integer): ');
    if (!/^\d+$/.test(rounds) || parseInt(rounds) <= 0) {
        console.log('Error: rounds must be a positive integer.');
        rl.close();
        return;
    }

    const threshold = await ask('Threshold multiplier (optional, e.g. 2.0, leave blank to skip): ');
    if (threshold && (isNaN(parseFloat(threshold)) || parseFloat(threshold) <= 0)) {
        console.log('Error: threshold must be a positive number.');
        rl.close();
        return;
    }

    const clientSeed = await ask('Client seed (optional, leave blank to auto-generate): ');
    const serverSeed = await ask('Server seed (optional, leave blank to auto-generate): ');

    const suppressRoundsStr = await ask('Suppress individual round output? (y/N): ');
    const suppressRounds = suppressRoundsStr.toLowerCase() === 'y';

    const noCsvStr = await ask('Disable CSV output? (y/N): ');
    const noCsv = noCsvStr.toLowerCase() === 'y';

    console.log('\n--- Running outcome-generator.js ---\n');

    const args = [rounds];
    if (threshold) args.push(threshold);
    if (clientSeed) args.push(clientSeed);
    if (serverSeed) args.push(serverSeed);
    if (suppressRounds) args.push('--suppress-rounds');
    if (noCsv) args.push('--no-csv');

    const generator = spawn('node', [path.join(__dirname, 'outcome-generator.js'), ...args], {
        stdio: 'inherit'
    });

    generator.on('close', code => {
        console.log(`\nGenerator exited with code ${code}`);
        rl.close();
    });
}

main();
