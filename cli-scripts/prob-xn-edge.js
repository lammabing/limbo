/**
 * Probability of X in at least one of N repeated trials
 * WITH house edge factored in
 *
 * Based on limbo distribution with house edge e:
 *   P(X >= x) = (1 - e) / x for a single trial
 * Formula: P(at least one >= x in n trials) = 1 - (1 - (1-e)/x)^n
 *
 * Default house edge = 0.02 (2%), sourced from crypto.bch.js
 */

const DEFAULT_HOUSE_EDGE = 0.02;

function probAtLeastOne(x, n, houseEdge = DEFAULT_HOUSE_EDGE) {
    if (x < 1) return 1;
    if (x === Infinity) return 0;
    if (n <= 0) return 0;

    const singleProb = (1 - houseEdge) / x;
    return 1 - Math.pow(1 - singleProb, n);
}

function probAtLeastOneRange(x, nMin, nMax, houseEdge = DEFAULT_HOUSE_EDGE) {
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

function formatTable(results, x, houseEdge) {
    const header = `=== Probability of at least one X >= ${x} in N trials (edge: ${(houseEdge * 100).toFixed(2)}%) ===\n\n`;
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

function formatColumn(results, x, houseEdge) {
    let output = `=== Probability of at least one X >= ${x} in N trials (edge: ${(houseEdge * 100).toFixed(2)}%) ===\n\n`;
    output += 'N\tProbability\tPercentage\n';
    output += '-'.repeat(40) + '\n';

    for (const row of results) {
        output += `${row.n}\t${row.probability.toFixed(6)}\t${row.percentage}\n`;
    }

    return output;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { probAtLeastOne, probAtLeastOneRange, formatTable, formatColumn, DEFAULT_HOUSE_EDGE };
}

if (require.main === module) {
    const args = process.argv.slice(2);
    let houseEdge = DEFAULT_HOUSE_EDGE;

    // Check for --edge flag
    const edgeIdx = args.indexOf('--edge');
    if (edgeIdx !== -1 && edgeIdx + 1 < args.length) {
        const parsed = parseFloat(args[edgeIdx + 1]);
        if (!isNaN(parsed) && parsed >= 0 && parsed < 1) {
            houseEdge = parsed;
        } else {
            console.error('Error: --edge must be a number between 0 and 1');
            process.exit(1);
        }
        // Remove --edge and its value from args
        args.splice(edgeIdx, 2);
    }

    const x = parseFloat(args[0]);
    const arg3 = args[1];
    const arg4 = args[2];
    const format = args[3] || 'table';

    if (!x) {
        console.error('Error: Missing required argument x');
        console.log('\nUsage: node prob-xn-edge.js [x] [n] [--edge <houseEdge>] [format]');
        console.log('       node prob-xn-edge.js [x] [nMin] [nMax] [--edge <houseEdge>] [format]');
        console.log('  x: target threshold (e.g., 42)');
        console.log('  n: single number of trials');
        console.log('  nMin: minimum trials (default: 1)');
        console.log('  nMax: maximum trials (default: 100)');
        console.log('  --edge: house edge (default: 0.02 / 2%%)');
        console.log('  format: "table" (default) or "column"');
        process.exit(1);
    }

    if (isNaN(x) || x < 1) {
        console.error('Error: x must be a number >= 1');
        console.log('\nUsage: node prob-xn-edge.js [x] [n] [--edge <houseEdge>] [format]');
        console.log('       node prob-xn-edge.js [x] [nMin] [nMax] [--edge <houseEdge>] [format]');
        console.log('  x: target threshold (e.g., 42)');
        console.log('  n: single number of trials');
        console.log('  nMin: minimum trials (default: 1)');
        console.log('  nMax: maximum trials (default: 100)');
        console.log('  --edge: house edge (default: 0.02 / 2%%)');
        console.log('  format: "table" (default) or "column"');
        process.exit(1);
    }

    if (arg3 && !arg4) {
        const n = parseInt(arg3);
        if (isNaN(n) || n < 1) {
            console.error('Error: n must be a positive integer');
            console.log('\nUsage: node prob-xn-edge.js [x] [n] [--edge <houseEdge>] [format]');
            console.log('       node prob-xn-edge.js [x] [nMin] [nMax] [--edge <houseEdge>] [format]');
            console.log('  x: target threshold (e.g., 42)');
            console.log('  n: single number of trials');
            console.log('  nMin: minimum trials (default: 1)');
            console.log('  nMax: maximum trials (default: 100)');
            console.log('  --edge: house edge (default: 0.02 / 2%%)');
            console.log('  format: "table" (default) or "column"');
            process.exit(1);
        }
        const prob = probAtLeastOne(x, n, houseEdge);
        console.log(`\n=== Probability of at least one X >= ${x} in ${n} trials (edge: ${(houseEdge * 100).toFixed(2)}%) ===\n`);
        console.log(`P = ${prob.toFixed(6)} (${(prob * 100).toFixed(4)}%)\n`);
    } else {
        const nMin = parseInt(arg3) || 1;
        const nMax = parseInt(arg4) || 100;
        const results = probAtLeastOneRange(x, nMin, nMax, houseEdge);

        if (format === 'column' || format === 'c') {
            console.log(formatColumn(results, x, houseEdge));
        } else {
            console.log(formatTable(results, x, houseEdge));
        }
    }
}
