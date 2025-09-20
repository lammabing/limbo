const express = require('express');
const path = require('path');
const cryptoProvider = require('./crypto.provider');
const { getMultiplier } = cryptoProvider;
const bodyParser = require('body-parser');

const app = express();
const port = 3150;

// Set default crypto provider (can be overridden via environment variable)
// Available providers: 'bch', 'bustadice', 'stake'
const CRYPTO_PROVIDER = process.env.CRYPTO_PROVIDER || 'bch';
cryptoProvider.setProvider(CRYPTO_PROVIDER);
console.log(`Using crypto provider: ${cryptoProvider.getCurrentProvider()}`);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname, { 
    extensions: ['json'],
    setHeaders: (res, path) => {
        if (path.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        }
    }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Game state storage (in a real application, this would be in a database)
const gameSessions = new Map();

// Route to serve the main HTML form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to serve the bet verifier HTML form
app.get('/verifier', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verifier.html'));
});

// API endpoint to play a game round
app.post('/play', (req, res) => {
    try {
        const { clientSeed, serverSeed, nonce, betAmount, targetMultiplier } = req.body;
        
        // Validate input
        if (!clientSeed || !serverSeed || nonce === undefined || !betAmount || !targetMultiplier) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Generate the multiplier using the crypto.bch.js module
        const multiplier = getMultiplier(parseInt(nonce), clientSeed, serverSeed);
        
        // Determine if the player won
        const won = multiplier >= parseFloat(targetMultiplier);
        
        // Calculate profit
        const profit = won ? parseFloat(betAmount) * (parseFloat(targetMultiplier) - 1) : -parseFloat(betAmount);
        
        // Return the game result
        res.json({
            success: true,
            multiplier: multiplier,
            won: won,
            profit: profit,
            clientSeed: clientSeed,
            serverSeed: serverSeed,
            nonce: nonce
        });
        
    } catch (error) {
        console.error('Error processing game round:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to get seeds for verification
app.post('/getSeeds', (req, res) => {
    try {
        const { clientSeed, serverSeed, nonce } = req.body;
        
        // Validate input
        if (!clientSeed || !serverSeed || nonce === undefined) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Get seed information for verification
        const seedInfo = getMultiplier(-1, clientSeed, serverSeed);
        
        res.json({
            success: true,
            seedInfo: seedInfo
        });
        
    } catch (error) {
        console.error('Error getting seed information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to verify a game result
app.post('/verify', (req, res) => {
    try {
        const { clientSeed, serverSeed, nonce, expectedMultiplier } = req.body;
        
        // Validate input
        if (!clientSeed || !serverSeed || nonce === undefined || !expectedMultiplier) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Recalculate the multiplier
        const calculatedMultiplier = getMultiplier(parseInt(nonce), clientSeed, serverSeed);
        
        // Check if the calculated multiplier matches the expected one
        const isValid = Math.abs(calculatedMultiplier - parseFloat(expectedMultiplier)) < 0.01;
        
        res.json({
            success: true,
            isValid: isValid,
            calculatedMultiplier: calculatedMultiplier,
            expectedMultiplier: parseFloat(expectedMultiplier)
        });
        
    } catch (error) {
        console.error('Error verifying game result:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to generate new seeds
app.post('/generateSeeds', (req, res) => {
    try {
        // Generate new client and server seeds
        const newClientSeed = generateRandomString(32);
        const newServerSeed = generateRandomString(32);
        
        res.json({
            success: true,
            clientSeed: newClientSeed,
            serverSeed: newServerSeed
        });
        
    } catch (error) {
        console.error('Error generating seeds:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper function to generate a random string
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});