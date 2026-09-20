const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');

// Resolve paths relative to app resources for packaged app compatibility
const appRoot = process.resourcesPath || path.join(__dirname, '..');
const cryptoProvider = require(path.join(appRoot, 'crypto.provider'));
const { getMultiplier } = cryptoProvider;
const { generateRandomString } = require(path.join(appRoot, 'cli-scripts', 'randomStringGenerator.js'));

// Set crypto provider
const CRYPTO_PROVIDER = process.env.CRYPTO_PROVIDER || 'bch';
cryptoProvider.setProvider(CRYPTO_PROVIDER);
console.log(`Using crypto provider: ${cryptoProvider.getCurrentProvider()}`);

// Game state storage
let gameSession = null;
const SESSION_FILE = path.join(app.getPath('userData'), 'game-session.json');

// Express app for local server
const expressApp = express();
const PORT = 3146; // Use different port to avoid conflict with main server

// Load game session from file
function loadGameSession() {
    try {
        if (fs.existsSync(SESSION_FILE)) {
            const data = fs.readFileSync(SESSION_FILE, 'utf8');
            gameSession = JSON.parse(data);
            console.log('Loaded game session from file');
            return true;
        }
    } catch (error) {
        console.error('Error loading game session:', error);
    }
    return false;
}

// Save game session to file
function saveGameSession() {
    try {
        const userDataPath = app.getPath('userData');
        if (!fs.existsSync(userDataPath)) {
            fs.mkdirSync(userDataPath, { recursive: true });
        }
        fs.writeFileSync(SESSION_FILE, JSON.stringify(gameSession, null, 2));
        console.log('Saved game session to file');
    } catch (error) {
        console.error('Error saving game session:', error);
    }
}

// Initialize game session
function initGameSession(startingBalance, roundDownMonetaryValues, clientSeed, serverSeed) {
    gameSession = {
        balance: startingBalance,
        cumulativeProfit: 0,
        nonce: 0,
        clientSeed: clientSeed || generateRandomString({ length: 32, includeUppercase: true, includeLowercase: true, includeNumbers: true }),
        serverSeed: serverSeed || generateRandomString({ length: 32, includeUppercase: true, includeLowercase: true, includeNumbers: true }),
        roundDownMonetaryValues: roundDownMonetaryValues || false,
        gameHistory: [],
        stats: {
            totalBets: 0,
            wins: 0,
            losses: 0,
            totalWagered: 0,
            netProfit: 0
        }
    };
    saveGameSession();
    return gameSession;
}

// Reset game session
function resetGameSession() {
    gameSession = null;
    if (fs.existsSync(SESSION_FILE)) {
        fs.unlinkSync(SESSION_FILE);
    }
}

// Round monetary values helper
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

// Run simulation
function runSimulation(targetMultiplier, initialBet, betMultiplier, numberOfBets) {
    if (!gameSession) {
        throw new Error('Game session not initialized');
    }

    const startBalance = gameSession.balance;
    const startNonce = gameSession.nonce;
    let currentBet = initialBet;
    let wins = 0;
    let losses = 0;
    let cumulativeProfit = gameSession.cumulativeProfit;
    let currentBalance = startBalance;
    let endedEarly = false;
    let endedReason = '';

    const results = [];

    for (let i = 0; i < numberOfBets; i++) {
        // Check if we have enough balance
        if (currentBalance < currentBet) {
            endedEarly = true;
            endedReason = `Insufficient balance at bet ${i + 1}. Required: ${currentBet.toFixed(2)}, Available: ${currentBalance.toFixed(2)}`;
            break;
        }

        // Calculate multiplier
        const multiplier = getMultiplier(gameSession.nonce, gameSession.clientSeed, gameSession.serverSeed);
        const won = multiplier >= targetMultiplier;

        // Calculate profit
        let profit = 0;
        if (won) {
            profit = roundMonetaryValue(currentBet * (targetMultiplier - 1), gameSession.roundDownMonetaryValues);
            wins++;
            currentBet = initialBet; // Reset bet on win
        } else {
            profit = -currentBet;
            losses++;
            currentBet = roundBetAmount(currentBet * betMultiplier, gameSession.roundDownMonetaryValues);
        }

        cumulativeProfit += profit;
        currentBalance += profit;
        gameSession.nonce++;

        results.push({
            round: i + 1,
            multiplier,
            bet: currentBet,
            profit,
            won,
            nonce: gameSession.nonce - 1
        });

        gameSession.stats.totalBets++;
        gameSession.stats.totalWagered += currentBet;
        if (won) {
            gameSession.stats.wins++;
        } else {
            gameSession.stats.losses++;
        }
    }

    gameSession.balance = currentBalance;
    gameSession.cumulativeProfit = cumulativeProfit;
    saveGameSession();

    return {
        rounds: results.length,
        wins,
        losses,
        startBalance,
        finalBalance: currentBalance,
        profit: currentBalance - startBalance,
        cumulativeProfit,
        startNonce,
        finalNonce: gameSession.nonce,
        endedEarly,
        endedReason,
        results
    };
}

