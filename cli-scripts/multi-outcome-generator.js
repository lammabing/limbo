const { spawn } = require('child_process');
const crypto = require('crypto');

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

function runOutcomeGenerator(clientSeed, serverSeed, rounds, threshold = null) {
    return new Promise((resolve, reject) => {
        const args = ['./cli-scripts/outcome-generator.js', clientSeed, serverSeed, rounds.toString()];
        if (threshold !== null) {
            args.push(threshold.toString());
        }

        const child = spawn('node', args, {
            stdio: 'inherit',
            cwd: process.cwd()
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
    if (args.length < 2) {
        console.log('Usage: node multi-outcome-generator.js <iterations> <rounds> [threshold]');
        console.log('Example: node multi-outcome-generator.js 3 10 2.0');
        console.log('This will run 3 iterations, each with 10 rounds, analyzing threshold 2.0');
        process.exit(1);
    }

    const iterations = parseInt(args[0], 10);
    const rounds = parseInt(args[1], 10);
    const threshold = args.length > 2 ? parseFloat(args[2]) : null;

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
            await runOutcomeGenerator(clientSeed, serverSeed, rounds, threshold);
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