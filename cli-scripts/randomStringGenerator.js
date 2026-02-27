/**
 * Generates a random string based on provided configuration options.
 * @param {Object} options - Configuration for the random string
 * @param {number} [options.length=10] - Length of the generated string
 * @param {boolean} [options.includeUppercase=true] - Include uppercase letters
 * @param {boolean} [options.includeLowercase=true] - Include lowercase letters
 * @param {boolean} [options.includeNumbers=true] - Include numbers
 * @param {boolean} [options.includeSymbols=false] - Include special symbols
 * @param {string} [options.customChars=''] - Additional custom characters
 * @param {string} [options.excludeChars=''] - Characters to exclude
 * @param {boolean} [options.ensureAtLeastOne=false] - Ensure at least one char from each enabled set
 * @returns {string} Generated random string
 */
function generateRandomString({
  length = 32,
  includeUppercase = false,
  includeLowercase = true,
  includeNumbers = true,
  includeSymbols = false,
  customChars = '',
  excludeChars = '',
  ensureAtLeastOne = false
} = {}) {
  // Define character sets
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // Build the character pool
  let chars = '';
  if (includeUppercase) chars += uppercase;
  if (includeLowercase) chars += lowercase;
  if (includeNumbers) chars += numbers;
  if (includeSymbols) chars += symbols;
  if (customChars) chars += customChars;

  // Remove excluded characters
  if (excludeChars) {
    chars = chars.split('').filter(char => !excludeChars.includes(char)).join('');
  }

  // Validate inputs
  if (chars.length === 0) {
    throw new Error('No characters available to generate string. Please enable at least one character set or provide custom characters.');
  }
  if (length < 1) {
    throw new Error('Length must be at least 1.');
  }
  if (ensureAtLeastOne && length < (includeUppercase + includeLowercase + includeNumbers + includeSymbols + (customChars ? 1 : 0))) {
    throw new Error('Length too short to ensure at least one character from each enabled set.');
  }

  // Generate random string
  let result = '';

  if (ensureAtLeastOne) {
    // Ensure at least one character from each enabled set
    if (includeUppercase) result += uppercase[Math.floor(Math.random() * uppercase.length)];
    if (includeLowercase) result += lowercase[Math.floor(Math.random() * lowercase.length)];
    if (includeNumbers) result += numbers[Math.floor(Math.random() * numbers.length)];
    if (includeSymbols) result += symbols[Math.floor(Math.random() * symbols.length)];
    if (customChars) result += customChars[Math.floor(Math.random() * customChars.length)];

    // Fill the remaining length
    for (let i = result.length; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    // Shuffle the result to avoid predictable patterns
    result = result.split('').sort(() => Math.random() - 0.5).join('');
  } else {
    // Generate random string without specific character requirements
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return result;
}

// Example usage with table formatting
if (require.main === module) {
    const { createTable, createSectionHeader, createKeyValueTable } = require('./table-utils.js');

    console.log(createSectionHeader('Random String Generator Examples', { character: '=' }));

    const examples = [
        {
            name: 'Basic (32 chars)',
            config: {},
            description: 'Default: lowercase + numbers'
        },
        {
            name: 'Short ID (12 chars)',
            config: { length: 12, includeUppercase: false },
            description: 'Lowercase + numbers only'
        },
        {
            name: 'Custom Symbols',
            config: { length: 8, customChars: '£€', excludeChars: 'oO0', includeSymbols: true },
            description: 'With custom chars, exclusions'
        },
        {
            name: 'All Character Types',
            config: { length: 16, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true, ensureAtLeastOne: true },
            description: 'Ensures one of each type'
        },
        {
            name: 'Crypto Seed',
            config: { length: 64, includeUppercase: true, includeLowercase: true, includeNumbers: true },
            description: '64-char alphanumeric seed'
        }
    ];

    // Generate and display examples in table format
    const headers = ['Name', 'Length', 'Generated String', 'Description'];
    const rows = examples.map(ex => {
        const str = generateRandomString(ex.config);
        return [
            ex.name,
            ex.config.length || 32,
            str,
            ex.description
        ];
    });

    console.log(createTable(headers, rows));
    
    // Display configuration details
    console.log(createSectionHeader('Configuration Options'));
    const configOptions = {
        'length': 'Length of generated string (default: 32)',
        'includeUppercase': 'Include A-Z (default: false)',
        'includeLowercase': 'Include a-z (default: true)',
        'includeNumbers': 'Include 0-9 (default: true)',
        'includeSymbols': 'Include special chars (default: false)',
        'customChars': 'Add custom characters (default: "")',
        'excludeChars': 'Exclude specific chars (default: "")',
        'ensureAtLeastOne': 'Ensure one from each set (default: false)'
    };
    console.log(createKeyValueTable(configOptions, { keyLabel: 'Option', valueLabel: 'Description' }));
}

module.exports = { generateRandomString };