// Setup Express routes
expressApp.use(express.static(path.join(__dirname, '../public')));
expressApp.use(express.json());

expressApp.get('/api/state', (req, res) => {
    res.json({ gameState: gameSession });
});

expressApp.post('/api/init', (req, res) => {
    try {
        const { startingBalance, roundDownMonetaryValues, clientSeed, serverSeed } = req.body;
        const session = initGameSession(startingBalance, roundDownMonetaryValues, clientSeed, serverSeed);
        res.json({ gameState: session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

expressApp.post('/api/simulate', (req, res) => {
    try {
        const { targetMultiplier, initialBet, betMultiplier, numberOfBets } = req.body;
        const results = runSimulation(targetMultiplier, initialBet, betMultiplier, numberOfBets);
        res.json({ results, gameState: gameSession });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

expressApp.post('/api/reset', (req, res) => {
    resetGameSession();
    res.json({ success: true });
});

// Start Express server
expressApp.listen(PORT, '127.0.0.1', () => {
    console.log(`Local server running at http://127.0.0.1:${PORT}`);
});

// Create main window
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false
        },
        icon: path.join(__dirname, '../public/icon.png'),
        title: 'Limbo Game Simulator',
        backgroundColor: '#1a1a2e'
    });

    // Load the web interface
    mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        app.quit();
    });
}

// IPC handlers for renderer process
ipcMain.handle('get-game-state', () => {
    return gameSession;
});

ipcMain.handle('init-game', (event, options) => {
    return initGameSession(
        options.startingBalance,
        options.roundDownMonetaryValues,
        options.clientSeed,
        options.serverSeed
    );
});

ipcMain.handle('run-simulation', (event, options) => {
    return runSimulation(
        options.targetMultiplier,
        options.initialBet,
        options.betMultiplier,
        options.numberOfBets
    );
});

ipcMain.handle('reset-game', () => {
    resetGameSession();
    return { success: true };
});

ipcMain.handle('save-session-file', async (event, options) => {
    const result = await dialog.showSaveDialog({
        title: 'Save Game Session',
        defaultPath: options.defaultPath || 'game-session.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (!result.canceled && result.filePath) {
        try {
            fs.writeFileSync(result.filePath, JSON.stringify(gameSession, null, 2));
            return { success: true, filePath: result.filePath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    return { success: false, canceled: true };
});

ipcMain.handle('load-session-file', async (event, options) => {
    const result = await dialog.showOpenDialog({
        title: 'Load Game Session',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        try {
            const data = fs.readFileSync(result.filePaths[0], 'utf8');
            gameSession = JSON.parse(data);
            saveGameSession();
            return { success: true, gameState: gameSession };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    return { success: false, canceled: true };
});

// App lifecycle events
app.whenReady().then(() => {
    loadGameSession();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    saveGameSession();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    saveGameSession();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    saveGameSession();
});
