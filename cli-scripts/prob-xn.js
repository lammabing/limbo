/**
 * Probability of X in at least one of N repeated trials
 *
 * Based on limbo distribution: P(X >= x) = 1/x for a single trial
 * Formula: P(at least one >= x in n trials) = 1 - (1 - 1/x)^n
 *
 * With a house edge e integrated, the per-trial win probability becomes
 * (1 - e) / x (e.g. edge 0.01 -> 0.99/x), so:
 *   P(at least one) = 1 - (1 - (1 - e)/x)^n
 */

/**
 * Calculates the probability that at least one of n trials
 * attains a value >= x
 *
 * @param {number} x - Target threshold (>= 1)
 * @param {number} n - Number of trials
 * @param {number} [houseEdge=0] - House edge as a fraction (0-1), e.g. 0.01 for 1%
 * @returns {number} Probability (0-1)
 */
function probAtLeastOne(x, n, houseEdge = 0) {
    if (x < 1) return 1;
    if (x === Infinity) return 0;
    if (n <= 0) return 0;

    const p = (1 - houseEdge) / x;
    return 1 - Math.pow(1 - p, n);
}

/**
 * Calculates probabilities for a range of n values
 *
 * @param {number} x - Target threshold (>= 1)
 * @param {number} nMin - Minimum number of trials
 * @param {number} nMax - Maximum number of trials
 * @param {number} [houseEdge=0] - House edge as a fraction (0-1), e.g. 0.01 for 1%
 * @returns {Array<{n: number, probability: number, percentage: string}>}
 */
function probAtLeastOneRange(x, nMin, nMax, houseEdge = 0) {
    const results = [];
    
    for (let n = nMin; n <= nMax; n++) {
        const prob = probAtLeastOne(x, n, houseEdge);
        results.push({
            n,
            probability: prob,
            percentage: (prob * 100).toFixed(4) + '%'
        });
    }
    
    return results;
}

/**
 * Formats results as a table string
 *
 * @param {Array<{n: number, probability: number, percentage: string}>} results
 * @param {number} x - Target threshold (for header)
 * @returns {string} Formatted table
 */
function edgeLabel(houseEdge) {
    return houseEdge > 0 ? ` (house edge ${(houseEdge * 100).toFixed(2)}%)` : '';
}

function formatTable(results, x, houseEdge = 0) {
    const header = `=== Probability of at least one X >= ${x} in N trials${edgeLabel(houseEdge)} ===\n\n`;
    const colHeader = `│ ${'N'.padStart(8)} │ ${'Probability'.padStart(11)} │ ${'Percentage'.padStart(12)} │`;
    const separator = '├' + '─'.repeat(10) + '┼' + '─'.repeat(13) + '┼' + '─'.repeat(14) + '┤';
    const topBorder = '┌' + '─'.repeat(10) + '┬' + '─'.repeat(13) + '┬' + '─'.repeat(14) + '┐';
    const bottomBorder = '└' + '─'.repeat(10) + '┴' + '─'.repeat(13) + '┴' + '─'.repeat(14) + '┘';
    
    let table = header;
    table += topBorder + '\n';
    table += colHeader + '\n';
    table += separator + '\n';
    
    for (const row of results) {
        const nStr = row.n.toString().padStart(8);
        const probStr = row.probability.toFixed(6).padStart(11);
        const pctStr = row.percentage.padStart(12);
        table += `│ ${nStr} │ ${probStr} │ ${pctStr} │\n`;
    }
    
    table += bottomBorder;
    
    return table;
}

/**
 * Formats results as a simple column output
 *
 * @param {Array<{n: number, probability: number, percentage: string}>} results
 * @param {number} x - Target threshold (for header)
 * @returns {string} Column-formatted output
 */
function formatColumn(results, x, houseEdge = 0) {
    let output = `=== Probability of at least one X >= ${x} in N trials${edgeLabel(houseEdge)} ===\n\n`;
    output += 'N\tProbability\tPercentage\n';
    output += '-'.repeat(40) + '\n';
    
    for (const row of results) {
        output += `${row.n}\t${row.probability.toFixed(6)}\t${row.percentage}\n`;
    }
    
    return output;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { probAtLeastOne, probAtLeastOneRange, formatTable, formatColumn };
}

// CLI usage
if (require.main === module) {
    const usage = () => {
        console.log('\nUsage: node prob-xn.js [x] [n] [edge] [format]');
        console.log('       node prob-xn.js [x] [nMin] [nMax] [edge] [format]');
        console.log('  x: target threshold (e.g., 42)');
        console.log('  n: single number of trials');
        console.log('  nMin: minimum trials (default: 1)');
        console.log('  nMax: maximum trials (default: 100)');
        console.log('  edge: house edge as fraction (default: 0), e.g. 0.01 or 1%%');
        console.log('  format: "table" (default) or "column"');
    };

    if (!process.argv[2]) {
        console.error('Error: Missing required argument x');
        usage();
        process.exit(1);
    }

    const x = parseFloat(process.argv[2]);
    if (isNaN(x) || x < 1) {
        console.error('Error: x must be a number >= 1');
        usage();
        process.exit(1);
    }

    // Split remaining args into numeric values and the format keyword
    const rawArgs = process.argv.slice(3);
    let format = 'table';
    const numericArgs = [];
    for (const arg of rawArgs) {
        if (arg === 'table' || arg === 'column' || arg === 'c' || arg === 't') {
            format = arg;
        } else {
            const v = parseFloat(arg);
            if (isNaN(v)) {
                console.error(`Error: unrecognized argument "${arg}"`);
                usage();
                process.exit(1);
            }
            numericArgs.push(v);
        }
    }

    // Allow edge as a percentage (>= 1 would be ambiguous with trials, so
    // percentages >= 1% must be given as fractions, e.g. 0.01)
    let houseEdge = 0;
    const trials = [];
    for (const v of numericArgs) {
        if (v >= 0 && v < 1 && trials.length > 0) {
            houseEdge = v;
        } else if (v >= 1) {
            trials.push(Math.floor(v));
        } else {
            console.error(`Error: invalid value ${v} (trials must be >= 1, edge must be 0 <= edge < 1)`);
            usage();
            process.exit(1);
        }
    }

    if (trials.length === 0) {
        trials.push(1, 100); // default range
    }

    if (trials.length === 1) {
        const n = trials[0];
        if (n < 1) {
            console.error('Error: n must be a positive integer');
            usage();
            process.exit(1);
        }
        const prob = probAtLeastOne(x, n, houseEdge);
        console.log(`\n=== Probability of at least one X >= ${x} in ${n} trials${edgeLabel(houseEdge)} ===\n`);
        console.log(`P = ${prob.toFixed(6)} (${(prob * 100).toFixed(4)}%)\n`);
    } else {
        const [nMin, nMax] = trials;
        const results = probAtLeastOneRange(x, nMin, nMax, houseEdge);

        if (format === 'column' || format === 'c') {
            console.log(formatColumn(results, x, houseEdge));
        } else {
            console.log(formatTable(results, x, houseEdge));
        }
    }
}
