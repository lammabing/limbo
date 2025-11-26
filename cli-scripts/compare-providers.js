#!/usr/bin/env node

/**
 * Script to compare outcomes from different crypto providers using the same seeds
 * Usage: node compare-providers.js <rounds> [clientSeed] [serverSeed]
 */

const { setProvider, getMultiplier } = require('../crypto.provider.js');

function generateOutcomes(clientSeed, serverSeed, rounds) {
  console.log(`Generating ${rounds} outcomes for client seed: ${clientSeed}, server seed: ${serverSeed}\n`);

  // Create a table header
  console.log('| Round | BCH Multiplier | Bustadice Multiplier | Stake Multiplier |');
  console.log('|-------|----------------|----------------------|------------------|');

  // For each round, calculate multipliers for all three providers
  for (let i = 0; i < rounds; i++) {
    // Get multiplier for BCH provider
    setProvider('bch');
    const bchMultiplier = getMultiplier(i, clientSeed, serverSeed, 0.02); // BCH uses house edge

    // Get multiplier for Bustadice provider
    setProvider('bustadice');
    const bustadiceMultiplier = getMultiplier(i, clientSeed, serverSeed);

    // Get multiplier for Stake provider
    setProvider('stake');
    const stakeMultiplier = getMultiplier(i, clientSeed, serverSeed);

    // Print the results in a table row format
    console.log(`| ${i+1}     | ${bchMultiplier.toFixed(2)}x           | ${bustadiceMultiplier.toFixed(2)}x                 | ${stakeMultiplier.toFixed(2)}x             |`);
  }

  console.log('\nComparison Summary:');
  console.log('====================');

  // Calculate and display statistics for each provider
  let bchTotal = 0;
  let bustadiceTotal = 0;
  let stakeTotal = 0;
  let bchHighest = 0;
  let bustadiceHighest = 0;
  let stakeHighest = 0;
  let bchCount = 0;
  let bustadiceCount = 0;
  let stakeCount = 0;

  for (let i = 0; i < rounds; i++) {
    // BCH
    setProvider('bch');
    const bch = getMultiplier(i, clientSeed, serverSeed, 0.02);
    bchTotal += bch;
    if (bch > bchHighest) bchHighest = bch;
    if (bch >= 2.0) bchCount++;

    // Bustadice
    setProvider('bustadice');
    const bustadice = getMultiplier(i, clientSeed, serverSeed);
    bustadiceTotal += bustadice;
    if (bustadice > bustadiceHighest) bustadiceHighest = bustadice;
    if (bustadice >= 2.0) bustadiceCount++;

    // Stake
    setProvider('stake');
    const stake = getMultiplier(i, clientSeed, serverSeed);
    stakeTotal += stake;
    if (stake > stakeHighest) stakeHighest = stake;
    if (stake >= 2.0) stakeCount++;
  }

  console.log(`BCH - Avg: ${(bchTotal/rounds).toFixed(2)}x, Highest: ${bchHighest.toFixed(2)}x, Wins (≥2x): ${bchCount}/${rounds}`);
  console.log(`Bustadice - Avg: ${(bustadiceTotal/rounds).toFixed(2)}x, Highest: ${bustadiceHighest.toFixed(2)}x, Wins (≥2x): ${bustadiceCount}/${rounds}`);
  console.log(`Stake - Avg: ${(stakeTotal/rounds).toFixed(2)}x, Highest: ${stakeHighest.toFixed(2)}x, Wins (≥2x): ${stakeCount}/${rounds}`);
}

function generateRandomSeed() {
  // Generate a random string of 32 characters using hexadecimal characters
  return Array.from({length: 32}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('Usage: node compare-providers.js <rounds> [clientSeed] [serverSeed]');
    console.log('Example: node compare-providers.js 10 "myClientSeed123" "myServerSeed456"');
    process.exit(1);
  }

  const rounds = parseInt(args[0], 10);
  const providedClientSeed = args[1];
  const providedServerSeed = args[2];

  if (isNaN(rounds) || rounds <= 0) {
    console.error('Error: rounds must be a positive integer');
    process.exit(1);
  }

  // Generate random seeds if not provided
  const clientSeed = providedClientSeed || generateRandomSeed();
  const serverSeed = providedServerSeed || generateRandomSeed();

  generateOutcomes(clientSeed, serverSeed, rounds);
}

module.exports = { generateOutcomes };