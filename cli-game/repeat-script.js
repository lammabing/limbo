#!/usr/bin/env node
/**
 * repeat-n-times.js
 *
 * Usage:
 *   node repeat-n-times.js <N> -- script.js 1000 20 11
 *
 * The part after `--` is passed **exactly** to the target script.
 */

const { spawn } = require('child_process');
const path = require('path');

function parse() {
  const sep = process.argv.indexOf('--');
  if (sep === -1 || sep + 1 >= process.argv.length) {
    console.error('Usage: node repeat-n-times.js <N> -- <script> [args...]');
    process.exit(1);
  }

  const n = Number(process.argv[sep - 1]);
  if (!Number.isInteger(n) || n <= 0) {
    console.error('N must be a positive integer');
    process.exit(1);
  }

  const script = path.resolve(process.argv[sep + 1]);
  const args   = process.argv.slice(sep + 2);

  return { n, script, args };
}

function runOne(script, args, cb) {
  console.log(`\n=== Run ${runOne.counter++} : node ${path.basename(script)} ${args.join(' ')} ===`);
  const child = spawn('node', [script, ...args], { stdio: 'inherit' });

  child.on('close', code => cb(code));
  child.on('error', err => {
    console.error('Spawn error:', err);
    cb(1);
  });
}
runOne.counter = 1;

function main() {
  const { n, script, args } = parse();
  let left = n;

  const next = () => {
    if (left <= 0) {
      console.log('\nAll repetitions finished.');
      process.exit(0);
    }
    left--;
    runOne(script, args, code => {
      // optional: abort on failure
      // if (code !== 0) { console.error('Aborting'); process.exit(code); }
      setImmediate(next);
    });
  };

  next();
}

main();