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

// Example usage
try {
  // Basic random string
  console.log('Basic random string:', generateRandomString());

  // Custom length, only lowercase and numbers
  console.log('Lowercase and numbers:', generateRandomString({
    length: 12,
    includeUppercase: false,
    includeSymbols: false
  }));

  // Include specific characters, exclude others
  console.log('Custom with exclusions:', generateRandomString({
    length: 8,
    customChars: '£€',
    excludeChars: 'oO0',
    includeSymbols: true
  }));

  // Ensure at least one of each enabled set
  console.log('Ensure one of each:', generateRandomString({
    length: 10,
    ensureAtLeastOne: true
  }));
} catch (error) {
  console.error('Error:', error.message);
}

module.exports = { generateRandomString };