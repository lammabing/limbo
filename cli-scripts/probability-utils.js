/**
 * Probability utilities for limbo game outcomes
 * 
 * Based on distribution: P(1 <= X < x) = 1 - 1/x
 * Which means P(X >= x) = 1/x for a single trial
 */

/**
 * Calculates the probability that at least one of n trials
 * attains a value >= x
 * 
 * Formula: P = 1 - (1 - 1/x)^n
 * 
 * @param {number} x - Target threshold (>= 1)
 * @param {number|number[]} n - Number of trials: single value or range [min, max]
 * @returns {number|Object} Probability for single n, or object with range results
 */
function probabilityAtLeastOne(x, n) {
    if (x < 1) {
        return typeof n === 'number' ? 1 : Object.fromEntries(
            Array.from({ length: n[1] - n[0] + 1 }, (_, i) => [n[0] + i, 1])
        );
    }
    if (x === Infinity) {
        return typeof n === 'number' ? 0 : Object.fromEntries(
            Array.from({ length: n[1] - n[0] + 1 }, (_, i) => [n[0] + i, 0])
        );
    }

    const calcProb = (trials) => 1 - Math.pow(1 - 1 / x, trials);

    // Single value input
    if (typeof n === 'number') {
        return calcProb(n);
    }

    // Range input [min, max]
    if (Array.isArray(n) && n.length === 2) {
        const [min, max] = n;
        if (min > max || !Number.isInteger(min) || !Number.isInteger(max)) {
            return { error: 'Invalid range. Use [min, max] with integers.' };
        }
        const results = {};
        for (let i = min; i <= max; i++) {
            results[i] = calcProb(i);
        }
        return results;
    }

    return { error: 'n must be a number or [min, max] array' };
}

/**
 * Returns minimum n trials needed to achieve at least probability P
 * of getting at least one outcome >= x
 * 
 * Formula: n = ln(1 - P) / ln(1 - 1/x)
 * 
 * @param {number} x - Target threshold (>= 1)
 * @param {number|number[]} p - Target probability (0-1) or range [min, max] in steps of 0.01
 * @returns {number|Object} Required n trials or object with range results
 */
function trialsForProbability(x, p) {
    if (x < 1) {
        return typeof p === 'number' ? 0 : { error: 'x must be >= 1' };
    }
    if (x === Infinity) {
        return typeof p === 'number' ? Infinity : { error: 'Cannot achieve probability for x=Infinity' };
    }

    const calcN = (prob) => {
        if (prob <= 0) return 0;
        if (prob >= 1) return Infinity;
        return Math.ceil(Math.log(1 - prob) / Math.log(1 - 1 / x));
    };

    // Single value input
    if (typeof p === 'number') {
        return calcN(p);
    }

    // Range input [min, max]
    if (Array.isArray(p) && p.length === 2) {
        const [pMin, pMax] = p;
        const results = {};
        for (let prob = pMin; prob <= pMax + 0.001; prob += 0.01) {
            const roundedProb = Math.round(prob * 100) / 100;
            if (!results.hasOwnProperty(roundedProb)) {
                results[roundedProb] = calcN(roundedProb);
            }
        }
        return results;
    }

    return { error: 'p must be a number or [min, max] array' };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { probabilityAtLeastOne, trialsForProbability };
}

// CLI usage
if (require.main === module) {
    const x = parseFloat(process.argv[2]) || 42;
    const mode = process.argv[3] || 'forward';

    console.log(`\\n=== Probability Utilities (x = ${x}) ===\\n`);

    if (mode === 'forward' || mode === 'f') {
        // Forward: given n, find P
        console.log('P(at least one >= x) for n trials:\\n');
        console.log('n\\tProbability');
        console.log('-'.repeat(30));
        const probs = probabilityAtLeastOne(x, [1, 42]);
        for (const [n, prob] of Object.entries(probs)) {
            console.log(`${n}\\t${prob.toFixed(6)}`);
        }
    }

    if (mode === 'inverse' || mode === 'i') {
        // Inverse: given P, find n
        console.log('Trials needed for target probability:\\n');
        console.log('P\\t\\tn');
        console.log('-'.repeat(30));
        const targets = trialsForProbability(x, [0.1, 0.99]);
        for (const [prob, n] of Object.entries(targets)) {
            console.log(`${parseFloat(prob).toFixed(2)}\\t${n}`);
        }
    }

    console.log('\\n--- Usage ---');
    console.log('node probability-utils.js [x] [mode]');
    console.log('  x: target threshold (default: 42)');
    console.log('  mode: "forward" or "f" (default), "inverse" or "i"');
}
