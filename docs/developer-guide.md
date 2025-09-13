# Developer Guide - Limbo Game

This guide provides technical information for developers who want to understand, modify, or extend the Limbo Game application.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Game Logic](#game-logic)
5. [Provably Fair System](#provably-fair-system)
6. [Client-Side Implementation](#client-side-implementation)
7. [Server-Side Implementation](#server-side-implementation)
8. [Development Setup](#development-setup)
9. [Testing](#testing)
10. [Extending the Application](#extending-the-application)
11. [Performance Considerations](#performance-considerations)
12. [Security Considerations](#security-considerations)

## Architecture Overview

The Limbo Game follows a client-server architecture with clear separation of concerns:

### Client-Side
- **Presentation Layer**: HTML and CSS for the user interface
- **Application Logic**: Vanilla JavaScript for game state management and user interactions
- **Animation System**: Custom animation engine for smooth multiplier animations

### Server-Side
- **API Layer**: Express.js for handling HTTP requests
- **Game Logic**: Core game mechanics and provably fair system
- **Cryptographic Module**: crypto.bch.js for generating verifiable random multipliers

### Data Flow
1. User places a bet through the web interface
2. Client sends bet parameters to the server
3. Server calculates multiplier using provably fair algorithm
4. Server returns game result to client
5. Client animates the multiplier and updates game state

## Project Structure

```
limbo-game/
├── public/                 # Static files served by Express
│   ├── index.html         # Main application HTML
│   ├── script.js          # Client-side JavaScript
│   └── style.css          # Application styles
├── docs/                  # Documentation
│   ├── api.md            # API documentation
│   ├── user-guide.md      # User guide
│   ├── developer-guide.md # Developer documentation
│   └── deployment.md     # Deployment instructions
├── crypto.bch.js         # Provably fair algorithm implementation
├── server.js             # Express server and API endpoints
├── package.json          # Project dependencies and scripts
└── README.md             # Project overview
```

## Core Components

### 1. Game State Management (`public/script.js`)

The client-side game state is managed through a central `gameState` object:

```javascript
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
    }
};
```

### 2. Animation System

The multiplier animation uses a custom easing function for smooth visual effects:

```javascript
// Exponential easing for natural animation
const easedProgress = 1 - Math.pow(1 - progress, 3);
currentMultiplier = 1.00 + (targetMultiplier - 1.00) * easedProgress;
```

### 3. API Handler (`server.js`)

The server implements RESTful endpoints for game operations:

```javascript
// Main game endpoint
app.post('/play', async (req, res) => {
    const { clientSeed, serverSeed, nonce, betAmount, targetMultiplier } = req.body;
    const multiplier = getMultiplier(parseInt(nonce), clientSeed, serverSeed);
    const won = multiplier >= parseFloat(targetMultiplier);
    const profit = won ? parseFloat(betAmount) * (parseFloat(targetMultiplier) - 1) : -parseFloat(betAmount);
    
    res.json({
        success: true,
        multiplier: multiplier,
        won: won,
        profit: profit,
        // ... additional fields
    });
});
```

### 4. Cryptographic Module (`crypto.bch.js`)

The provably fair algorithm implementation:

```javascript
function getMultiplier(nonce, clientSeed = '', serverSeed = '', houseEdge = 0.02) {
    // Generate HMAC-SHA256 hash
    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(`${clientSeed}:${nonce}:${currentRound}`);
    const buffer = hmac.digest();
    
    // Convert to float and calculate multiplier
    const float = bytesToFloat(buffer);
    const m = 100_000_000;
    const n = Math.floor(float * m) + 1;
    const crashPoint = Math.max((m / n) * (1 - houseEdge), 1);
    
    return Math.floor(crashPoint * 100) / 100;
}
```

## Game Logic

### Multiplier Calculation

The game multiplier is calculated using a cryptographically secure process:

1. **Seed Generation**: Client and server seeds are generated randomly
2. **Hashing**: Seeds and nonce are combined using HMAC-SHA256
3. **Conversion**: Hash is converted to a floating-point number
4. **Multiplier Calculation**: Float is converted to a multiplier with house edge

### Win/Loss Determination

A bet wins if the generated multiplier is equal to or greater than the target multiplier:

```javascript
const won = multiplier >= targetMultiplier;
const profit = won ? betAmount * (targetMultiplier - 1) : -betAmount;
```

### Auto Mode Logic

The auto mode implements a state machine for automated betting:

```javascript
const autoModeConfig = {
    baseBetAmount: betAmount,
    baseTargetMultiplier: targetMultiplier,
    rounds: rounds,
    stopProfit: stopProfit,
    stopLoss: stopLoss,
    betMultiplier: betMultiplier,
    maxBetMultiplier: maxBetMultiplier,
    autoAdjustTarget: autoAdjustTarget,
    currentRound: 0,
    currentBetAmount: betAmount,
    currentTargetMultiplier: targetMultiplier,
    consecutiveLosses: 0
};
```

## Provably Fair System

### Principles

The provably fair system ensures that:

1. **Transparency**: All game results can be verified
2. **Fairness**: Neither player nor operator can manipulate results
3. **Verifiability**: Players can independently verify game outcomes

### Implementation

The system uses HMAC-SHA256 with the following inputs:

- **Client Seed**: Generated on the client side
- **Server Seed**: Generated on the server side
- **Nonce**: Incremental counter for each bet

### Verification Process

Players can verify game results by:

1. Recording the client seed, server seed, and nonce
2. Using the same algorithm to recalculate the multiplier
3. Comparing the result with the original game outcome

## Client-Side Implementation

### DOM Management

The application uses a centralized DOM element reference system:

```javascript
const elements = {
    balance: document.getElementById('balance'),
    multiplierValue: document.getElementById('multiplierValue'),
    gameStatus: document.getElementById('gameStatus'),
    // ... other elements
};
```

### Event Handling

Event listeners are organized by functionality:

```javascript
// Tab switching
document.getElementById('manualTab').addEventListener('click', () => switchTab('manual'));
document.getElementById('autoTab').addEventListener('click', () => switchTab('auto'));

// Betting controls
elements.placeBet.addEventListener('click', placeBet);
// ... other event listeners
```

### Animation System

The animation system uses requestAnimationFrame for smooth rendering:

```javascript
function startGameAnimation(targetMultiplier) {
    const duration = Math.min(3000, Math.max(800, targetMultiplier * 200));
    const startTime = Date.now();
    
    const animationInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Calculate current multiplier with easing
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentMultiplier = 1.00 + (targetMultiplier - 1.00) * easedProgress;
        
        elements.multiplierValue.textContent = currentMultiplier.toFixed(2) + 'x';
        
        if (progress >= 1) {
            clearInterval(animationInterval);
            endGame(targetMultiplier);
        }
    }, 30);
}
```

## Server-Side Implementation

### Express Server Setup

The server uses Express with middleware for parsing and static file serving:

```javascript
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
```

### API Endpoints

The server implements several RESTful endpoints:

- `POST /play`: Main game endpoint
- `POST /generateSeeds`: Generate new seeds
- `POST /verify`: Verify game results

### Error Handling

The server includes comprehensive error handling:

```javascript
app.post('/play', (req, res) => {
    try {
        // Validate input
        if (!clientSeed || !serverSeed || nonce === undefined || !betAmount || !targetMultiplier) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Process game logic
        const multiplier = getMultiplier(parseInt(nonce), clientSeed, serverSeed);
        // ... rest of the logic
        
    } catch (error) {
        console.error('Error processing game round:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
```

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/limbo-game.git
cd limbo-game
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

### Development Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## Testing

### Manual Testing

1. **Game Functionality**: Place manual bets and verify outcomes
2. **Auto Mode**: Test various auto betting configurations
3. **Provably Fair**: Verify game results using the verification system
4. **Responsive Design**: Test on different screen sizes

### Automated Testing

Currently, the project does not include automated tests. Consider adding:

- Unit tests for the cryptographic module
- Integration tests for API endpoints
- End-to-end tests for game flows
- Performance tests for the animation system

## Extending the Application

### Adding New Game Modes

1. **Define Game Logic**: Implement the game mechanics in a new module
2. **Create UI Components**: Add HTML and CSS for the new mode
3. **Update Client Logic**: Extend the JavaScript to handle the new mode
4. **Add API Endpoints**: Create server endpoints if needed

### Modifying the Provably Fair Algorithm

To modify the provably fair system:

1. **Update crypto.bch.js**: Modify the `getMultiplier` function
2. **Update Verification**: Ensure the verification logic matches
3. **Update Documentation**: Document any changes to the algorithm

### Adding New Features

Consider the following when adding new features:

- **Backward Compatibility**: Ensure changes don't break existing functionality
- **Performance**: Monitor impact on animation performance and API response times
- **Security**: Review security implications of new features
- **Documentation**: Update all relevant documentation

## Performance Considerations

### Client-Side Performance

- **Animation Optimization**: Use requestAnimationFrame for smooth animations
- **DOM Updates**: Minimize DOM manipulations for better performance
- **Event Delegation**: Use event delegation for dynamic content
- **Memory Management**: Clean up event listeners and intervals

### Server-Side Performance

- **Response Time**: Keep API responses under 100ms
- **Memory Usage**: Monitor memory usage for long-running sessions
- **CPU Usage**: Optimize cryptographic operations
- **Scalability**: Consider load balancing for high traffic

### Animation Performance

The animation system is optimized for smooth performance:

```javascript
// Optimized animation loop
const animationInterval = setInterval(() => {
    // Calculate progress and update display
    // Use efficient easing functions
    // Clear interval when complete
}, 30); // Balance between smoothness and performance
```

## Security Considerations

### Client-Side Security

- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Use textContent instead of innerHTML when possible
- **CSRF Protection**: Consider implementing CSRF tokens for state-changing operations

### Server-Side Security

- **Input Sanitization**: Sanitize all incoming data
- **Rate Limiting**: Implement rate limiting for API endpoints
- **HTTPS**: Use HTTPS in production environments
- **Error Handling**: Don't expose sensitive information in error messages

### Cryptographic Security

- **Random Generation**: Use cryptographically secure random number generation
- **Seed Management**: Protect server seeds from unauthorized access
- **Algorithm Transparency**: Ensure the provably fair algorithm is transparent

### Production Considerations

For production deployment, consider:

1. **Environment Variables**: Use environment variables for configuration
2. **Logging**: Implement comprehensive logging
3. **Monitoring**: Set up application monitoring
4. **Backups**: Implement regular backup procedures
5. **Scaling**: Design for horizontal scaling if needed

## Contributing

When contributing to the Limbo Game:

1. **Follow Coding Standards**: Maintain consistent code style
2. **Write Tests**: Add tests for new functionality
3. **Update Documentation**: Keep documentation up to date
4. **Security Review**: Ensure changes don't introduce security vulnerabilities

## License

This project is licensed under the ISC License. See the LICENSE file for details.