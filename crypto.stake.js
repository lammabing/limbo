const crypto = require('crypto');

/**
 * Create HMAC hash
 * @param {string} input - Input string to hash
 * @param {string} type - Hash type (default: 'sha256')
 * @returns {string} Hex digest of the hash
 */
function createHash(input, type = 'sha256') {
  return crypto.createHmac('sha256', `${input}`).digest('hex');
}

/**
 * Generate random hash string
 * @param {number} length - Length of the hash string to generate
 * @returns {string} Random hash string
 */
function randomHash(length = 64) {
  // Declare all characters
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  // Pick characters randomly
  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;
}

/**
 * Create HMAC hash with update
 * @param {string} arg1 - Key for HMAC
 * @param {string} arg2 - Data to hash
 * @returns {string} Hex digest of the hash
 */
function hmacCreateUpdate(arg1, arg2) {
  return crypto
    .createHmac('sha256', `${arg1}`)
    .update(`${arg2}`)
    .digest('hex');
}

/**
 * Calculate multiplier using the Stake.com algorithm
 * @param {number} nonce - Game nonce
 * @param {string} clientSeed - Client seed
 * @param {string} serverSeed - Server seed
 * @returns {number|Array} Calculated multiplier or seed information if nonce < 0
 */
function getMultiplier(nonce, clientSeed = '', serverSeed = '') {
  let map;
  
  if (typeof map == 'undefined') {
    map = new Map();
    if (!clientSeed) {
      map.set('clientSeed', randomHash(32));
      map.set('serverSeed', randomHash(16) + '_' + randomHash(16));
    } else {
      map.set('clientSeed', clientSeed);
      map.set('serverSeed', serverSeed);
    }
    const [auditSeed, gameSeed] = map
      .get('serverSeed')
      .split('_')
      .filter((v) => !!v);
    map.set('auditSeed', auditSeed);
    map.set('gameSeed', gameSeed);
  }
  
  clientSeed = map.get('clientSeed');
  serverSeed = map.get('serverSeed');
  const auditSeed = map.get('auditSeed');
  const gameSeed = map.get('gameSeed');
  
  const wagerHash = hmacCreateUpdate(auditSeed, '' + nonce);
  let hash = hmacCreateUpdate(
    `${gameSeed}|${clientSeed}|${nonce}`,
    `${wagerHash}`
  );
  hash = hash.substr(0, 52 / 4);

  // convert to a number that is uniformly distributed in [0; 1)
  const X = parseInt(hash, 16) / Math.pow(2, 52);
  let multiplier = Math.floor(99 / (1 - X)) / 100;
  if (multiplier <= 1) {
    multiplier = 1.01;
  }
  
  if (nonce < 0) {
    return [
      { clientSeed },
      { serverSeed },
      { auditSeed },
      { gameSeed },
      { wagerHash },
      { hash },
    ];
  } else {
    return multiplier;
  }
}

module.exports = { getMultiplier };