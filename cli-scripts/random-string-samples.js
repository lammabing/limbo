/**
 * Sample usage of generateRandomString with different conditions
 * 
 * This file demonstrates various ways to configure the generateRandomString function
 * to meet specific requirements for random string generation.
 */

const { generateRandomString } = require('./randomStringGenerator.js');

// Try to import clipboardy for clipboard functionality
let clipboardy;
let clipboardAvailable = false;

// Since clipboardy is an ES module, we need to dynamically import it
async function importClipboardy() {
    try {
        const clipboardyModule = await import('clipboardy');
        clipboardy = clipboardyModule.default;
        clipboardAvailable = true;
    } catch (error) {
        // Try to import from the parent directory
        try {
            const clipboardyModule = await import('../node_modules/clipboardy/index.js');
            clipboardy = clipboardyModule.default;
            clipboardAvailable = true;
        } catch (innerError) {
            console.log('Note: clipboardy package not found or incompatible. Install it with "npm install clipboardy" for clipboard functionality.');
            console.log();
        }
    }
}

console.log('Random String Samples');
console.log('=====================\n');

// Async function for copying to clipboard
async function generateAndMaybeCopy(config, description, copyToClipboard = false) {
    const randomString = generateRandomString(config);
    console.log(description);
    console.log('   ', randomString);
    
    if (copyToClipboard && clipboardAvailable) {
        try {
            await clipboardy.write(randomString);
            console.log('   (Copied to clipboard)');
        } catch (error) {
            console.log('   (Could not copy to clipboard - ', error.message, ')');
        }
    } else if (copyToClipboard && !clipboardAvailable) {
        console.log('   (Could not copy to clipboard - clipboardy not available)');
    }
    console.log();
}

// Main execution function
async function main() {
    // Load clipboardy if available
    await importClipboardy();
    
    console.log('Random String Samples');
    console.log('=====================\n');

    // Basic random string (default settings: 32 chars, lowercase + numbers)
    await generateAndMaybeCopy({}, '1. Basic random string (32 chars, lowercase + numbers):', true); // This one copies to clipboard

    // Custom length, only lowercase and numbers
    await generateAndMaybeCopy({
        length: 12,
        includeUppercase: false,
        includeSymbols: false
    }, '2. Only lowercase and numbers (12 chars):');

    // Include specific characters, exclude others
    await generateAndMaybeCopy({
        length: 8,
        customChars: '£€',
        excludeChars: 'oO0',
        includeSymbols: true
    }, '3. Custom characters with exclusions (8 chars, with £€ symbols but no o, O, 0):');

    // Ensure at least one of each enabled set
    await generateAndMaybeCopy({
        length: 10,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
        ensureAtLeastOne: true
    }, '4. At least one of each enabled set (10 chars):');

    // Your specific requirements: At least 10 characters with numeric digits, lowercase letters, 
    // at least one symbol (but no periods or commas), and at least one capital letter
    await generateAndMaybeCopy({
        length: 10,
        includeUppercase: true,        // Include uppercase letters A-Z
        includeLowercase: true,        // Include lowercase letters a-z
        includeNumbers: true,          // Include numeric digits 0-9
        includeSymbols: true,          // Include special symbols
        excludeChars: '.,',            // Exclude periods and commas
        ensureAtLeastOne: true         // Ensure at least one character from each enabled set
    }, '5. At least 10 chars with digits, lowercase, symbols (no .,) and uppercase:'); // No clipboard copy for this sample

    // Longer string with all character types
    await generateAndMaybeCopy({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeChars: '.,',            // Still excluding periods and commas
        ensureAtLeastOne: true
    }, '6. Longer string (16 chars) with all character types):');

    // Password-like string with guaranteed complexity
    await generateAndMaybeCopy({
        length: 14,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeChars: 'il1Lo0O',       // Exclude ambiguous characters
        ensureAtLeastOne: true
    }, '7. Password-like string (14 chars) with guaranteed complexity):');

    // String with only numbers and uppercase letters
    await generateAndMaybeCopy({
        length: 8,
        includeUppercase: true,
        includeLowercase: false,
        includeNumbers: true,
        includeSymbols: false
    }, '8. Only numbers and uppercase letters (8 chars):');

    // String with custom character set
    await generateAndMaybeCopy({
        length: 10,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false,
        customChars: '0123456789ABCDEF'  // Only hexadecimal characters
    }, '9. Custom character set (hexadecimal-like, 10 chars):');

    // String with custom character set and guaranteed selection
    await generateAndMaybeCopy({
        length: 12,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false,
        customChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        ensureAtLeastOne: true
    }, '10. Custom character set with guaranteed selection (Base64-like characters, at least one of each type):');

    console.log('All samples generated successfully!');

    // Display the password-like string (example 7) without copying to clipboard
    console.log('\nPassword-like string (example 7):');
    const passwordLikeString = generateRandomString({
        length: 14,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeChars: 'il1Lo0O',       // Exclude ambiguous characters
        ensureAtLeastOne: true
    });
    console.log('Password generated:', passwordLikeString);
}

// Run the main function
main().catch(console.error);