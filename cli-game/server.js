/**
 * Simple HTTP server for the Limbo CLI Game Web Interface
 * Serves the web-interface.html file and handles game state API endpoints
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3146;
const GAME_STATE_FILE = path.join(__dirname, 'game-session.json');

// Import the multiplier function from the crypto module
const { getMultiplier } = require('../crypto.bch.js');

// Utility functions
function roundMonetaryValue(value, roundDown) {
    if (roundDown) {
        return Math.floor(value);
    }
    return value;
}

function roundBetAmount(value, roundDown) {
    if (roundDown) {
        const roundedValue = Math.floor(value);
        return Math.max(1, roundedValue);
    }
    return value;
}

// Load game state
function loadGameState() {
    try {
        const data = fs.readFileSync(GAME_STATE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
}

// Save game state
function saveGameState(gameState) {
    fs.writeFileSync(GAME_STATE_FILE, JSON.stringify(gameState, null, 2));
}

// Generate random string
function generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        result += chars.charAt(randomValues[i] % chars.length);
    }
    return result;
}

// Parse request body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}

// Send JSON response
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// Send HTML response
function sendHTML(res, statusCode, html) {
    res.writeHead(statusCode, { 'Content-Type': 'text/html' });
    res.end(html);
}

// API Handlers
async function handleInitGame(req, res) {
    try {
        const body = await parseBody(req);
        const startingBalance = parseFloat(body.startingBalance) || 1000;
        const roundDownMonetaryValues = body.roundDownMonetaryValues !== false;
        let clientSeed = body.clientSeed && body.clientSeed.trim() ? body.clientSeed.trim() : null;
        let serverSeed = body.serverSeed && body.serverSeed.trim() ? body.serverSeed.trim() : null;

        if (isNaN(startingBalance) || startingBalance < 0) {
            return sendJSON(res, 400, { error: 'Starting balance must be a non-negative number' });
        }

        // Generate seeds if not provided
        if (!clientSeed) {
            clientSeed = generateRandomString(32);
        }
        if (!serverSeed) {
            serverSeed = generateRandomString(32);
        }

        const gameState = {
            clientSeed,
            serverSeed,
            nonce: 0,
            balance: startingBalance,
            startingBalance,
            roundDownMonetaryValues,
            createdAt: new Date().toISOString(),
            sessionHistory: [],
            cumulativeProfit: 0
        };

        saveGameState(gameState);

        sendJSON(res, 200, {
            success: true,
            message: 'Game session initialized successfully',
            gameState: {
                nonce: 0,
                balance: startingBalance,
                roundDownMonetaryValues,
                cumulativeProfit: 0,
                totalSessions: 0,
                clientSeed,
                serverSeed
            }
        });
    } catch (error) {
        sendJSON(res, 500, { error: error.message });
    }
}

async function handleRunSimulation(req, res) {
    try {
        const body = await parseBody(req);
        const {
            targetMultiplier,
            initialBet,
            betMultiplier,
            numberOfBets
        } = body;

        // Validate inputs
        if (!targetMultiplier || targetMultiplier < 1.01) {
            return sendJSON(res, 400, { error: 'Target multiplier must be at least 1.01' });
        }
        if (!initialBet || initialBet < 1) {
            return sendJSON(res, 400, { error: 'Initial bet must be at least 1' });
        }
        if (!betMultiplier || betMultiplier < 1.001) {
            return sendJSON(res, 400, { error: 'Bet multiplier must be at least 1.001' });
        }
        if (!numberOfBets || numberOfBets < 1) {
            return sendJSON(res, 400, { error: 'Number of bets must be at least 1' });
        }

        // Load game state
        let gameState = loadGameState();
        if (!gameState) {
            return sendJSON(res, 400, { error: 'No game session found. Please initialize a game first.' });
        }

        const results = {
            targetMultiplier: parseFloat(targetMultiplier.toFixed(2)),
            initialBet: roundBetAmount(initialBet, gameState.roundDownMonetaryValues),
            betMultiplier: parseFloat(betMultiplier.toFixed(3)),
            numberOfBets: parseInt(numberOfBets),
            startNonce: gameState.nonce,
            finalNonce: null,
            totalProfit: 0,
            totalWagered: 0,
            wins: 0,
            losses: 0,
            winningBetAmounts: [],
            winningPayouts: [],
            winningMultipliers: [],
            startingBalance: gameState.balance,
            finalBalance: null
        };

        let currentBet = parseFloat(initialBet);
        const roundDown = gameState.roundDownMonetaryValues;

        for (let i = 0; i < numberOfBets; i++) {
            const originalBetAmount = currentBet;

            // Check balance
            if (gameState.balance < originalBetAmount) {
                results.endedEarly = true;
                results.endedReason = `Cannot place bet of ${originalBetAmount.toFixed(2)} - insufficient balance (${gameState.balance.toFixed(2)}). Simulation ended.`;
                break;
            }

            // Get multiplier using the same algorithm as CLI
            const multiplier = getMultiplier(gameState.nonce, gameState.clientSeed, gameState.serverSeed);
            const won = multiplier >= targetMultiplier;

            let payout = 0;
            if (won) {
                payout = roundMonetaryValue(originalBetAmount * targetMultiplier, roundDown);
                currentBet = roundMonetaryValue(initialBet, roundDown);
                results.wins++;
                // Record the bet amount placed on this winning round, its win amount,
                // and the actual multiplier outcome rolled for the round
                results.winningBetAmounts.push(originalBetAmount);
                results.winningPayouts.push(payout);
                results.winningMultipliers.push(multiplier);
            } else {
                currentBet = roundMonetaryValue(currentBet * betMultiplier, roundDown);
                results.losses++;
            }

            const roundProfit = won ? payout - originalBetAmount : -originalBetAmount;
            gameState.balance = roundMonetaryValue(gameState.balance + roundProfit, roundDown);

            // Add to total wagered
            results.totalWagered = roundMonetaryValue(results.totalWagered + originalBetAmount, roundDown);

            results.totalProfit = roundMonetaryValue(results.totalProfit + roundProfit, roundDown);

            gameState.nonce++;

            // Stop after win with positive profit
            if (won && results.totalProfit > 0) {
                results.endedEarly = true;
                results.endedReason = `Simulation stopped after round ${i + 1} as win resulted in positive profit (${results.totalProfit.toFixed(2)}).`;
                break;
            }
        }

        results.finalNonce = gameState.nonce;
        results.finalBalance = roundMonetaryValue(gameState.balance, roundDown);

        // Calculate cumulative profit
        const previousCumulativeProfit = gameState.sessionHistory.reduce((total, session) => {
            return total + (session.results.totalProfit || 0);
        }, 0);
        const newCumulativeProfit = roundMonetaryValue(previousCumulativeProfit + results.totalProfit, roundDown);
        results.cumulativeProfit = newCumulativeProfit;

        // Save session
        gameState.sessionHistory.push({
            simulationParams: {
                targetMultiplier: parseFloat(targetMultiplier.toFixed(2)),
                initialBet: roundBetAmount(initialBet, roundDown),
                betMultiplier: parseFloat(betMultiplier.toFixed(3)),
                numberOfBets: parseInt(numberOfBets)
            },
            results,
            timestamp: new Date().toISOString()
        });
        gameState.cumulativeProfit = newCumulativeProfit;

        saveGameState(gameState);

        sendJSON(res, 200, {
            success: true,
            results: {
                rounds: results.wins + results.losses,
                wins: results.wins,
                losses: results.losses,
                totalBets: results.totalWagered,
                startBalance: results.startingBalance,
                finalBalance: results.finalBalance,
                profit: results.totalProfit,
                cumulativeProfit: results.cumulativeProfit,
                winningRoundBet: results.winningBetAmounts.length > 0
                    ? results.winningBetAmounts[results.winningBetAmounts.length - 1]
                    : null,
                winAmount: results.winningPayouts.length > 0
                    ? results.winningPayouts[results.winningPayouts.length - 1]
                    : null,
                winningMultiplier: results.winningMultipliers.length > 0
                    ? results.winningMultipliers[results.winningMultipliers.length - 1]
                    : null,
                startNonce: results.startNonce,
                finalNonce: results.finalNonce,
                endedEarly: results.endedEarly,
                endedReason: results.endedReason
            },
            gameState: {
                nonce: gameState.nonce,
                balance: gameState.balance,
                cumulativeProfit: gameState.cumulativeProfit,
                totalSessions: gameState.sessionHistory.length
            }
        });
    } catch (error) {
        sendJSON(res, 500, { error: error.message });
    }
}

function handleGetState(req, res) {
    const gameState = loadGameState();
    if (!gameState) {
        return sendJSON(res, 404, { error: 'No game session found' });
    }

    sendJSON(res, 200, {
        success: true,
        gameState: {
            clientSeed: gameState.clientSeed,
            serverSeed: gameState.serverSeed,
            nonce: gameState.nonce,
            balance: gameState.balance,
            startingBalance: gameState.startingBalance,
            roundDownMonetaryValues: gameState.roundDownMonetaryValues,
            cumulativeProfit: gameState.cumulativeProfit,
            totalSessions: gameState.sessionHistory.length,
            createdAt: gameState.createdAt
        }
    });
}

function handleResetGame(req, res) {
    try {
        fs.unlinkSync(GAME_STATE_FILE);
        sendJSON(res, 200, { success: true, message: 'Game reset successfully' });
    } catch (error) {
        if (error.code === 'ENOENT') {
            sendJSON(res, 200, { success: true, message: 'Game already reset' });
        } else {
            sendJSON(res, 500, { error: error.message });
        }
    }
}

function handleGetHistory(req, res) {
    const gameState = loadGameState();
    if (!gameState) {
        return sendJSON(res, 404, { error: 'No game session found' });
    }

    sendJSON(res, 200, {
        success: true,
        history: gameState.sessionHistory
    });
}

// Main request handler
async function handleRequest(req, res) {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;
    const method = req.method;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API Routes
    if (pathname === '/api/init' && method === 'POST') {
        return handleInitGame(req, res);
    }

    if (pathname === '/api/simulate' && method === 'POST') {
        return handleRunSimulation(req, res);
    }

    if (pathname === '/api/state' && method === 'GET') {
        return handleGetState(req, res);
    }

    if (pathname === '/api/reset' && method === 'POST') {
        return handleResetGame(req, res);
    }

    if (pathname === '/api/history' && method === 'GET') {
        return handleGetHistory(req, res);
    }

    // Serve static files
    let filePath = path.join(__dirname, pathname === '/' ? 'web-interface.html' : pathname);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    // Check if file exists, otherwise try web-interface.html
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'web-interface.html');
    }

    const extname = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };

    const contentType = contentTypes[extname] || 'application/octet-stream';

    try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(500);
            res.end(`Server error: ${error.message}`);
        }
    }
}

// Create and start server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║           Limbo CLI Game - Web Interface               ║
╠════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}              ║
║  Web Interface:   http://localhost:${PORT}/               ║
║  API Endpoints:                                          ║
║    POST /api/init      - Initialize game session        ║
║    POST /api/simulate  - Run simulation                 ║
║    GET  /api/state     - Get current game state         ║
║    POST /api/reset     - Reset game                     ║
║    GET  /api/history   - Get session history            ║
╚════════════════════════════════════════════════════════╝
    `);
});

module.exports = { server };
