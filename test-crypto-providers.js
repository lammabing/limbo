const cryptoProvider = require('./crypto.provider');

// Test seeds
const clientSeed = 'testClientSeed123';
const serverSeed = 'testServerSeed456';
const nonce = 0;

console.log('Testing crypto providers...\\n');

// Test BCH provider
cryptoProvider.setProvider('bch');
let multiplier = cryptoProvider.getMultiplier(nonce, clientSeed, serverSeed);
console.log(`BCH Provider - Multiplier: ${multiplier}`);

// Test Bustadice provider
cryptoProvider.setProvider('bustadice');
multiplier = cryptoProvider.getMultiplier(nonce, clientSeed, serverSeed);
console.log(`Bustadice Provider - Multiplier: ${multiplier}`);

console.log('\\nTesting completed successfully!');