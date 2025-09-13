document.addEventListener('DOMContentLoaded', function() {
    // Game state
    const gameState = {
        balance: 10000,
        currentBet: 0,
        currentTarget: 0,
        gameActive: false,
        autoModeActive: false,
        nonce: 0,
        clientSeed: '',
        serverSeed: '',
        gameHistory: [],
        stats: {
            totalBets: 0,
            wins: 0,
            losses: 0,
            totalWagered: 0,
            netProfit: 0
        },
        classBoundaries: [],
        classCounts: [],
        roundsSinceLastOccurrence: []
    };

    // DOM elements
    const elements = {
        balance: document.getElementById('balance'),
        multiplierValue: document.getElementById('multiplierValue'),
        gameStatus: document.getElementById('gameStatus'),
        betAmount: document.getElementById('betAmount'),
        targetMultiplier: document.getElementById('targetMultiplier'),
        placeBet: document.getElementById('placeBet'),
        autoBetAmount: document.getElementById('autoBetAmount'),
        autoTargetMultiplier: document.getElementById('autoTargetMultiplier'),
        numberOfRounds: document.getElementById('numberOfRounds'),
        stopProfit: document.getElementById('stopProfit'),
        stopLoss: document.getElementById('stopLoss'),
        betMultiplier: document.getElementById('betMultiplier'),
        maxBetMultiplier: document.getElementById('maxBetMultiplier'),
        autoAdjustTarget: document.getElementById('autoAdjustTarget'),
        startAutoBet: document.getElementById('startAutoBet'),
        stopAutoBet: document.getElementById('stopAutoBet'),
        historyTableBody: document.getElementById('historyTableBody'),
        totalBets: document.getElementById('totalBets'),
        totalWins: document.getElementById('totalWins'),
        totalLosses: document.getElementById('totalLosses'),
        winRate: document.getElementById('winRate'),
        totalWagered: document.getElementById('totalWagered'),
        netProfit: document.getElementById('netProfit'),
        clientSeed: document.getElementById('clientSeed'),
        serverSeed: document.getElementById('serverSeed'),
        nonce: document.getElementById('nonce'),
        generateSeeds: document.getElementById('generateSeeds'),
        verifyBet: document.getElementById('verifyBet'),
        speedMode: document.getElementById('speedMode'),
        autoSpeedMode: document.getElementById('autoSpeedMode'),
        tallyTableBody: document.getElementById('tallyTableBody'),
        roundsTallyTableBody: document.getElementById('roundsTallyTableBody')
    };

    // Initialize the game
    function initGame() {
        updateBalanceDisplay();
        setupEventListeners();
        generateSeeds();
        loadClassBoundaries();
    }

    // Update balance display
    function updateBalanceDisplay() {
        elements.balance.textContent = gameState.balance.toFixed(2);
        // Add animation class
        elements.balance.classList.add('updated');
        // Remove animation class after animation completes
        setTimeout(() => {
            elements.balance.classList.remove('updated');
        }, 500);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Tab switching
        document.getElementById('manualTab').addEventListener('click', () => switchTab('manual'));
        document.getElementById('autoTab').addEventListener('click', () => switchTab('auto'));
        
        // Info tab switching
        document.getElementById('historyTab').addEventListener('click', () => switchInfoTab('history'));
        document.getElementById('statsTab').addEventListener('click', () => switchInfoTab('stats'));
        document.getElementById('fairTab').addEventListener('click', () => switchInfoTab('fair'));
        document.getElementById('tallyTab').addEventListener('click', () => switchInfoTab('tally'));
        document.getElementById('roundsTallyTab').addEventListener('click', () => switchInfoTab('roundsTally'));
        document.getElementById('helpTab').addEventListener('click', () => switchInfoTab('help'));
        
        // Manual bet controls
        elements.placeBet.addEventListener('click', placeBet);
        
        // Bet amount controls
        document.getElementById('decrementBet').addEventListener('click', () => adjustBetAmount(-10));
        document.getElementById('incrementBet').addEventListener('click', () => adjustBetAmount(10));
        
        // Target multiplier controls
        document.getElementById('decrementTarget').addEventListener('click', () => adjustTargetMultiplier(-0.1));
        document.getElementById('incrementTarget').addEventListener('click', () => adjustTargetMultiplier(0.1));
        
        // Quick amount buttons
        document.querySelectorAll('.quick-amount').forEach(button => {
            button.addEventListener('click', () => {
                elements.betAmount.value = button.dataset.amount;
            });
        });
        
        // Quick multiplier buttons
        document.querySelectorAll('.quick-multiplier').forEach(button => {
            button.addEventListener('click', () => {
                elements.targetMultiplier.value = button.dataset.multiplier;
            });
        });
        
        // Auto bet controls
        elements.startAutoBet.addEventListener('click', startAutoBet);
        elements.stopAutoBet.addEventListener('click', stopAutoBet);
        
        // Auto bet amount controls
        document.getElementById('decrementAutoBet').addEventListener('click', () => adjustAutoBetAmount(-10));
        document.getElementById('incrementAutoBet').addEventListener('click', () => adjustAutoBetAmount(10));
        
        // Auto target multiplier controls
        document.getElementById('decrementAutoTarget').addEventListener('click', () => adjustAutoTargetMultiplier(-0.1));
        document.getElementById('incrementAutoTarget').addEventListener('click', () => adjustAutoTargetMultiplier(0.1));
        
        // Number of rounds controls
        document.getElementById('decrementRounds').addEventListener('click', () => adjustNumberOfRounds(-1));
        document.getElementById('incrementRounds').addEventListener('click', () => adjustNumberOfRounds(1));
        
        // Stop profit controls
        document.getElementById('decrementStopProfit').addEventListener('click', () => adjustStopProfit(-10));
        document.getElementById('incrementStopProfit').addEventListener('click', () => adjustStopProfit(10));
        
        // Stop loss controls
        document.getElementById('decrementStopLoss').addEventListener('click', () => adjustStopLoss(-10));
        document.getElementById('incrementStopLoss').addEventListener('click', () => adjustStopLoss(10));
        
        // Bet multiplier controls
        document.getElementById('decrementBetMultiplier').addEventListener('click', () => adjustBetMultiplier(-0.1));
        document.getElementById('incrementBetMultiplier').addEventListener('click', () => adjustBetMultiplier(0.1));
        
        // Max bet multiplier controls
        document.getElementById('decrementMaxBetMultiplier').addEventListener('click', () => adjustMaxBetMultiplier(-0.1));
        document.getElementById('incrementMaxBetMultiplier').addEventListener('click', () => adjustMaxBetMultiplier(0.1));
        
        // Seed controls
        elements.generateSeeds.addEventListener('click', generateSeeds);
        elements.verifyBet.addEventListener('click', verifyBet);
        
        // Speed mode controls
        elements.speedMode.addEventListener('change', function() {
            // Sync auto speed mode with manual speed mode
            elements.autoSpeedMode.checked = this.checked;
        });
        
        elements.autoSpeedMode.addEventListener('change', function() {
            // Sync manual speed mode with auto speed mode
            elements.speedMode.checked = this.checked;
        });
        
        // Stop profit and stop loss input fields
        elements.stopProfit.addEventListener('input', function() {
            // Ensure the value is a valid number
            let value = parseFloat(this.value);
            if (isNaN(value) || value < 0) {
                value = 0;
            }
            this.value = value;
        });
        
        elements.stopProfit.addEventListener('change', function() {
            // Ensure the value is a valid number
            let value = parseFloat(this.value);
            if (isNaN(value) || value < 0) {
                value = 0;
            }
            this.value = value;
        });
        
        elements.stopProfit.addEventListener('keydown', function(e) {
            // Allow: backspace, delete, tab, escape, enter
            if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: Ctrl+C, Command+C
                (e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: Ctrl+V, Command+V
                (e.keyCode === 86 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: Ctrl+X, Command+X
                (e.keyCode === 88 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, up, down
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
        
        elements.stopLoss.addEventListener('input', function() {
            // Ensure the value is a valid number
            let value = parseFloat(this.value);
            if (isNaN(value) || value < 0) {
                value = 0;
            }
            this.value = value;
        });
        
        elements.stopLoss.addEventListener('change', function() {
            // Ensure the value is a valid number
            let value = parseFloat(this.value);
            if (isNaN(value) || value < 0) {
                value = 0;
            }
            this.value = value;
        });
        
        elements.stopLoss.addEventListener('keydown', function(e) {
            // Allow: backspace, delete, tab, escape, enter
            if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: Ctrl+C, Command+C
                (e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: Ctrl+V, Command+V
                (e.keyCode === 86 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: Ctrl+X, Command+X
                (e.keyCode === 88 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, up, down
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    }

    // Switch between manual and auto tabs
    function switchTab(tab) {
        const manualTab = document.getElementById('manualTab');
        const autoTab = document.getElementById('autoTab');
        const manualMode = document.getElementById('manualMode');
        const autoMode = document.getElementById('autoMode');
        
        if (tab === 'manual') {
            manualTab.classList.add('active');
            autoTab.classList.remove('active');
            manualMode.classList.add('active');
            autoMode.classList.remove('active');
        } else {
            manualTab.classList.remove('active');
            autoTab.classList.add('active');
            manualMode.classList.remove('active');
            autoMode.classList.add('active');
        }
    }

    // Switch between info tabs
    function switchInfoTab(tab) {
        const tabs = ['history', 'stats', 'fair', 'tally', 'roundsTally', 'help'];
        
        tabs.forEach(t => {
            const tabButton = document.getElementById(`${t}Tab`);
            const tabPane = document.getElementById(`${t}Pane`);
            
            if (t === tab) {
                tabButton.classList.add('active');
                tabPane.classList.add('active');
            } else {
                tabButton.classList.remove('active');
                tabPane.classList.remove('active');
            }
        });
    }

    // Adjust bet amount
    function adjustBetAmount(amount) {
        const currentValue = parseFloat(elements.betAmount.value) || 0;
        const newValue = Math.max(1, currentValue + amount);
        elements.betAmount.value = newValue;
    }

    // Adjust target multiplier
    function adjustTargetMultiplier(amount) {
        const currentValue = parseFloat(elements.targetMultiplier.value) || 1.01;
        const newValue = Math.max(1.01, currentValue + amount);
        elements.targetMultiplier.value = newValue.toFixed(2);
    }

    // Adjust auto bet amount
    function adjustAutoBetAmount(amount) {
        const currentValue = parseFloat(elements.autoBetAmount.value) || 0;
        const newValue = Math.max(1, currentValue + amount);
        elements.autoBetAmount.value = newValue;
    }

    // Adjust auto target multiplier
    function adjustAutoTargetMultiplier(amount) {
        const currentValue = parseFloat(elements.autoTargetMultiplier.value) || 1.01;
        const newValue = Math.max(1.01, currentValue + amount);
        elements.autoTargetMultiplier.value = newValue.toFixed(2);
    }

    // Adjust number of rounds
    function adjustNumberOfRounds(amount) {
        const currentValue = parseInt(elements.numberOfRounds.value) || 1;
        const newValue = Math.max(1, currentValue + amount);
        elements.numberOfRounds.value = newValue;
    }

    // Adjust bet multiplier
    function adjustBetMultiplier(amount) {
        const currentValue = parseFloat(elements.betMultiplier.value) || 1;
        const newValue = Math.max(1, currentValue + amount);
        elements.betMultiplier.value = newValue.toFixed(1);
    }

    // Adjust max bet multiplier
    function adjustMaxBetMultiplier(amount) {
        const currentValue = parseFloat(elements.maxBetMultiplier.value) || 1;
        const newValue = Math.max(1, currentValue + amount);
        elements.maxBetMultiplier.value = newValue.toFixed(1);
    }

    // Adjust stop profit
    function adjustStopProfit(amount) {
        const currentValue = parseFloat(elements.stopProfit.value) || 0;
        const newValue = Math.max(0, currentValue + amount);
        elements.stopProfit.value = newValue;
    }

    // Adjust stop loss
    function adjustStopLoss(amount) {
        const currentValue = parseFloat(elements.stopLoss.value) || 0;
        const newValue = Math.max(0, currentValue + amount);
        elements.stopLoss.value = newValue;
    }

    // Generate seeds
    function generateSeeds() {
        gameState.clientSeed = generateRandomString(32);
        gameState.serverSeed = generateRandomString(32);
        gameState.nonce = 0;
        
        elements.clientSeed.textContent = gameState.clientSeed;
        elements.serverSeed.textContent = gameState.serverSeed;
        elements.nonce.textContent = gameState.nonce;
    }

    // Generate random string
    function generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Place bet
    async function placeBet() {
        if (gameState.gameActive) return;
        
        const betAmount = parseFloat(elements.betAmount.value);
        const targetMultiplier = parseFloat(elements.targetMultiplier.value);
        
        if (isNaN(betAmount) || betAmount <= 0) {
            showNotification('Please enter a valid bet amount', 'error');
            return;
        }
        
        if (isNaN(targetMultiplier) || targetMultiplier < 1.01) {
            showNotification('Please enter a valid target multiplier (minimum 1.01)', 'error');
            return;
        }
        
        if (betAmount > gameState.balance) {
            showNotification('Insufficient balance', 'error');
            return;
        }
        
        gameState.currentBet = betAmount;
        gameState.currentTarget = targetMultiplier;
        gameState.gameActive = true;
        
        elements.placeBet.disabled = true;
        elements.gameStatus.textContent = 'Getting game result...';
        
        // Get the multiplier from the server first
        getMultiplierFromServer();
    }

    // Get multiplier from server
    async function getMultiplierFromServer() {
        try {
            const response = await fetch('/play', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientSeed: gameState.clientSeed,
                    serverSeed: gameState.serverSeed,
                    nonce: gameState.nonce,
                    betAmount: gameState.currentBet,
                    targetMultiplier: gameState.currentTarget
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Start the animation with the server's multiplier
                startGameAnimation(data.multiplier);
            } else {
                throw new Error(data.error || 'Failed to get game result');
            }
            
        } catch (error) {
            console.error('Error getting multiplier from server:', error);
            elements.gameStatus.textContent = 'Error getting game result';
            showNotification('Error getting game result', 'error');
            resetGame();
        }
    }

    // Start game animation with the target multiplier
    function startGameAnimation(targetMultiplier) {
        // Check if speed mode is enabled
        const isSpeedMode = elements.speedMode.checked;
        
        if (isSpeedMode) {
            // Skip animation and immediately end the game
            elements.multiplierValue.classList.remove('animating');
            elements.multiplierValue.classList.remove('crashed');
            elements.gameStatus.textContent = 'Game in progress...';
            
            // Small delay to show the status message
            setTimeout(() => {
                endGame(targetMultiplier);
            }, 100);
        } else {
            // Normal animation mode
            let currentMultiplier = 1.00;
            const duration = Math.min(3000, Math.max(800, targetMultiplier * 200)); // Reduced duration for faster animation
            const startTime = Date.now();
            
            elements.multiplierValue.classList.add('animating');
            elements.multiplierValue.classList.remove('crashed');
            elements.gameStatus.textContent = 'Game in progress...';
            
            const animationInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Calculate current multiplier based on progress (non-linear for better effect)
                // Use exponential easing to make it start fast and slow down near the end
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                currentMultiplier = 1.00 + (targetMultiplier - 1.00) * easedProgress;
                
                elements.multiplierValue.textContent = currentMultiplier.toFixed(2) + 'x';
                
                // Check if animation is complete
                if (progress >= 1) {
                    clearInterval(animationInterval);
                    endGame(targetMultiplier);
                }
            }, 30); // Update more frequently for smoother animation
        }
    }

    // End game
    function endGame(actualMultiplier) {
        gameState.gameActive = false;
        elements.placeBet.disabled = false;
        elements.multiplierValue.classList.remove('animating');
        elements.multiplierValue.classList.add('crashed');
        
        // Determine if the player won
        const won = actualMultiplier >= gameState.currentTarget;
        const profit = won ? gameState.currentBet * (gameState.currentTarget - 1) : -gameState.currentBet;
        
        // Update game state
        gameState.balance += profit;
        gameState.nonce++;
        elements.nonce.textContent = gameState.nonce;
        
        // Update stats
        gameState.stats.totalBets++;
        gameState.stats.totalWagered += gameState.currentBet;
        gameState.stats.netProfit += profit;
        
        if (won) {
            gameState.stats.wins++;
            elements.gameStatus.textContent = `You won! Profit: ${profit.toFixed(2)}`;
            showNotification(`You won ${profit.toFixed(2)}!`, 'success');
        } else {
            gameState.stats.losses++;
            elements.gameStatus.textContent = `You lost! Profit: ${profit.toFixed(2)}`;
            showNotification(`You lost ${Math.abs(profit).toFixed(2)}`, 'error');
        }
        
        // Update class counts
        updateClassCounts(actualMultiplier);
        
        // Add to history
        addToHistory({
            round: gameState.stats.totalBets,
            bet: gameState.currentBet,
            target: gameState.currentTarget,
            result: actualMultiplier,
            profit: profit
        });
        
        // Update displays
        updateBalanceDisplay();
        updateStatsDisplay();
        updateTallyDisplay();
        updateRoundsTallyDisplay();
    }

    // Reset game state after error
    function resetGame() {
        gameState.gameActive = false;
        elements.placeBet.disabled = false;
        elements.multiplierValue.classList.remove('animating');
    }

    // Add game to history
    function addToHistory(game) {
        gameState.gameHistory.unshift(game);
        
        // Keep only the last 10 games in the display
        if (gameState.gameHistory.length > 10) {
            gameState.gameHistory = gameState.gameHistory.slice(0, 10);
        }
        
        updateHistoryDisplay();
    }

    // Update class counts based on the actual multiplier
    function updateClassCounts(actualMultiplier) {
        const classBoundaries = gameState.classBoundaries;
        
        // Find which class interval the actualMultiplier falls into
        let classIndex = 0;
        for (let i = 0; i < classBoundaries.length; i++) {
            if (actualMultiplier <= classBoundaries[i]) {
                classIndex = i;
                break;
            }
            classIndex = i + 1;
        }
        
        // Increment the count for that class
        if (classIndex < gameState.classCounts.length) {
            gameState.classCounts[classIndex]++;
        }
        
        // Update rounds since last occurrence
        // Reset the count for the class where the result occurred and all classes below it
        // Increment the count for all classes above it
        for (let i = 0; i < gameState.roundsSinceLastOccurrence.length; i++) {
            if (i <= classIndex) {
                // Reset to 0 for the class where result occurred and all classes below
                gameState.roundsSinceLastOccurrence[i] = 0;
            } else {
                // Increment for all classes above
                gameState.roundsSinceLastOccurrence[i]++;
            }
        }
    }

    // Update history display
    function updateHistoryDisplay() {
        if (gameState.gameHistory.length === 0) {
            elements.historyTableBody.innerHTML = '<tr><td colspan="5" class="no-data">No game history yet</td></tr>';
            return;
        }
        
        elements.historyTableBody.innerHTML = '';
        
        gameState.gameHistory.forEach(game => {
            const row = document.createElement('tr');
            
            // Set row class based on win/loss
            if (game.profit > 0) {
                row.classList.add('win');
            } else {
                row.classList.add('loss');
            }
            
            row.innerHTML = `
                <td>${game.round}</td>
                <td>${game.bet.toFixed(2)}</td>
                <td>${game.target.toFixed(2)}x</td>
                <td>${game.result.toFixed(2)}x</td>
                <td class="${game.profit >= 0 ? 'profit-positive' : 'profit-negative'}">${game.profit >= 0 ? '+' : ''}${game.profit.toFixed(2)}</td>
            `;
            
            elements.historyTableBody.appendChild(row);
        });
    }

    // Update stats display
    function updateStatsDisplay() {
        elements.totalBets.textContent = gameState.stats.totalBets;
        elements.totalWins.textContent = gameState.stats.wins;
        elements.totalLosses.textContent = gameState.stats.losses;
        
        const winRate = gameState.stats.totalBets > 0 
            ? (gameState.stats.wins / gameState.stats.totalBets * 100).toFixed(1) 
            : 0;
        elements.winRate.textContent = winRate + '%';
        
        elements.totalWagered.textContent = gameState.stats.totalWagered.toFixed(2);
        elements.netProfit.textContent = gameState.stats.netProfit.toFixed(2);
        
        // Set color based on profit/loss
        if (gameState.stats.netProfit > 0) {
            elements.netProfit.classList.add('profit-positive');
            elements.netProfit.classList.remove('profit-negative');
        } else if (gameState.stats.netProfit < 0) {
            elements.netProfit.classList.add('profit-negative');
            elements.netProfit.classList.remove('profit-positive');
        } else {
            elements.netProfit.classList.remove('profit-positive', 'profit-negative');
        }
    }

    // Start auto bet
    function startAutoBet() {
        if (gameState.autoModeActive) return;
        
        const betAmount = parseFloat(elements.autoBetAmount.value);
        const targetMultiplier = parseFloat(elements.autoTargetMultiplier.value);
        const rounds = parseInt(elements.numberOfRounds.value);
        const stopProfit = parseFloat(elements.stopProfit.value);
        const stopLoss = parseFloat(elements.stopLoss.value);
        
        if (isNaN(betAmount) || betAmount <= 0) {
            showNotification('Please enter a valid bet amount', 'error');
            return;
        }
        
        if (isNaN(targetMultiplier) || targetMultiplier < 1.01) {
            showNotification('Please enter a valid target multiplier (minimum 1.01)', 'error');
            return;
        }
        
        if (isNaN(rounds) || rounds <= 0) {
            showNotification('Please enter a valid number of rounds', 'error');
            return;
        }
        
        gameState.autoModeActive = true;
        gameState.autoModeConfig = {
            baseBetAmount: betAmount,
            baseTargetMultiplier: targetMultiplier,
            rounds: rounds,
            stopProfit: stopProfit,
            stopLoss: stopLoss,
            betMultiplier: parseFloat(elements.betMultiplier.value),
            maxBetMultiplier: parseFloat(elements.maxBetMultiplier.value),
            autoAdjustTarget: elements.autoAdjustTarget.checked,
            currentRound: 0,
            currentBetAmount: betAmount,
            currentTargetMultiplier: targetMultiplier,
            consecutiveLosses: 0,
            startingBalance: gameState.balance,
            startingProfit: gameState.stats.netProfit
        };
        
        elements.startAutoBet.style.display = 'none';
        elements.stopAutoBet.style.display = 'block';
        
        // Disable auto mode controls
        disableAutoModeControls(true);
        
        // Start the auto betting
        autoBetRound();
    }

    // Stop auto bet
    function stopAutoBet() {
        gameState.autoModeActive = false;
        
        elements.startAutoBet.style.display = 'block';
        elements.stopAutoBet.style.display = 'none';
        
        // Enable auto mode controls
        disableAutoModeControls(false);
        
        elements.gameStatus.textContent = 'Auto bet stopped';
    }

    // Disable/enable auto mode controls
    function disableAutoModeControls(disable) {
        const controls = [
            elements.autoBetAmount,
            elements.autoTargetMultiplier,
            elements.numberOfRounds,
            elements.stopProfit,
            elements.stopLoss,
            elements.betMultiplier,
            elements.maxBetMultiplier,
            elements.autoAdjustTarget,
            elements.autoSpeedMode
        ];

        controls.forEach(control => {
            control.disabled = disable;
        });

        // Also disable the increment/decrement buttons
        const buttons = [
            'decrementAutoBet', 'incrementAutoBet',
            'decrementAutoTarget', 'incrementAutoTarget',
            'decrementRounds', 'incrementRounds',
            'decrementStopProfit', 'incrementStopProfit',
            'decrementStopLoss', 'incrementStopLoss',
            'decrementBetMultiplier', 'incrementBetMultiplier',
            'decrementMaxBetMultiplier', 'incrementMaxBetMultiplier'
        ];

        buttons.forEach(buttonId => {
            document.getElementById(buttonId).disabled = disable;
        });
    }

    // Auto bet round
    async function autoBetRound() {
        if (!gameState.autoModeActive) return;
        
        const config = gameState.autoModeConfig;
        
        // Check if we should stop
        if (config.currentRound >= config.rounds) {
            stopAutoBet();
            return;
        }
        
        // Check stop conditions
        const currentProfit = gameState.stats.netProfit - config.startingProfit;
        if (currentProfit >= config.stopProfit) {
            stopAutoBet();
            showNotification('Auto bet stopped: Stop profit reached', 'info');
            return;
        }
        
        if (currentProfit <= -config.stopLoss) {
            stopAutoBet();
            showNotification('Auto bet stopped: Stop loss reached', 'info');
            return;
        }
        
        // Check if we have enough balance
        if (config.currentBetAmount > gameState.balance) {
            stopAutoBet();
            showNotification('Auto bet stopped: Insufficient balance', 'error');
            return;
        }
        
        // Update the manual bet inputs to reflect the current auto bet
        elements.betAmount.value = config.currentBetAmount;
        elements.targetMultiplier.value = config.currentTargetMultiplier.toFixed(2);
        
        // Place the bet
        gameState.currentBet = config.currentBetAmount;
        gameState.currentTarget = config.currentTargetMultiplier;
        gameState.gameActive = true;
        
        elements.placeBet.disabled = true;
        elements.gameStatus.textContent = `Auto bet round ${config.currentRound + 1}/${config.rounds}...`;
        
        // Get the multiplier from the server first
        getAutoMultiplierFromServer();
    }

    // Get multiplier from server for auto mode
    async function getAutoMultiplierFromServer() {
        try {
            const response = await fetch('/play', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    clientSeed: gameState.clientSeed,
                    serverSeed: gameState.serverSeed,
                    nonce: gameState.nonce,
                    betAmount: gameState.currentBet,
                    targetMultiplier: gameState.currentTarget
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Start the animation with the server's multiplier
                startAutoGameAnimation(data.multiplier);
            } else {
                throw new Error(data.error || 'Failed to get game result');
            }
            
        } catch (error) {
            console.error('Error getting multiplier from server:', error);
            elements.gameStatus.textContent = 'Error getting game result';
            showNotification('Error getting game result', 'error');
            stopAutoBet();
        }
    }

    // Start auto game animation with the target multiplier
    function startAutoGameAnimation(targetMultiplier) {
        // Check if speed mode is enabled
        const isSpeedMode = elements.autoSpeedMode.checked;
        
        if (isSpeedMode) {
            // Skip animation and immediately end the game
            elements.multiplierValue.classList.remove('animating');
            elements.multiplierValue.classList.remove('crashed');
            
            // Small delay to show the status message
            setTimeout(() => {
                endAutoGame(targetMultiplier);
            }, 100);
        } else {
            // Normal animation mode
            let currentMultiplier = 1.00;
            const duration = Math.min(3000, Math.max(800, targetMultiplier * 200)); // Reduced duration for faster animation
            const startTime = Date.now();
            
            elements.multiplierValue.classList.add('animating');
            elements.multiplierValue.classList.remove('crashed');
            
            const animationInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Calculate current multiplier based on progress (non-linear for better effect)
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                currentMultiplier = 1.00 + (targetMultiplier - 1.00) * easedProgress;
                
                elements.multiplierValue.textContent = currentMultiplier.toFixed(2) + 'x';
                
                // Check if animation is complete
                if (progress >= 1) {
                    clearInterval(animationInterval);
                    endAutoGame(targetMultiplier);
                }
            }, 30); // Update more frequently for smoother animation
        }
    }

    // End auto game
    function endAutoGame(actualMultiplier) {
        const config = gameState.autoModeConfig;
        
        gameState.gameActive = false;
        elements.placeBet.disabled = false;
        elements.multiplierValue.classList.remove('animating');
        elements.multiplierValue.classList.add('crashed');
        
        // Determine if the player won
        const won = actualMultiplier >= gameState.currentTarget;
        const profit = won ? gameState.currentBet * (gameState.currentTarget - 1) : -gameState.currentBet;
        
        // Update game state
        gameState.balance += profit;
        gameState.nonce++;
        elements.nonce.textContent = gameState.nonce;
        
        // Update stats
        gameState.stats.totalBets++;
        gameState.stats.totalWagered += gameState.currentBet;
        gameState.stats.netProfit += profit;
        
        // Update auto mode config
        config.currentRound++;
        
        if (won) {
            gameState.stats.wins++;
            config.consecutiveLosses = 0;
            
            // Reset bet amount after a win
            config.currentBetAmount = config.baseBetAmount;
            
            elements.gameStatus.textContent = `Auto bet round ${config.currentRound}/${config.rounds} - Won! Profit: ${profit.toFixed(2)}`;
        } else {
            gameState.stats.losses++;
            config.consecutiveLosses++;
            
            // Increase bet amount after a loss (martingale)
            config.currentBetAmount = Math.min(
                config.currentBetAmount * config.betMultiplier,
                config.baseBetAmount * config.maxBetMultiplier
            );
            
            elements.gameStatus.textContent = `Auto bet round ${config.currentRound}/${config.rounds} - Lost! Profit: ${profit.toFixed(2)}`;
        }
        
        // Auto adjust target if enabled
        if (config.autoAdjustTarget) {
            // Simple strategy: decrease target after a win, increase after a loss
            if (won) {
                config.currentTargetMultiplier = Math.max(1.01, config.currentTargetMultiplier - 0.1);
            } else {
                config.currentTargetMultiplier = Math.min(10.0, config.currentTargetMultiplier + 0.1);
            }
        }
        
        // Update class counts
        updateClassCounts(actualMultiplier);
        
        // Add to history
        addToHistory({
            round: gameState.stats.totalBets,
            bet: gameState.currentBet,
            target: gameState.currentTarget,
            result: actualMultiplier,
            profit: profit
        });
        
        // Update displays
        updateBalanceDisplay();
        updateStatsDisplay();
        updateTallyDisplay();
        updateRoundsTallyDisplay();
        
        // Continue with next round after a delay
        const delay = elements.autoSpeedMode.checked ? 300 : 1000; // Reduced delay for speed mode
        setTimeout(() => {
            autoBetRound();
        }, delay);
    }

    // Verify bet
    function verifyBet() {
        // This would typically open a modal or navigate to a verification page
        // For now, we'll just show a notification
        showNotification('Bet verification feature coming soon!', 'info');
    }

    // Show notification
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to the page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Load class boundaries from JSON file
    async function loadClassBoundaries() {
        try {
            const response = await fetch('/classboundaries.json');
            const classBoundaries = await response.json();
            
            // Initialize class boundaries and counts in game state
            gameState.classBoundaries = classBoundaries;
            gameState.classCounts = new Array(classBoundaries.length + 1).fill(0);
            gameState.roundsSinceLastOccurrence = new Array(classBoundaries.length + 1).fill(0);
            
            updateTallyDisplay();
            updateRoundsTallyDisplay();
            
        } catch (error) {
            console.error('Error loading class boundaries:', error);
            const tallyTableBody = document.getElementById('tallyTableBody');
            tallyTableBody.innerHTML = '<tr><td colspan="3">Error loading class boundaries</td></tr>';
        }
    }

    // Update tally display
    function updateTallyDisplay() {
        if (!elements.tallyTableBody) return;
        
        const classBoundaries = gameState.classBoundaries;
        const classCounts = gameState.classCounts;
        
        elements.tallyTableBody.innerHTML = '';
        
        if (classBoundaries.length === 0) {
            elements.tallyTableBody.innerHTML = '<tr><td colspan="3">Loading class boundaries...</td></tr>';
            return;
        }
        
        // Add a row for class 1 (0 to first boundary)
        const firstRow = document.createElement('tr');
        firstRow.innerHTML = `
            <td>1</td>
            <td>0 - ${classBoundaries[0]}</td>
            <td>${classCounts[0]}</td>
        `;
        elements.tallyTableBody.appendChild(firstRow);
        
        // Add rows for classes 2 to n-1 (between boundaries)
        for (let i = 1; i < classBoundaries.length; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${classBoundaries[i-1] + 0.01} - ${classBoundaries[i]}</td>
                <td>${classCounts[i]}</td>
            `;
            elements.tallyTableBody.appendChild(row);
        }
        
        // Add a row for the last class (above the last boundary)
        const lastRow = document.createElement('tr');
        lastRow.innerHTML = `
            <td>${classBoundaries.length + 1}</td>
            <td>${classBoundaries[classBoundaries.length - 1] + 0.01}+</td>
            <td>${classCounts[classBoundaries.length]}</td>
        `;
        elements.tallyTableBody.appendChild(lastRow);
        
        // Update rounds tally display as well
        updateRoundsTallyDisplay();
    }

    // Update rounds tally display
    function updateRoundsTallyDisplay() {
        if (!elements.roundsTallyTableBody) return;
        
        const classBoundaries = gameState.classBoundaries;
        const roundsSinceLastOccurrence = gameState.roundsSinceLastOccurrence;
        
        elements.roundsTallyTableBody.innerHTML = '';
        
        if (classBoundaries.length === 0) {
            elements.roundsTallyTableBody.innerHTML = '<tr><td colspan="3">Loading class boundaries...</td></tr>';
            return;
        }
        
        // Add a row for class 1 (0 to first boundary)
        const firstRow = document.createElement('tr');
        firstRow.innerHTML = `
            <td>1</td>
            <td>0 - ${classBoundaries[0]}</td>
            <td>${roundsSinceLastOccurrence[0]}</td>
        `;
        elements.roundsTallyTableBody.appendChild(firstRow);
        
        // Add rows for classes 2 to n-1 (between boundaries)
        for (let i = 1; i < classBoundaries.length; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${classBoundaries[i-1] + 0.01} - ${classBoundaries[i]}</td>
                <td>${roundsSinceLastOccurrence[i]}</td>
            `;
            elements.roundsTallyTableBody.appendChild(row);
        }
        
        // Add a row for the last class (above the last boundary)
        const lastRow = document.createElement('tr');
        lastRow.innerHTML = `
            <td>${classBoundaries.length + 1}</td>
            <td>${classBoundaries[classBoundaries.length - 1] + 0.01}+</td>
            <td>${roundsSinceLastOccurrence[classBoundaries.length]}</td>
        `;
        elements.roundsTallyTableBody.appendChild(lastRow);
    }

    // Initialize the game when the page loads
    initGame();
});