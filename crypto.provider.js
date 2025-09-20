const { getMultiplier: getMultiplierBCH } = require('./crypto.bch');
const { getMultiplier: getMultiplierBustadice } = require('./crypto.bustadice');
const { getMultiplier: getMultiplierStake } = require('./crypto.stake');

// Map of available crypto providers
const providers = {
  'bch': getMultiplierBCH,
  'bustadice': getMultiplierBustadice,
  'stake': getMultiplierStake
};

// Default provider
let currentProvider = 'bch';

/**
 * Set the crypto provider to use
 * @param {string} provider - The provider name ('bch', 'bustadice', or 'stake')
 */
function setProvider(provider) {
  if (!providers[provider]) {
    throw new Error(`Unknown crypto provider: ${provider}. Available providers: ${Object.keys(providers).join(', ')}`);
  }
  currentProvider = provider;
}

/**
 * Get the currently configured provider name
 * @returns {string} The current provider name
 */
function getCurrentProvider() {
  return currentProvider;
}

/**
 * Get multiplier using the currently configured provider
 * @param {number} nonce - The game nonce
 * @param {string} clientSeed - The client seed
 * @param {string} serverSeed - The server seed
 * @param {number} houseEdge - The house edge (only used by BCH provider)
 * @returns {number} The calculated multiplier
 */
function getMultiplier(nonce, clientSeed, serverSeed, houseEdge = 0.02) {
  const provider = providers[currentProvider];
  
  if (!provider) {
    throw new Error(`No provider found for: ${currentProvider}`);
  }
  
  // BCH provider takes houseEdge as a parameter, bustadice does not
  if (currentProvider === 'bch') {
    return provider(nonce, clientSeed, serverSeed, houseEdge);
  } else {
    // Bustadice implementation doesn't use houseEdge parameter
    return provider(nonce, clientSeed, serverSeed);
  }
}

module.exports = {
  setProvider,
  getCurrentProvider,
  getMultiplier,
  providers: Object.keys(providers)
};