const { spawn } = require('child_process');
const path = require('path');

function generateRandomSeed(length = 32) {
    // Declare all characters
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Pick characters randomly
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
}

function runOutcomeGenerator(clientSeed, serverSeed, rounds, threshold = null, noCsv = false, suppressRounds = false) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'outcome-generator.js');
        const args = [scriptPath, rounds.toString()];
        if (threshold !== null) {
            args.push(threshold.toString());
        }
        args.push(clientSeed, serverSeed);
        if (noCsv) {
            args.push('--no-csv');
        }
        if (suppressRounds) {
            args.push('--suppress-rounds');
        }

        const child = spawn('node', args, {
            stdio: 'inherit',
            cwd: __dirname
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Process exited with code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function main() {
    const args = process.argv.slice(2);
    const noCsv = args.includes('--no-csv');
    const suppressRounds = args.includes('--suppress-rounds') || args.includes('--suppress-output');
    const filteredArgs = args.filter(arg => arg !== '--no-csv' && arg !== '--suppress-rounds' && arg !== '--suppress-output');

    if (filteredArgs.length < 2) {
        console.log('Usage: node multi-outcome-generator.js <iterations> <rounds> [threshold] [--no-csv] [--suppress-rounds]');
        console.log('Example: node multi-outcome-generator.js 3 10 2.0 --no-csv');
        console.log('This will run 3 iterations, each with 10 rounds, analyzing threshold 2.0');
        process.exit(1);
    }

    const iterations = parseInt(filteredArgs[0], 10);
    const rounds = parseInt(filteredArgs[1], 10);
    const threshold = filteredArgs.length > 2 ? parseFloat(filteredArgs[2]) : null;

    if (isNaN(iterations) || iterations <= 0) {
        console.log('Error: iterations must be a positive integer');
        process.exit(1);
    }

    if (isNaN(rounds) || rounds <= 0) {
        console.log('Error: rounds must be a positive integer');
        process.exit(1);
    }

    console.log(`Running ${iterations} iterations, each with ${rounds} rounds${threshold ? `, threshold: ${threshold}` : ''}`);
    console.log('=' .repeat(60));

    for (let i = 1; i <= iterations; i++) {
        const clientSeed = generateRandomSeed();
        const serverSeed = generateRandomSeed();

        console.log(`\n--- Iteration ${i} ---`);
        console.log(`Client Seed: ${clientSeed}`);
        console.log(`Server Seed: ${serverSeed}`);

        try {
            await runOutcomeGenerator(clientSeed, serverSeed, rounds, threshold, noCsv, suppressRounds);
            console.log(`Iteration ${i} completed successfully`);
        } catch (error) {
            console.error(`Iteration ${i} failed:`, error.message);
        }

        // Add a small delay between iterations
        if (i < iterations) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    console.log('\n' + '=' .repeat(60));
    console.log(`All ${iterations} iterations completed!`);
}

if (require.main === module) {
    main().catch(console.error);
}